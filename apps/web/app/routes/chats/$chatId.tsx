import type { UIMessage } from "ai";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import z from "zod/v4";
import { database } from "~/database/context";
import { chats, messages } from "~/database/schema";
import type { Route } from "./+types/$chatId";
import { useChatStream } from "~/components/custom/chat-stream-provider";
import { ChatShell } from "~/components/custom/chat-shell";

const chatIdSchema = z.uuidv4();

export const loader = async ({ params }: Route.LoaderArgs) => {
  const db = database();
  const chatIdParsed = chatIdSchema.safeParse(params.chatId);

  if (!chatIdParsed.success) {
    throw new Response("Invalid chat ID", { status: 400 });
  }

  const chatId = chatIdParsed.data;

  const chat = await db.select().from(chats).where(eq(chats.id, chatId));

  if (chat.length === 0) {
    throw new Response("Chat not found", { status: 404 });
  }

  const dbMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);

  const uiMessages: UIMessage[] = dbMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    parts: [{ type: "text", text: msg.text }],
  }));

  return {
    messages: uiMessages,
  };
};

export default function Chat({ params, loaderData }: Route.ComponentProps) {
  const { setActiveChat } = useChatStream();

  useEffect(() => {
    setActiveChat(params.chatId, loaderData.messages as UIMessage[], {
      start: false,
    });
  }, [params.chatId, loaderData.messages, setActiveChat]);

  return <ChatShell />;
}
