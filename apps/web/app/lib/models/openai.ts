/**
 * OpenAI model IDs available through the OpenAI API
 * @see https://platform.openai.com/docs/models
 */

/**
 * All OpenAI model IDs
 */
export const openaiModelIds = ["gpt-5-2025-08-07"] as const;

export type OpenAIModelId = (typeof openaiModelIds)[number];
