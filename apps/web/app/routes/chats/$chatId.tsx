import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { eq } from "drizzle-orm";
import { SendIcon } from "lucide-react";
import { useEffect } from "react";
import { href } from "react-router";
import z from "zod/v4";
import { database } from "~/database/context";
import { chats, messages } from "~/database/schema";
import type { Route } from "./+types/$chatId";

const chatIdSchema = z.uuidv4();

export const loader = async ({ params }: Route.LoaderArgs) => {
  const db = database();
  const chatIdParsed = chatIdSchema.safeParse(params.chatId);

  if (!chatIdParsed.success) {
    throw new Response("Invalid chat ID", { status: 400 });
  }

  const chatId = chatIdParsed.data;

  const chat = await db.select().from(chats).where(eq(chats.id, chatId));

  if (chat.length === 0) {
    throw new Response("Chat not found", { status: 404 });
  }

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
    <>
      <div className="overflow-y-auto">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`group ${
                message.role === "user"
                  ? "bg-white dark:bg-gray-900"
                  : "bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="mx-auto max-w-4xl px-4 py-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {message.role === "user" ? "あ" : "AI"}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {message.role === "user" ? "あなた" : "アシスタント"}
                    </div>
                    <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                      {message.parts.map((part, index) =>
                        part.type === "text" ? (
                          <div
                            key={`${message.id}-part-${index}`}
                            className="whitespace-pre-wrap"
                          >
                            {part.text}
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {status === "streaming" && (
            <div className="bg-gray-50 dark:bg-gray-800">
              <div className="mx-auto max-w-4xl px-4 py-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
                      AI
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      アシスタント
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-4">
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
            className="relative"
          >
            <div className="relative flex items-center">
              <textarea
                name="message"
                placeholder="メッセージを入力..."
                className="flex-1 resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
                disabled={status !== "ready"}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const form = e.currentTarget.form;
                    if (form) {
                      const event = new Event("submit", {
                        cancelable: true,
                        bubbles: true,
                      });
                      form.dispatchEvent(event);
                    }
                  }
                }}
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
              />
              <button
                type="submit"
                disabled={status !== "ready"}
                className="absolute right-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <SendIcon />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
