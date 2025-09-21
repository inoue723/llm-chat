import { SendIcon } from "lucide-react";
import { Form, redirect } from "react-router";
import { database } from "~/database/context";
import { chats, messages } from "~/database/schema";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "LLM Chat App" },
    { name: "description", content: "Chat with various LLM models" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const selectedModel = formData.get("model") as string;

  if (!message.trim()) {
    return { error: "メッセージを入力してください" };
  }

  if (!selectedModel) {
    return { error: "モデルを選択してください" };
  }

  const db = database();
  const newChat = await db
    .insert(chats)
    .values({
      title: message,
    })
    .returning({ id: chats.id });

  const chatId = newChat[0].id;

  await db.insert(messages).values({
    chatId,
    text: message,
    role: "user",
    modelId: selectedModel,
  });

  return redirect(`/chats/${chatId}?start=true`);
}

export default function Home({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-semibold text-foreground mb-3">
            LLM Chat
          </h1>
          <p className="text-lg text-muted-foreground">
            今日はどのようなお手伝いをしましょうか？
          </p>
        </div>

        <Form method="post" className="relative">
          <div className="space-y-4">
            <div className="relative">
              <label
                htmlFor="model"
                className="block text-sm font-medium text-foreground mb-2"
              >
                AIモデルを選択してください
              </label>
              <select
                name="model"
                required
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">モデルを選択...</option>
                <option value="claude-sonnet-4" selected>
                  Claude Sonnet 4
                </option>
                <option value="gpt-5">ChatGPT 5</option>
              </select>
            </div>

            <div className="relative">
              <textarea
                name="message"
                placeholder="メッセージを入力してください..."
                className="w-full resize-none rounded-2xl border border-border bg-input px-4 py-4 pr-12 text-foreground placeholder-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring shadow-sm"
                required
                // biome-ignore lint/a11y/noAutofocus: ここは許して
                autoFocus
                rows={4}
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
                      const event = new Event("submit", {
                        cancelable: true,
                        bubbles: true,
                      });
                      form.dispatchEvent(event);
                    }
                  }
                }}
              />
              <button
                type="submit"
                className="absolute bottom-3 right-3 rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <SendIcon />
              </button>
            </div>
          </div>

          {actionData?.error && (
            <div className="mt-2 text-red-600 text-sm">{actionData.error}</div>
          )}
        </Form>
      </div>
    </div>
  );
}
