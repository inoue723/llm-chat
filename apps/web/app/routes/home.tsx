import { database } from "~/database/context";
import * as schema from "~/database/schema";

import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  let title = formData.get("title");
  if (typeof title !== "string") {
    return { guestBookError: "Title is required" };
  }

  title = title.trim();
  if (!title) {
    return { chatsError: "Title is required" };
  }

  const db = database();
  try {
    await db.insert(schema.chats).values({ title });
  } catch (error) {
    return { chatsError: "Error adding to guest book" };
  }
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = database();

  const chats = await db.query.chats.findMany({
    columns: {
      id: true,
      title: true,
    },
  });

  return {
    chats,
    message: context.VALUE_FROM_EXPRESS,
  };
}

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  return (
    <Welcome
      chats={loaderData.chats}
      chatsError={actionData?.chatsError}
      message={loaderData.message}
    />
  );
}
