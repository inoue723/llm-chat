import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { Route } from "./+types/chats.$chatId.send";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  model: "gpt-4" | "claude-3" | "gemini-pro";
  messages: ChatMessage[];
}

function getModelConfig(model: string) {
  switch (model) {
    case "gpt-4":
      return openai("gpt-4");
    case "claude-3":
      return anthropic("claude-3-sonnet-20240229");
    case "gemini-pro":
      return google("models/gemini-pro");
    default:
      throw new Error(`Unsupported model: ${model}`);
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai("gpt-4.1"),
    system: "You are a helpful assistant.",
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
