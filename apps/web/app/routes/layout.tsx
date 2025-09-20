import { Outlet, useNavigate } from "react-router";
import { desc } from "drizzle-orm";
import { ChatSidebar } from "~/components/custom/chat-side-bar";
import { MobileSidebar } from "~/components/custom/mobile-side-bar";
import { database } from "~/database/context";
import { chats } from "~/database/schema";
import type { Route } from "./+types/layout";

export const loader = async () => {
  const db = database();
  const chatsList = await db
    .select({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt,
    })
    .from(chats)
    .orderBy(desc(chats.createdAt));

  return {
    chats: chatsList.map((chat) => ({
      id: chat.id,
      title: chat.title,
      timestamp: new Date(chat.createdAt),
    })),
  };
};

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { chats } = loaderData;
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate("/");
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ChatSidebar chats={chats} onNewChat={handleNewChat} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar chats={chats} onNewChat={handleNewChat} />

      <div className="flex h-screen w-full justify-center py-8 overflow-y-auto ">
        <div className="w-4xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
