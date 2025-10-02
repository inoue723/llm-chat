/**
 * OpenAI model IDs available through the OpenAI API
 * @see https://platform.openai.com/docs/models
 */

/**
 * GPT-4o series models
 */
export const gpt4oModelIds = [
  "gpt-4o",
  "gpt-4o-2024-08-06",
  "gpt-4o-2024-05-13",
  "chatgpt-4o-latest",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
  "gpt-4o-audio-preview",
  "gpt-4o-mini-audio-preview",
] as const;

/**
 * GPT-4 Turbo and GPT-4 models
 */
export const gpt4TurboModelIds = [
  "gpt-4-turbo",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-0125-preview",
  "gpt-4-1106-preview",
] as const;

/**
 * GPT-3.5 Turbo models
 */
export const gpt35TurboModelIds = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-1106",
] as const;

/**
 * GPT-4.1 series models (2025)
 */
export const gpt41ModelIds = [
  "gpt-4.1-2025-04-14",
  "gpt-4.1-mini-2025-04-14",
  "gpt-4.1-nano-2025-04-14",
] as const;

/**
 * GPT-5 series models (2025)
 */
export const gpt5ModelIds = [
  "gpt-5-2025-08-07",
] as const;

/**
 * O-series reasoning models
 */
export const oSeriesModelIds = [
  "o1",
  "o1-mini",
  "o3-mini",
  "o3-2025-04-16",
  "o4-mini-2025-04-16",
] as const;

/**
 * All OpenAI model IDs
 */
export const openaiModelIds = [
  ...gpt4oModelIds,
  ...gpt4TurboModelIds,
  ...gpt35TurboModelIds,
  ...gpt41ModelIds,
  ...gpt5ModelIds,
  ...oSeriesModelIds,
] as const;

export type OpenAIModelId = (typeof openaiModelIds)[number];
export type GPT4oModelId = (typeof gpt4oModelIds)[number];
export type GPT4TurboModelId = (typeof gpt4TurboModelIds)[number];
export type GPT35TurboModelId = (typeof gpt35TurboModelIds)[number];
export type GPT41ModelId = (typeof gpt41ModelIds)[number];
export type GPT5ModelId = (typeof gpt5ModelIds)[number];
export type OSeriesModelId = (typeof oSeriesModelIds)[number];
