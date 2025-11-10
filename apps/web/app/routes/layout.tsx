import { desc } from "drizzle-orm";
import { Suspense } from "react";
import { Await, Outlet, useNavigate } from "react-router";
import { ChatSidebar } from "~/components/custom/chat-side-bar";
import { MobileSidebar } from "~/components/custom/mobile-side-bar";
import { database } from "~/database/context";
import { chats } from "~/database/schema";
import type { Route } from "./+types/layout";

async function getChats() {
  const db = database();
  const chatsList = await db
    .select({
      id: chats.id,
      title: chats.title,
      createdAt: chats.createdAt,
    })
    .from(chats)
    .orderBy(desc(chats.createdAt));

  return chatsList.map((chat) => ({
    id: chat.id,
    title: chat.title,
    timestamp: new Date(chat.createdAt),
  }));
}

export const loader = async () => {
  return {
    chats: getChats(),
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
      <Suspense fallback={<SidebarSkeleton />}>
        <Await resolve={chats}>
          {(resolvedChats) => (
            <>
              {/* Desktop sidebar */}
              <div className="hidden md:block">
                <ChatSidebar chats={resolvedChats} onNewChat={handleNewChat} />
              </div>

              {/* Mobile sidebar */}
              <MobileSidebar chats={resolvedChats} onNewChat={handleNewChat} />
            </>
          )}
        </Await>
      </Suspense>

      <div className="flex h-screen w-full justify-center py-8 overflow-y-auto ">
        <div className="w-4xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const SKELETON_ITEMS = ["a", "b", "c", "d", "e"] as const;

function SidebarSkeleton() {
  return (
    <>
      {/* Desktop skeleton */}
      <div className="hidden md:block w-64 lg:w-64 md:w-56 sm:w-48 bg-sidebar border-r border-border flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-border">
          <div className="w-full h-10 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {SKELETON_ITEMS.map((id) => (
            <div
              key={id}
              className="h-16 bg-muted/30 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </>
  );
}
