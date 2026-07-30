/**
 * Reusable card factories and keyboard activation for interactive card surfaces.
 */
import { escapeHTML } from "../../utilities/helpers.js";

export function createCard({ title, subtitle = "", kind = "standard", actionLabel = "" }) {
  const article = document.createElement("article");
  const safeKind = String(kind).replace(/[^a-z0-9-]/gi, "").toLowerCase() || "standard";
  article.className = `card card--${safeKind}`;
  article.innerHTML = `<h3>${escapeHTML(title)}</h3>${subtitle ? `<p class="caption">${escapeHTML(subtitle)}</p>` : ""}`;
  if (actionLabel) article.setAttribute("aria-label", actionLabel);
  return article;
}

export function initializeCards({ openModal }) {
  document.addEventListener("keydown", (event) => {
    const card = event.target.closest("[data-gesture-card]");
    if (!card || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    openModal("info");
  });
}

export function renderInBatches(items, createItem, container, { batchSize = 20 } = {}) {
  const token = `${Date.now()}-${Math.random()}`;
  container.dataset.renderToken = token;
  container.replaceChildren();
  let index = 0;
  const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(() => callback({ timeRemaining: () => 8 }), 0));

  function renderBatch(deadline) {
    if (container.dataset.renderToken !== token) return;
    const fragment = document.createDocumentFragment();
    let rendered = 0;
    while (index < items.length && rendered < batchSize && deadline.timeRemaining() > 1) {
      fragment.append(createItem(items[index], index));
      index += 1;
      rendered += 1;
    }
    container.append(fragment);
    if (index < items.length) schedule(renderBatch);
  }

  renderBatch({ timeRemaining: () => 50 });
}
