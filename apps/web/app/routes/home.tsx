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

  if (!message.trim()) {
    return { error: "メッセージを入力してください" };
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
    modelId: "user", // TODO: modelidはtable分けたい
  });

  return redirect(`/chats/${chatId}?start=true`);
}

export default function Home({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            LLM Chat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            今日はどのようなお手伝いをしましょうか？
          </p>
        </div>

        <Form method="post" className="relative">
          <div className="relative">
            <textarea
              name="message"
              placeholder="メッセージを入力してください..."
              className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-4 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 shadow-sm"
              required
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
              className="absolute bottom-3 right-3 rounded-lg bg-gray-900 dark:bg-gray-100 p-2 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </div>

          {actionData?.error && (
            <div className="mt-2 text-red-600 text-sm">{actionData.error}</div>
          )}
        </Form>
      </div>
    </div>
  );
}
