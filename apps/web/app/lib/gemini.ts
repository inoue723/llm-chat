/**
 * Gemini model IDs available through the Google AI API
 * @see https://ai.google.dev/gemini-api/docs/models/gemini
 */

/**
 * Stable Gemini models for production use
 */
export const geminiStableModelIds = [
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
] as const;

/**
 * Preview Gemini models (early access features)
 */
export const geminiPreviewModelIds = [
  "gemini-2.5-pro-preview-tts",
  "gemini-2.5-flash-preview-09-2025",
  "gemini-2.5-flash-lite-preview-09-2025",
  "gemini-2.5-flash-image-preview",
  "gemini-2.5-flash-native-audio-preview-09-2025",
  "gemini-2.5-flash-preview-native-audio-dialog",
  "gemini-2.5-flash-preview-05-20",
  "gemini-live-2.5-flash-preview",
  "gemini-2.5-flash-preview-tts",
  "gemini-2.0-flash-preview-image-generation",
  "gemini-2.0-flash-live-001",
] as const;

/**
 * Experimental Gemini models (cutting-edge features)
 */
export const geminiExperimentalModelIds = [
  "gemini-2.5-flash-exp-native-audio-thinking-dialog",
  "gemini-2.0-flash-exp",
] as const;

/**
 * All Gemini model IDs
 */
export const geminiModelIds = [
  ...geminiStableModelIds,
  ...geminiPreviewModelIds,
  ...geminiExperimentalModelIds,
] as const;

export type GeminiModelId = (typeof geminiModelIds)[number];
export type GeminiStableModelId = (typeof geminiStableModelIds)[number];
export type GeminiPreviewModelId = (typeof geminiPreviewModelIds)[number];
export type GeminiExperimentalModelId = (typeof geminiExperimentalModelIds)[number];
