import type { Route } from "./+types/$chatId";

export function meta() {
  return [
    { title: "LLM Chat App" },
    { name: "description", content: "Chat with various LLM models" },
  ];
}

export default function Chat({ loaderData }: Route.ComponentProps) {
  return <div>todo</div>;
}
