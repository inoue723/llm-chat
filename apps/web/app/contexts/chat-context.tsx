import { useChat as useAISDKChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { href, useNavigate } from "react-router";

interface ChatContextType {
  chatId: string | null;
  setChatId: (chatId: string | null) => void;
  modelId: string | null;
  setModelId: (modelId: string | null) => void;
  messages: ReturnType<typeof useAISDKChat>["messages"];
  sendMessage: ReturnType<typeof useAISDKChat>["sendMessage"];
  status: ReturnType<typeof useAISDKChat>["status"];
  regenerate: ReturnType<typeof useAISDKChat>["regenerate"];
  error: ReturnType<typeof useAISDKChat>["error"];
  setMessages: ReturnType<typeof useAISDKChat>["setMessages"];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const navigate = useNavigate();

  const chat = useAISDKChat({
    id: chatId ?? undefined,
    transport: new DefaultChatTransport({
      api: href("/chats/messages/create"),
    }),
    generateId: () => crypto.randomUUID(),
    experimental_throttle: 50,
  });

  return (
    <ChatContext.Provider
      value={{
        chatId,
        setChatId,
        modelId,
        setModelId,
        messages: chat.messages,
        sendMessage: chat.sendMessage,
        status: chat.status,
        regenerate: chat.regenerate,
        error: chat.error,
        setMessages: chat.setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
