import { data } from "react-router";
import { database } from "~/database/context";
import { chats, messages } from "~/database/schema";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const message = (formData.get("message") as string) ?? "";
  const model = (formData.get("model") as string) ?? "";

  if (!message.trim() || !model) {
    return data({ error: "invalid request" }, { status: 400 });
  }

  const db = database();
  const newChat = await db
    .insert(chats)
    .values({ title: message })
    .returning({ id: chats.id });

  const chatId = newChat[0].id;

  await db.insert(messages).values({
    chatId,
    text: message,
    role: "user",
    modelId: model,
  });

  return { chatId };
}

