/**
 * Clipboard actions for prompt, negative prompt, JSON, and summary.
 */
import { copyText } from "../clipboard.js";

/** Copies a requested prompt representation. */
export async function copyPromptPart(record, part) {
  const values = {
    prompt: record?.prompt,
    negative: record?.negativePrompt,
    json: record ? JSON.stringify(record, null, 2) : "",
    summary: record?.summary
  };
  return copyText(values[part] || "");
}

