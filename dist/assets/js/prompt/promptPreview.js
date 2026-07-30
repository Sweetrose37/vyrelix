/**
 * Accessible prompt-preview rendering and metrics.
 */

/** Calculates prompt metrics without DOM access. */
export function getPromptMetrics(prompt = "") {
  const text = String(prompt).trim();
  const words = text ? text.split(/\s+/).length : 0;
  return { words, characters: text.length, estimate: words < 80 ? "Concise" : words < 160 ? "Detailed" : "Extended" };
}

/** Updates the dedicated preview page with one DOM write batch. */
export function renderPromptPreview(record, root) {
  if (!root) return;
  const metrics = getPromptMetrics(record?.prompt);
  root.querySelector("[data-preview-prompt]").textContent = record?.prompt || "Generate a prompt to see it here.";
  root.querySelector("[data-preview-negative]").textContent = record?.negativePrompt || "Disabled";
  root.querySelector("[data-preview-summary]").textContent = record?.summary || "No project selected.";
  root.querySelector("[data-preview-character]").textContent = record?.characterSummary || "No character summary available.";
  root.querySelector("[data-prompt-length]").textContent = metrics.estimate;
  root.querySelector("[data-word-count]").textContent = String(metrics.words);
  root.querySelector("[data-character-count]").textContent = String(metrics.characters);
}

