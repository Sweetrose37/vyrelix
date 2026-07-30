/**
 * Shared UI feedback: toasts, dialogs, bottom sheets, and saved-list rendering.
 */
import { showToast as showComponentToast } from "./components/toast.js";
import { openModal, closeModal } from "./components/modals.js";
import { openBottomSheet, closeBottomSheet } from "./components/bottomSheet.js";
import { createEmptyState } from "./components/loading.js";
import { renderInBatches } from "./components/cards.js";

export function showToast(message, type = "success") {
  return showComponentToast(message, type);
}

export function openDialog(title, copy, { destructive = false } = {}) {
  openModal(destructive ? "confirm" : "info", {
    title,
    copy,
    destructive,
    action: destructive ? "clear-storage" : "",
    confirmLabel: destructive ? "Clear data" : "Continue"
  });
}

export function closeDialog() {
  closeModal();
}

export function openSheet() {
  openBottomSheet();
}

export function closeSheet() {
  closeBottomSheet();
}

export function renderSaved(items, container) {
  if (!items.length) {
    const hasQuery = Boolean(document.querySelector("#saved-search")?.value.trim());
    container.replaceChildren(createEmptyState(hasQuery ? "search" : "saved"));
    return;
  }
  renderInBatches(items, (item) => {
    const article = document.createElement("article");
    const icon = document.createElement("span");
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    const subtitle = document.createElement("small");
    const remove = document.createElement("button");
    article.className = "card saved-item";
    article.dataset.kind = item.kind;
    icon.className = "card-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = item.kind === "character" ? "✦" : "⌁";
    title.textContent = item.title;
    subtitle.textContent = item.subtitle;
    copy.append(title, subtitle);
    remove.type = "button";
    remove.dataset.deleteId = item.id;
    remove.dataset.deleteKind = item.kind;
    remove.setAttribute("aria-label", `Delete ${item.title}`);
    remove.textContent = "×";
    article.append(icon, copy, remove);
    return article;
  }, container);
}
