import { eq } from "drizzle-orm";
import { Loader2, SendIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import z from "zod/v4";
import { getMarkdown } from "~/components/custom/markdown";
import { MemoizedMarkdown } from "~/components/custom/memorized-markdown";
import { useChatContext } from "~/contexts/chat-context";
import { database } from "~/database/context";
import { chats, messages } from "~/database/schema";
import type { CustomUIMessage } from "~/lib/customUIMessage";
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

  const uiMessages: CustomUIMessage[] = dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    parts: [{ type: "text", text: msg.text }],
  }));

  return {
    messages: uiMessages,
  };
};

export default function Chat({ params, loaderData }: Route.ComponentProps) {
  const { messages, sendMessage, status, setMessages, setChatId } =
    useChatContext();

  // 初回マウント時にchatIdとメッセージを設定
  useEffect(() => {
    setChatId(params.chatId);
    setTimeout(() => {
      setMessages(loaderData.messages);
    }, 1);
  }, [params.chatId, loaderData.messages, setChatId, setMessages]);

  const theme = useTheme();
  const Markdown = getMarkdown(theme.resolvedTheme || "dark");

  const spacerRef = useRef<HTMLDivElement>(null);
  const latestUserMessageRef = useRef<HTMLDivElement>(null);
  const nextAssistantMessageRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 動的な高さ調整とスクロール制御（順序保証）
  useEffect(() => {
    const updateSpacerHeight = () => {
      if (
        spacerRef.current &&
        latestUserMessageRef.current &&
        chatContainerRef.current
      ) {
        // チャットコンテナの実際の高さ（スクロール分を除く）を取得
        const chatContainerHeight = chatContainerRef.current.offsetHeight;
        const userMessageHeight = latestUserMessageRef.current.offsetHeight;

        // 次のアシスタントメッセージの実際の高さを取得（refが存在する場合のみ）
        let nextAssistantHeight = 0;
        if (nextAssistantMessageRef.current) {
          nextAssistantHeight = nextAssistantMessageRef.current.offsetHeight;
        }

        const availableHeight =
          chatContainerHeight - userMessageHeight - nextAssistantHeight;
        spacerRef.current.style.height = `${Math.max(availableHeight, 0)}px`;
        // console.log("Chat container height:", chatContainerHeight);
        // console.log("User message height:", userMessageHeight);
        // console.log("Next assistant height:", nextAssistantHeight);
        // console.log("Available height:", availableHeight);
        // console.log("Spacer height set to:", spacerRef.current.style.height);
      }
    };

    const handleNewMessage = () => {
      if (messages.length > 0 && latestUserMessageRef.current) {
        const lastMessage = messages[messages.length - 1];
        const secondLastMessage = messages[messages.length - 2];

        // 新しいユーザーメッセージが追加された場合
        if (
          lastMessage.role === "user" &&
          (!secondLastMessage || secondLastMessage.role === "assistant")
        ) {
          // 1. まず高さ調整を実行
          updateSpacerHeight();

          // 2. 次にスクロール実行（高さ調整後に確実に実行するため少し遅延）
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              latestUserMessageRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            });
          });
        }
      }
    };

    // 初期実行とリサイズ時の高さ調整
    updateSpacerHeight();
    window.addEventListener("resize", updateSpacerHeight);

    // メッセージ変更時の処理
    handleNewMessage();

    return () => window.removeEventListener("resize", updateSpacerHeight);
  }, [messages]);

  return (
    <div ref={chatContainerRef} className="h-full flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        {messages.map((message, index) => {
          const isLatestUserMessage =
            message.role === "user" &&
            (index === messages.length - 1 ||
              messages[index + 1]?.role === "assistant");

          // 最新ユーザーメッセージの次のアシスタントメッセージかどうか判定
          const isNextAssistantMessage =
            message.role === "assistant" &&
            index > 0 &&
            messages[index - 1]?.role === "user" &&
            (index - 1 === messages.length - 2 ||
              index - 1 === messages.length - 1);

          return (
            <div
              key={message.id}
              ref={
                isLatestUserMessage
                  ? latestUserMessageRef
                  : isNextAssistantMessage
                    ? nextAssistantMessageRef
                    : null
              }
              data-role={message.role}
              className={`group ${
                message.role === "user" ? "bg-card" : "bg-muted"
              }`}
            >
              <div className="mx-auto max-w-4xl px-4 py-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        message.role === "user"
                          ? "bg-blue-400 text-white"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {message.role === "user" ? "あ" : "AI"}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 overflow-hidden">
                    <div className="font-semibold text-foreground">
                      {message.role === "user" ? "あなた" : "アシスタント"}
                    </div>
                    <div>
                      {message.parts.map((part) =>
                        part.type === "text" ? (
                          <MemoizedMarkdown
                            key={`${message.id}-text`}
                            id={message.id}
                            content={part.text}
                            Markdown={Markdown}
                          />
                        ) : null,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {status === "streaming" &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="bg-secondary">
              <div className="mx-auto max-w-4xl px-4 py-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
                      AI
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground mb-2">
                      アシスタント
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* 動的な高さ調整用のスペーサー */}
        <div ref={spacerRef} aria-hidden="true" />
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background rounded-lg shadow-sm">
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
                className="flex-1 resize-none rounded-2xl border border-border bg-input px-4 py-3 pr-12 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
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
                className="absolute right-2 rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-50 disabled:hover:bg-transparent"
              >
                {status === "ready" ? (
                  <SendIcon />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
