import { assertNever } from "../utils/assertNever";
import { type ClaudeModelId, claudeModelIds } from "./claude";
import { type GeminiModelId, geminiModelIds } from "./gemini";
import { type OpenAIModelId, openaiModelIds } from "./openai";

/**
 * All available model IDs across all providers
 */
export type ModelId = ClaudeModelId | GeminiModelId | OpenAIModelId;

/**
 * Model display information for UI
 */
export interface ModelOption {
  id: ModelId;
  name: string;
  provider: "Claude" | "OpenAI" | "Gemini";
}

export const allModelIds = [
  ...claudeModelIds,
  ...openaiModelIds,
  ...geminiModelIds,
];

/**
 * Get model display name by ID
 */
export function getModelProps(modelId: ModelId): {
  name: string;
  provider: string;
} {
  switch (modelId) {
    case "claude-sonnet-4-5-20250929":
      return { name: "Claude 4.5 Sonnet", provider: "Claude" };
    case "claude-opus-4-1-20250805":
      return { name: "Claude 4.1 Opus", provider: "Claude" };
    case "gpt-5-2025-08-07":
      return { name: "GPT-5", provider: "OpenAI" };
    case "gpt-5-pro-2025-10-06":
      return { name: "GPT-5 Pro", provider: "OpenAI" };
    case "gemini-2.5-pro":
      return { name: "Gemini 2.5 Pro", provider: "Gemini" };
    case "gemini-2.5-pro-preview-tts":
      return { name: "Gemini 2.5 Pro (Preview TTS)", provider: "Gemini" };
    default:
      return assertNever(modelId);
  }
}

// Re-export individual model IDs for convenience
export { claudeModelIds, geminiModelIds, openaiModelIds };
export type { ClaudeModelId, GeminiModelId, OpenAIModelId };
