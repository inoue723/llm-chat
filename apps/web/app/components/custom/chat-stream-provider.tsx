import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { href } from "react-router";

type ChatStreamContextValue = {
  activeChatId: string | null;
  messages: UIMessage[];
  status: ReturnType<typeof useChat>["status"];
  error: unknown;
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
  regenerate: ReturnType<typeof useChat>["regenerate"];
  setActiveChat: (
    chatId: string,
    initialMessages: UIMessage[],
    options?: { start?: boolean }
  ) => void;
};

const ChatStreamContext = createContext<ChatStreamContextValue | undefined>(
  undefined,
);

export function ChatStreamProvider({ children }: { children: React.ReactNode }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [shouldStart, setShouldStart] = useState(false);

  const transport = useMemo(() => {
    if (!activeChatId) return null;
    return new DefaultChatTransport({
      api: href("/chats/:chatId/messages/create", { chatId: activeChatId }),
    });
  }, [activeChatId]);

  const chat = useChat({
    id: activeChatId ?? undefined,
    transport: transport ?? undefined,
    messages: initialMessages,
    generateId: () => crypto.randomUUID(),
    experimental_throttle: 50,
  });

  // When instructed, start streaming if last message is user
  useEffect(() => {
    if (!shouldStart) return;
    if (chat.status !== "ready") return;
    const last = chat.messages[chat.messages.length - 1];
    if (last && last.role === "user") {
      chat.regenerate();
      setShouldStart(false);
    }
  }, [shouldStart, chat.status, chat.messages, chat.regenerate]);

  const setActiveChat = (
    chatId: string,
    seed: UIMessage[],
    options?: { start?: boolean },
  ) => {
    setActiveChatId(chatId);
    setInitialMessages(seed);
    setShouldStart(Boolean(options?.start));
  };

  const value: ChatStreamContextValue = {
    activeChatId,
    messages: chat.messages,
    status: chat.status,
    error: chat.error,
    sendMessage: chat.sendMessage,
    regenerate: chat.regenerate,
    setActiveChat,
  };

  return (
    <ChatStreamContext.Provider value={value}>
      {children}
    </ChatStreamContext.Provider>
  );
}

export function useChatStream() {
  const ctx = useContext(ChatStreamContext);
  if (!ctx) throw new Error("useChatStream must be used within ChatStreamProvider");
  return ctx;
}

