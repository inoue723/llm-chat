import { useRef, useEffect } from "react";
import { SendIcon, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useChatStream } from "~/components/custom/chat-stream-provider";
import { getMarkdown } from "~/components/custom/markdown";
import { MemoizedMarkdown } from "~/components/custom/memorized-markdown";

export function ChatShell() {
  const { messages, status, sendMessage } = useChatStream();
  const theme = useTheme();
  const Markdown = getMarkdown(theme.resolvedTheme || "dark");

  const spacerRef = useRef<HTMLDivElement>(null);
  const latestUserMessageRef = useRef<HTMLDivElement>(null);
  const nextAssistantMessageRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic height + scroll control
  useEffect(() => {
    const updateSpacerHeight = () => {
      if (
        spacerRef.current &&
        latestUserMessageRef.current &&
        chatContainerRef.current
      ) {
        const chatContainerHeight = chatContainerRef.current.offsetHeight;
        const userMessageHeight = latestUserMessageRef.current.offsetHeight;

        let nextAssistantHeight = 0;
        if (nextAssistantMessageRef.current) {
          nextAssistantHeight = nextAssistantMessageRef.current.offsetHeight;
        }

        const availableHeight =
          chatContainerHeight - userMessageHeight - nextAssistantHeight;
        spacerRef.current.style.height = `${Math.max(availableHeight, 0)}px`;
      }
    };

    const handleNewMessage = () => {
      if (messages.length > 0 && latestUserMessageRef.current) {
        const lastMessage = messages[messages.length - 1];
        const secondLastMessage = messages[messages.length - 2];

        if (
          lastMessage.role === "user" &&
          (!secondLastMessage || secondLastMessage.role === "assistant")
        ) {
          updateSpacerHeight();
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

    updateSpacerHeight();
    window.addEventListener("resize", updateSpacerHeight);
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
        {status === "streaming" && messages[messages.length - 1]?.role !== "assistant" && (
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

        <div ref={spacerRef} aria-hidden="true" />
      </div>

      <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              const message = (formData.get("message") as string) || "";
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

