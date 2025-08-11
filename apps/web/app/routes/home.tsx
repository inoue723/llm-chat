import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import React, { useState } from "react";
import { href } from "react-router";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "LLM Chat App" },
    { name: "description", content: "Chat with various LLM models" },
  ];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: href("/chats/:chatId/send", { chatId: "new" }),
    }),
  });
  const [input, setInput] = useState("");

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.parts.map((part, index) =>
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            part.type === "text" ? <span key={index}>{part.text}</span> : null,
          )}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "ready"}
          placeholder="Say something..."
        />
        <button type="submit" disabled={status !== "ready"}>
          Submit
        </button>
      </form>
    </>
  );
}
