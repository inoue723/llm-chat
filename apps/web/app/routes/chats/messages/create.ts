import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { eq } from "drizzle-orm";
import { database } from "~/database/context";
import { messages } from "~/database/schema";
import type { Route } from "../+types/$chatId";

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

  const selectedModel = firstUserMessage[0].modelId;

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

  const getModel = (modelId: string) => {
    switch (modelId) {
      case "claude-sonnet-4":
        return anthropic("claude-sonnet-4-20250514");
      case "gpt-5":
        return openai("gpt-5-chat-latest");
      default:
        throw new Error(`Invalid model: ${modelId}`);
    }
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
