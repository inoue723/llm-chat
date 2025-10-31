import { useChat as useAISDKChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { href, useNavigate, useNavigation } from "react-router";
import type { CustomUIMessage } from "~/lib/customUIMessage";

type CustomAISDKChat = ReturnType<typeof useAISDKChat<CustomUIMessage>>;

interface ChatContextType {
  chatId: string;
  setChatId: (chatId: string) => void;
  messages: CustomAISDKChat["messages"];
  sendMessage: CustomAISDKChat["sendMessage"];
  status: CustomAISDKChat["status"];
  regenerate: CustomAISDKChat["regenerate"];
  error: CustomAISDKChat["error"];
  setMessages: CustomAISDKChat["setMessages"];
  // startNewChat: ({ message, modelId }: { message: string, modelId: string }) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatId, setChatId] = useState<string>(crypto.randomUUID());
  console.log("Current chatId:", chatId);
  const navigate = useNavigate();
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.location?.pathname === "/") {
      setChatId(crypto.randomUUID());
    }
  }, [navigation.location?.pathname]);

  const chat = useAISDKChat<CustomUIMessage>({
    id: chatId,
    transport: new DefaultChatTransport({
      api: href("/chats/messages/create"),
    }),
    generateId: () => crypto.randomUUID(),
    experimental_throttle: 50,
    onData: (data) => {
      console.log("Received message chunk:", data);
      if (data.type === "data-chatCreated") {
        navigate(`/chats/${(data.data as any).chatId}`);
      }
    },
  });

  return (
    <ChatContext.Provider
      value={{
        chatId,
        setChatId,
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
