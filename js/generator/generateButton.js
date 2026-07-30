/**
 * Accessible generate-button state and haptic-ready feedback.
 */

/** Emits optional haptic feedback without requiring a native bridge. */
function haptic(pattern = 12) {
  globalThis.navigator?.vibrate?.(pattern);
  document.dispatchEvent(new CustomEvent("vyrelix:haptic", { detail: { pattern } }));
}

/** Updates generate-button state and accessible labels. */
export function setGenerateState(button, state, message = "") {
  if (!button) return;
  const labels = { idle: "Generate prompt", loading: "Generating prompt", success: "Prompt generated" };
  button.classList.toggle("is-loading", state === "loading");
  button.classList.toggle("is-success", state === "success");
  button.setAttribute("aria-busy", String(state === "loading"));
  button.querySelector("[data-generate-label]").textContent = message || labels[state] || labels.idle;
  if (state === "success") haptic([15, 35, 15]);
}

/** Enables the button only when required values are valid. */
export function updateGenerateAvailability(button, valid) {
  if (button) button.disabled = !valid;
}

