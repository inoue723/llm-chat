import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { database } from "~/database/context";
import { messages } from "~/database/schema";
import type { Route } from "../+types/$chatId";

export async function action({ request, params }: Route.ActionArgs) {
  const { messages: uiMessages }: { messages: UIMessage[] } =
    await request.json();
  const db = database();
  const chatId = params.chatId;

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
        chatId,
        text: userMessageText,
        role: "user",
        modelId: "user",
      })
      .onConflictDoNothing()
      .returning({ id: messages.id });
  }

  const newMessageId = crypto.randomUUID();

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({
        type: "start",
        messageId: newMessageId,
      });

      const result = streamText({
        model: openai("gpt-4.1"),
        system: "You are a helpful assistant.",
        messages: convertToModelMessages(uiMessages),
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
