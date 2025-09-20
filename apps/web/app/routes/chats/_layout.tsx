import { Outlet } from "react-router";
import { ChatStreamProvider } from "~/components/custom/chat-stream-provider";

export default function ChatsLayout() {
  return (
    <ChatStreamProvider>
      <Outlet />
    </ChatStreamProvider>
  );
}

