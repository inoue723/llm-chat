import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ChatSidebar } from "./chat-side-bar";

interface MobileSidebarProps {
  chats: Array<{
    id: string;
    title: string;
    timestamp: Date;
  }>;
  onNewChat: () => void;
}

export function MobileSidebar({
  chats,
  onNewChat,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <button
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsOpen(false);
            }
          }}
          tabIndex={0}
          type="button"
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative w-80 h-full">
          <Button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 bg-gray-700 hover:bg-gray-600 text-white p-1"
          >
            <X size={16} />
          </Button>
          <ChatSidebar
            chats={chats}
            onNewChat={onNewChat}
          />
        </div>
      </div>
    </>
  );
}
