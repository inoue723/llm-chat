/**
 * Gemini model IDs available through the Google AI API
 * @see https://ai.google.dev/gemini-api/docs/models/gemini
 */

/**
 * Stable Gemini models for production use
 */
export const geminiModelIds = [
  "gemini-2.5-pro",
  "gemini-2.5-pro-preview-tts",
] as const;

export type GeminiModelId = (typeof geminiModelIds)[number];
