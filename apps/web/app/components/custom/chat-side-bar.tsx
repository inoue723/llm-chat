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
  onNewChat: () => void;
}

export function ChatSidebar({ chats, onNewChat }: ChatSidebarProps) {
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
    <div className="w-64 lg:w-64 md:w-56 sm:w-48 bg-sidebar border-r border-border flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground justify-center"
        >
          <Plus size={16} />
          新しいチャット
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageSquare size={32} />
            <p className="mt-2 text-sm">チャットがありません</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <NavLink
                key={chat.id}
                className={({ isActive }) =>
                  `group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                      : "hover:bg-secondary"
                  }`
                }
                to={`/chats/${chat.id}`}
              >
                {({ isActive }) => (
                  <>
                    <MessageSquare size={16} className="mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {chat.title}
                      </p>
                      <p
                        className={`text-xs ${
                          isActive
                            ? "text-primary-foreground/90"
                            : "text-secondary-foreground"
                        }`}
                      >
                        {chat.timestamp.toLocaleDateString("ja-JP", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, chat.id)}
                      className={`absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive`}
                      aria-label="チャットを削除"
                    >
                      <Trash2
                        size={14}
                        className="text-destructive-foreground"
                      />
                    </button>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
