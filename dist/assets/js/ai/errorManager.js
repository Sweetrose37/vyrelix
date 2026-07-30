/**
 * Normalizes provider failures into premium, user-friendly messages.
 */
const MESSAGES = Object.freeze({
  PROVIDER_MISSING: "No provider is available. Mock Provider has been selected.",
  API_KEY_MISSING: "This provider needs an API key. Switch to Mock Provider to continue offline.",
  CANCELLED: "Generation cancelled. Your prompt is still safe.",
  OFFLINE: "The selected provider is offline. Mock Provider remains available.",
  TIMEOUT: "Generation took too long. Please try again.",
  UNKNOWN: "Generation could not be completed. Please try again."
});

/** Converts unknown exceptions into a stable application error. */
export function normalizeAIError(error) {
  const message = String(error?.message || "");
  const code = error?.name === "AbortError" || /cancel/i.test(message) ? "CANCELLED"
    : /api key/i.test(message) ? "API_KEY_MISSING"
      : /provider.*missing/i.test(message) ? "PROVIDER_MISSING"
        : /offline/i.test(message) ? "OFFLINE"
          : /timeout/i.test(message) ? "TIMEOUT" : "UNKNOWN";
  return { code, message: MESSAGES[code], cause: error };
}

