/**
 * OpenAI model IDs available through the OpenAI API
 * @see https://platform.openai.com/docs/models
 */

/**
 * GPT-5 series models (2025)
 */
export const gpt5ModelIds = ["gpt-5-2025-08-07"] as const;

/**
 * All OpenAI model IDs
 */
export const openaiModelIds = [...gpt5ModelIds] as const;

export type OpenAIModelId = (typeof openaiModelIds)[number];
