/**
 * Stable formatting helpers for prompts, summaries, and exports.
 */

/** Normalizes a value into display text. */
export function displayValue(value, fallback = "") {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value ?? fallback).trim();
}

/** Converts an identifier into a readable label. */
export function labelFromKey(value) {
  return displayValue(value).replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** Formats a prompt record as readable plain text. */
export function formatPromptText(record) {
  return [
    record.title,
    "",
    record.prompt,
    record.negativePrompt ? `\nNegative prompt:\n${record.negativePrompt}` : "",
    `\nProject summary:\n${record.summary}`
  ].filter(Boolean).join("\n");
}

