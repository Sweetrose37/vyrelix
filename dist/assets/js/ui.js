/**
 * Shared UI feedback: toasts, dialogs, bottom sheets, and saved-list rendering.
 */
import { escapeHTML } from "../utilities/helpers.js";

const toastRegion = document.querySelector("#toast-region");
const modal = document.querySelector("#modal-backdrop");
const sheet = document.querySelector("#sheet-backdrop");

export function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

export function openDialog(title, copy, { destructive = false } = {}) {
  document.querySelector("#dialog-title").textContent = title;
  document.querySelector("#dialog-copy").textContent = copy;
  document.querySelector("#confirm-clear").classList.toggle("is-hidden", !destructive);
  modal.classList.remove("is-hidden");
  document.querySelector("[data-close-modal]").focus();
}

export function closeDialog() {
  modal.classList.add("is-hidden");
}

export function openSheet() {
  sheet.classList.remove("is-hidden");
  sheet.querySelector("[data-close-sheet]").focus();
}

export function closeSheet() {
  sheet.classList.add("is-hidden");
}

export function renderSaved(items, container) {
  if (!items.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon" aria-hidden="true">✦</div><h3>Nothing saved yet</h3><p class="caption">Characters and prompt drafts you save will appear here.</p></div>`;
    return;
  }
  container.innerHTML = items.map((item) => `
    <article class="card saved-item" data-kind="${escapeHTML(item.kind)}">
      <span class="card-icon" aria-hidden="true">${item.kind === "character" ? "✦" : "⌁"}</span>
      <span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.subtitle)}</small></span>
      <button type="button" data-delete-id="${escapeHTML(item.id)}" data-delete-kind="${escapeHTML(item.kind)}" aria-label="Delete ${escapeHTML(item.title)}">×</button>
    </article>`).join("");
}
