/**
 * Deterministic prompt cleanup without external services.
 */

/** Removes repeated phrases and repairs spacing and punctuation. */
export function optimizePrompt(value) {
  const phrases = String(value || "").split(/[.;]+/).map((part) => part.trim()).filter(Boolean);
  const seen = new Set();
  const unique = phrases.filter((phrase) => {
    const key = phrase.toLocaleLowerCase().replace(/[^a-z0-9 ]/g, "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.join(". ").replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1").replace(/([,.;:])(?=\S)/g, "$1 ").trim().replace(/[.,;:]*$/, ".");
}

/** Removes duplicate comma-separated negative prompt terms. */
export function optimizeNegativePrompt(value) {
  return [...new Map(String(value || "").split(",").map((item) => item.trim()).filter(Boolean).map((item) => [item.toLocaleLowerCase(), item])).values()].join(", ");
}

