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
import { messages } from "~/database/schema";
import type { ModelId } from "~/lib/models";
import type { Route } from "../+types/$chatId";
import { getMockChunks } from "./mockMessage";

export async function action({ request, params }: Route.ActionArgs) {
  const { messages: uiMessages }: { messages: UIMessage[] } =
    await request.json();
  const db = database();
  const chatId = params.chatId;

  const firstUserMessage = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt)
    .limit(1);

  const selectedModel = firstUserMessage[0].modelId as ModelId;

  // ユーザーの最新メッセージをDBに保存
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
      })
      .onConflictDoNothing()
      .returning({ id: messages.id });
  }

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
    // 開発環境の場合はモックモデルを使用
    if (process.env.NODE_ENV === "development") {
      return getMockModel();
    }

    // Claude models
    if (modelId === "claude-sonnet-4-5-20250929") {
      return anthropic("claude-sonnet-4-5-20250929");
    }
    if (modelId === "claude-opus-4-1-20250805") {
      return anthropic("claude-opus-4-1-20250805");
    }

    // OpenAI models
    if (modelId === "gpt-5-2025-08-07") {
      return openai("gpt-5-2025-08-07");
    }

    // Gemini models
    if (modelId === "gemini-2.5-pro") {
      return google("gemini-2.5-pro");
    }
    if (modelId === "gemini-2.5-pro-preview-tts") {
      return google("gemini-2.5-pro-preview-tts");
    }

    throw new Error(`Invalid model: ${modelId}`);
  };

  // See https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence#option-2-setting-ids-with-createuimessagestream
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({
        type: "start",
        messageId: newMessageId,
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
