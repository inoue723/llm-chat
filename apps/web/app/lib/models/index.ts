import { claudeModelIds, type ClaudeModelId } from "./claude";
import { geminiModelIds, type GeminiModelId } from "./gemini";
import { openaiModelIds, type OpenAIModelId } from "./openai";

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

/**
 * All available models with display information
 */
export const availableModels: ModelOption[] = [
  // Claude models
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude 4.5 Sonnet",
    provider: "Claude",
  },
  {
    id: "claude-opus-4-1-20250805",
    name: "Claude 4.1 Opus",
    provider: "Claude",
  },
  // OpenAI models
  {
    id: "gpt-5-2025-08-07",
    name: "GPT-5",
    provider: "OpenAI",
  },
  // Gemini models
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Gemini",
  },
  {
    id: "gemini-2.5-pro-preview-tts",
    name: "Gemini 2.5 Pro (Preview TTS)",
    provider: "Gemini",
  },
] as const;

/**
 * Get model display name by ID
 */
export function getModelName(modelId: ModelId): string {
  const model = availableModels.find((m) => m.id === modelId);
  return model ? model.name : modelId;
}

/**
 * Get model provider by ID
 */
export function getModelProvider(
  modelId: ModelId,
): "Claude" | "OpenAI" | "Gemini" | undefined {
  const model = availableModels.find((m) => m.id === modelId);
  return model?.provider;
}

// Re-export individual model IDs for convenience
export { claudeModelIds, geminiModelIds, openaiModelIds };
export type { ClaudeModelId, GeminiModelId, OpenAIModelId };
