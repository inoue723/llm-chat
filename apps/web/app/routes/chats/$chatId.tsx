import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import { href } from "react-router";
import { database } from "~/database/context";
import { messages } from "~/database/schema";
import type { Route } from "./+types/$chatId";

export const loader = async ({ params }: Route.LoaderArgs) => {
  const db = database();
  const chatId = params.chatId;

  const dbMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);

  const uiMessages: UIMessage[] = dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    parts: [{ type: "text", text: msg.text }],
  }));

  return {
    messages: uiMessages,
  };
};

export default function Chat({ params, loaderData }: Route.ComponentProps) {
  const { messages, sendMessage, status, regenerate } = useChat({
    id: params.chatId,
    transport: new DefaultChatTransport({
      api: href("/chats/:chatId/messages/create", { chatId: params.chatId }),
    }),
    messages: loaderData.messages,
  });

  // 新規チャット開始時にAI応答を自動開始
  useEffect(() => {
    const url = new URL(window.location.href);
    const shouldStart = url.searchParams.get("start") === "true";
    
    if (shouldStart && messages.length > 0 && status === "ready") {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user") {
        regenerate();
        // クエリパラメータを削除
        url.searchParams.delete("start");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [messages, status, regenerate]);

  useEffect(() => {
    console.log("messages", messages);
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              }`}
            >
              {message.parts.map((part, index) =>
                part.type === "text" ? (
                  <span key={`${message.id}-part-${index}`}>{part.text}</span>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const message = formData.get("message") as string;
            if (message.trim()) {
              sendMessage({ text: message });
              form.reset();
            }
          }}
          className="flex space-x-2"
        >
          <input
            name="message"
            placeholder="メッセージを入力..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={status !== "ready"}
          />
          <button
            type="submit"
            disabled={status !== "ready"}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            送信
          </button>
        </form>
      </div>
    </div>
  );
}
