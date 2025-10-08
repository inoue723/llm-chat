/**
 * Claude model IDs available through the Anthropic API
 * @see https://docs.claude.com/en/docs/about-claude/models
 */

export const claudeModelIds = [
  "claude-sonnet-4-5-20250929",
  "claude-opus-4-1-20250805",
] as const;

export type ClaudeModelId = (typeof claudeModelIds)[number];
