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
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            LLM Chat
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            AIとチャットを始めましょう
          </p>
        </div>

        <Form method="post" className="space-y-4">
          <div>
            <textarea
              name="message"
              placeholder="メッセージを入力してください..."
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {actionData?.error && (
            <div className="text-red-600 text-sm">{actionData.error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            チャットを開始
          </button>
        </Form>
      </div>
    </div>
  );
}
