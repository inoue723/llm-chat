import { useFetcher, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { SendIcon } from "lucide-react";
import { useChatStream } from "~/components/custom/chat-stream-provider";
import type { UIMessage } from "ai";

export default function ChatsIndex() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { setActiveChat } = useChatStream();
  const [model, setModel] = useState("claude-sonnet-4");
  const [message, setMessage] = useState("");

  const isSubmitting = fetcher.state !== "idle";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    fetcher.submit(
      { message: text, model },
      {
        method: "post",
        action: "/chats/create",
        encType: "application/x-www-form-urlencoded",
      },
    );

    // fetcher.submit doesn't return a Response; use fetcher.data after transition
  };

  // When fetcher completed, bootstrap provider and navigate
  useEffect(() => {
    if (fetcher.data && (fetcher.data as any).chatId && message) {
      const chatId = (fetcher.data as any).chatId as string;
      const userMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: message }],
      };
      setActiveChat(chatId, [userMessage], { start: true });
      setMessage("");
      navigate(`/chats/${chatId}`);
    }
  }, [fetcher.data, message, navigate, setActiveChat]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            新しいチャット
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            メッセージを入力して開始します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div className="space-y-4">
            <div className="relative">
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                AIモデルを選択してください
              </label>
              <select
                name="model"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
              >
                <option value="">モデルを選択...</option>
                <option value="claude-sonnet-4">Claude Sonnet 4</option>
                <option value="gpt-5">ChatGPT 5</option>
              </select>
            </div>

            <div className="relative">
              <textarea
                name="message"
                placeholder="メッセージを入力してください..."
                className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-4 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 shadow-sm"
                required
                autoFocus
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onInput={(e) => {
                  const target = e.currentTarget;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const form = e.currentTarget.form;
                    if (form) {
                      form.requestSubmit();
                    }
                  }
                }}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute bottom-3 right-3 rounded-lg bg-gray-900 dark:bg-gray-100 p-2 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
