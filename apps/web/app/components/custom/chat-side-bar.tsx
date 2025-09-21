import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { NavLink, useFetcher, useLocation, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";

interface Chat {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChat?: string;
  onNewChat: () => void;
}

export function ChatSidebar({
  chats,
  activeChat,
  onNewChat,
}: ChatSidebarProps) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("このチャットを削除してもよろしいですか？")) {
      fetcher.submit(null, {
        method: "POST",
        action: `/chats/${chatId}/delete`,
      });

      // 削除したチャットを表示中の場合はホームに遷移
      if (location.pathname === `/chats/${chatId}`) {
        navigate("/");
      }
    }
  };

  return (
    <div className="w-64 lg:w-64 md:w-56 sm:w-48 bg-gray-900 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} />
          新しいチャット
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <MessageSquare size={32} />
            <p className="mt-2 text-sm">チャットがありません</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <NavLink
                key={chat.id}
                className={`group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  activeChat === chat.id
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
                to={`/chats/${chat.id}`}
              >
                <MessageSquare size={16} className="mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{chat.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {chat.timestamp.toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, chat.id)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                  aria-label="チャットを削除"
                >
                  <Trash2
                    size={14}
                    className="text-red-600 dark:text-red-400"
                  />
                </button>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
