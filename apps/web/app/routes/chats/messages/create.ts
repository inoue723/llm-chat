import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { Route } from "../+types/$chatId";

export async function action({ request, params }: Route.ActionArgs) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai("gpt-4.1"),
    system: "You are a helpful assistant.",
    messages: convertToModelMessages(messages),
    onFinish: async (message) => {
      // TODO: save to database
      console.log("onfinish===============", message, params.chatId);
    },
  });

  return result.toUIMessageStreamResponse();
}
