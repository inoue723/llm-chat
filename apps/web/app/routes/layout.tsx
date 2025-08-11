import { Outlet } from "react-router";
import { ChatSidebar } from "~/components/custom/chat-side-bar";
import { MobileSidebar } from "~/components/custom/mobile-side-bar";
import type { Route } from "./+types/layout";

export const loader = async () => {
  return { chats: [] };
};

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { chats } = loaderData;

  const handleNewChat = () => {
    console.log("newChat");
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <ChatSidebar chats={chats} onNewChat={handleNewChat} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar chats={chats} onNewChat={handleNewChat} />

      <div className="flex h-screen w-full justify-center py-8">
        <div className="overflow-y-auto w-4xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
