import { eq } from "drizzle-orm";
import { database } from "~/database/context";
import { chats } from "~/database/schema";
import type { Route } from "./+types/$chatId.delete";

export async function action({ params }: Route.ActionArgs) {
  const chatId = params.chatId;

  if (!chatId) {
    throw new Response("Chat ID is required", { status: 400 });
  }

  const db = database();
  await db.delete(chats).where(eq(chats.id, chatId));

  return {
    success: true,
  };
}
