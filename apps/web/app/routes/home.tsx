import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { ChatSidebar } from "~/components/custom/chat-side-bar";
import { ChatSpace } from "~/components/custom/chat-space";
import { MobileSidebar } from "~/components/custom/mobile-side-bar";
import type { ChatMessage as APIChatMessage } from "~/lib/api";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "LLM Chat App" },
    { name: "description", content: "Chat with various LLM models" },
  ];
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | undefined>();
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const fetcher = useFetcher();

  const isLoading = fetcher.state === "submitting";

  const currentChat = chats.find((chat) => chat.id === activeChat);
  const messages = currentChat?.messages || [];

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: "新しいチャット",
      timestamp: new Date(),
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChatId);
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChat(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(undefined);
    }
  };

  const handleSendMessage = async (content: string) => {
    let currentChatId = activeChat;

    if (!currentChatId) {
      const newChatId = `chat-${Date.now()}`;
      const newChat: Chat = {
        id: newChatId,
        title: content.slice(0, 50),
        timestamp: new Date(),
        messages: [],
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChatId);
      currentChatId = newChatId;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      content,
      role: "user",
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title:
                chat.messages.length === 0 ? content.slice(0, 50) : chat.title,
            }
          : chat,
      ),
    );

    const currentChat = chats.find((c) => c.id === currentChatId);
    const chatHistory: APIChatMessage[] = [
      ...(currentChat?.messages || []).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content },
    ];

    fetcher.submit(
      {
        model: selectedModel,
        messages: JSON.stringify(chatHistory),
      },
      {
        method: "POST",
        action: `/chats/${currentChatId}/send`,
      },
    );
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  // fetcherのレスポンスを処理
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && activeChat) {
      const response = fetcher.data;

      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: response.data.id,
          content: response.data.content,
          role: "assistant",
          timestamp: new Date(response.data.timestamp),
        };

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat
              ? { ...chat, messages: [...chat.messages, assistantMessage] }
              : chat,
          ),
        );
      } else {
        const errorMessage: Message = {
          id: `msg-${Date.now()}-error`,
          content: `エラーが発生しました: ${response.error || "不明なエラー"}`,
          role: "assistant",
          timestamp: new Date(),
        };

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat
              ? { ...chat, messages: [...chat.messages, errorMessage] }
              : chat,
          ),
        );
      }
    }
  }, [fetcher.state, fetcher.data, activeChat]);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar
        chats={chats}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      <ChatSpace
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
      />
    </div>
  );
}
