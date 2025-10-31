import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  simulateReadableStream,
  streamText,
  type UIMessage,
} from "ai";
import { MockLanguageModelV2 } from "ai/test";
import { eq } from "drizzle-orm";
import { database } from "~/database/context";
import { chats, messages } from "~/database/schema";
import type { CustomUIMessage } from "~/lib/customUIMessage";
import type { ModelId } from "~/lib/models";
import { assertNever } from "~/lib/utils/assertNever";
import { getMockChunks } from "../chats/messages/mockMessage";

export async function action({ request }: { request: Request }) {
  const body = await request.json();
  console.log("Request body:", body);
  const {
    messages: uiMessages,
    id: chatId,
  }: { messages: CustomUIMessage[]; id: string; modelId?: ModelId } = body;

  const db = database();
  let selectedModel = body.messages[0].metadata?.modelId;
  console.log("Received chatId:", chatId);
  console.log("Received modelId:", selectedModel);
  const requestDate = new Date();

  const createChat = async (chatId: string): Promise<string | undefined> => {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
    });

    // chatIdがない場合は新規チャットを作成
    if (!chat) {
      // 最初のユーザーメッセージからタイトルを生成
      const firstUserMessage = uiMessages.find((msg) => msg.role === "user");
      const title = firstUserMessage
        ? firstUserMessage.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join(" ")
        : "新しいチャット";

      const result = await db
        .insert(chats)
        .values({
          id: chatId,
          title,
        })
        .returning({ id: chats.id });

      return result[0]?.id;
    }
  };

  // モデルIDが指定されていない場合は、DBから取得
  if (!selectedModel) {
    const firstUserMessage = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt)
      .limit(1);

    if (firstUserMessage.length === 0) {
      throw new Response("Model ID is required for new chats", { status: 400 });
    }

    selectedModel = firstUserMessage[0].modelId as ModelId;
  }

  // ユーザーの最新メッセージをDBに保存
  const createUserMessage = async () => {
    console.log("Saving user message to DB");
    const lastUserMessage = uiMessages[uiMessages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      const userMessageText = lastUserMessage.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join(" ");

      await db
        .insert(messages)
        .values({
          id: lastUserMessage.id,
          chatId,
          text: userMessageText,
          role: "user",
          modelId: selectedModel,
          createdAt: requestDate.toISOString(),
        })
        .onConflictDoNothing()
        .returning({ id: messages.id });
    }
  };

  // DBとresponseのメッセージIDを一致させるために、事前にメッセージIDを生成しておく
  const newMessageId = crypto.randomUUID();

  const getMockModel = () => {
    return new MockLanguageModelV2({
      doStream: async () => ({
        stream: simulateReadableStream({
          chunks: getMockChunks(newMessageId),
          initialDelayInMs: 50,
          chunkDelayInMs: 80,
        }),
      }),
    });
  };

  const getModel = (modelId: ModelId) => {
    // MOCK_LLM_REQUESTが"true"の場合はモックモデルを使用
    if (process.env.MOCK_LLM_REQUEST === "true") {
      return getMockModel();
    }

    switch (modelId) {
      case "claude-sonnet-4-5-20250929":
        return anthropic("claude-sonnet-4-5-20250929");
      case "claude-opus-4-1-20250805":
        return anthropic("claude-opus-4-1-20250805");
      case "gpt-5-2025-08-07":
        return openai("gpt-5-2025-08-07");
      case "gpt-5-pro-2025-10-06":
        return openai("gpt-5-pro-2025-10-06");
      case "gemini-2.5-pro":
        return google("gemini-2.5-pro");
      case "gemini-2.5-pro-preview-tts":
        return google("gemini-2.5-pro-preview-tts");
      default:
        return assertNever(modelId);
    }
  };

  // See https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence#option-2-setting-ids-with-createuimessagestream
  const stream = createUIMessageStream<CustomUIMessage>({
    execute: ({ writer }) => {
      writer.write({
        type: "start",
        messageId: newMessageId,
      });

      createChat(chatId)
        .then((data) => {
          if (data) {
            writer.write({ type: "data-chatCreated", data: { chatId } });
          }
        })
        .then(() => {
          createUserMessage();
        });

      const result = streamText({
        model: getModel(selectedModel),
        system: "You are a helpful assistant.",
        messages: convertToModelMessages(uiMessages),
        // model情報も保存したいのでここで保存
        onFinish: async (message) => {
          // AIの回答をDBに保存
          await db.insert(messages).values({
            id: newMessageId,
            chatId,
            text: message.text,
            role: "assistant",
            modelId: message.response.modelId,
          });
        },
      });

      writer.merge(result.toUIMessageStream({ sendStart: false }));
    },
    originalMessages: uiMessages,
  });

  return createUIMessageStreamResponse({ stream });
}
