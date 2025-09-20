import { Link } from "react-router";

export function meta() {
  return [
    { title: "LLM Chat App" },
    { name: "description", content: "Chat with various LLM models" },
  ];
}

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-8 text-center">
        <div className="text-center">
          <h1 className="text-5xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            LLM Chat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            新しいチャットを始めましょう。
          </p>
        </div>
        <div>
          <Link
            to="/chats"
            className="inline-flex items-center rounded-lg bg-gray-900 dark:bg-gray-100 px-4 py-2 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            新しいチャットを開始
          </Link>
        </div>
      </div>
    </div>
  );
}
