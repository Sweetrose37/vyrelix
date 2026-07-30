/**
 * Shared loading-state helper that preserves button labels and ARIA state.
 */
export function setButtonLoading(button, loading, label = "Loading") {
  if (loading) {
    button.dataset.originalLabel = button.innerHTML;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    button.setAttribute("aria-label", label);
    button.disabled = true;
  } else {
    if (button.dataset.originalLabel) button.innerHTML = button.dataset.originalLabel;
    button.classList.remove("is-loading");
    button.removeAttribute("aria-busy");
    button.removeAttribute("aria-label");
    button.disabled = false;
    delete button.dataset.originalLabel;
  }
}

export function initializeLoading() {
  document.querySelectorAll(".skeleton-card").forEach((card) => card.setAttribute("aria-hidden", "true"));
}

const EMPTY_STATES = Object.freeze({
  saved: ["✦", "Nothing saved yet", "Characters and prompt drafts you save will appear here."],
  characters: ["✦", "No characters", "Your original character collection will appear here."],
  images: ["▧", "No images", "Future generated images will appear here."],
  favorites: ["♡", "No favorites", "Double tap or use the heart button to save favorites."],
  history: ["↶", "No history", "Recent local activity will appear here."],
  search: ["⌕", "No search results", "Try a different name or category."]
});

export function createEmptyState(type = "saved") {
  const [icon, title, copy] = EMPTY_STATES[type] || EMPTY_STATES.saved;
  const root = document.createElement("div");
  const iconElement = document.createElement("div");
  const heading = document.createElement("h3");
  const paragraph = document.createElement("p");
  root.className = "empty-state";
  iconElement.className = "empty-state__icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = icon;
  heading.textContent = title;
  paragraph.className = "caption";
  paragraph.textContent = copy;
  root.append(iconElement, heading, paragraph);
  return root;
}
