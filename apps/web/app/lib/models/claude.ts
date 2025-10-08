/**
 * Claude model IDs available through the Anthropic API
 * @see https://docs.claude.com/en/docs/about-claude/models
 */

export const claudeModelIds = [
  "claude-sonnet-4-5-20250929",
  "claude-sonnet-4-20250514",
  "claude-3-7-sonnet-20250219",
  "claude-opus-4-1-20250805",
  "claude-opus-4-20250514",
  "claude-3-5-haiku-20241022",
  "claude-3-haiku-20240307",
] as const;

/**
 * Claude model aliases that point to specific versions
 */
// export const claudeModelAliases = {
//   "claude-sonnet-4-5": "claude-sonnet-4-5-20250929",
//   "claude-opus-4-1": "claude-opus-4-1-20250805",
//   "claude-3-5-haiku-latest": "claude-3-5-haiku-20241022",
// } as const;

export type ClaudeModelId = (typeof claudeModelIds)[number];
// export type ClaudeModelAlias = keyof typeof claudeModelAliases;
