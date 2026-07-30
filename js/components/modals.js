/**
 * Accessible modal controller supporting confirmation, delete, status, and preview variants.
 */
import { focusableWithin, trapFocusWithin } from "../../utilities/helpers.js";

const modal = document.querySelector("#modal-backdrop");
const dialog = document.querySelector("#dialog");
const title = document.querySelector("#dialog-title");
const copy = document.querySelector("#dialog-copy");
const icon = document.querySelector("#dialog-icon");
const preview = document.querySelector("#dialog-preview");
const confirmButton = document.querySelector("#confirm-clear");
let restoreFocus = null;

const presets = Object.freeze({
  confirm: { title: "Confirm action", copy: "Review this action before continuing.", icon: "?", destructive: false, showConfirm: true, action: "demo-confirm", confirmLabel: "Confirm" },
  delete: { title: "Delete this item?", copy: "This example demonstrates a destructive confirmation pattern.", icon: "×", destructive: true, action: "demo-delete", confirmLabel: "Delete example" },
  success: { title: "Success", copy: "The action completed exactly as expected.", icon: "✓", destructive: false },
  error: { title: "Something went wrong", copy: "The error pattern keeps the next step clear and readable.", icon: "!", destructive: false },
  info: { title: "Component information", copy: "Every Vyrelix surface shares tokens, focus behavior, and motion rules.", icon: "i", destructive: false },
  image: { title: "Image preview", copy: "A reusable preview surface for future generated imagery.", icon: "⌁", destructive: false, preview: true },
  prompt: { title: "Prompt preview", copy: "A reusable preview surface for future prompt content.", icon: "⌘", destructive: false }
});

export function openModal(variant = "info", overrides = {}) {
  const preset = { ...(presets[variant] || presets.info), ...overrides };
  restoreFocus = document.activeElement;
  dialog.dataset.variant = variant;
  dialog.dataset.action = preset.action || "";
  title.textContent = preset.title;
  copy.textContent = preset.copy;
  icon.textContent = preset.icon;
  preview.classList.toggle("is-hidden", !preset.preview);
  confirmButton.classList.toggle("is-hidden", !(preset.destructive || preset.showConfirm));
  confirmButton.classList.toggle("button--danger", Boolean(preset.destructive));
  confirmButton.classList.toggle("button--primary", !preset.destructive);
  confirmButton.textContent = preset.confirmLabel || "Continue";
  modal.classList.remove("is-hidden", "is-closing");
  document.body.classList.add("has-overlay");
  focusableWithin(dialog)[0]?.focus();
}

export function closeModal() {
  if (modal.classList.contains("is-hidden")) return;
  modal.classList.add("is-closing");
  window.setTimeout(() => {
    modal.classList.add("is-hidden");
    modal.classList.remove("is-closing");
    document.body.classList.remove("has-overlay");
    restoreFocus?.focus?.();
  }, 180);
}

export function initializeModals() {
  modal.addEventListener("pointerdown", (event) => {
    if (event.target === modal) closeModal();
  });
  modal.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("is-hidden")) closeModal();
    if (!modal.classList.contains("is-hidden")) trapFocusWithin(event, dialog);
  });
}
