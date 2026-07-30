/**
 * Reusable accessible image-gallery cards and incremental rendering.
 */

/** Creates one clearly labeled demo image card. */
export function createImageCard(record) {
  const article = document.createElement("article");
  article.className = "image-card";
  article.dataset.imageId = record.id;
  const artwork = document.createElement("div");
  artwork.className = "demo-artwork";
  artwork.style.background = record.artwork.artwork;
  artwork.setAttribute("role", "img");
  artwork.setAttribute("aria-label", record.artwork.alt);
  const demoLabel = document.createElement("span");
  demoLabel.textContent = "Demo Image";
  const providerLabel = document.createElement("small");
  providerLabel.textContent = "Generated using Mock Provider";
  artwork.append(demoLabel, providerLabel);
  const copy = document.createElement("div");
  copy.className = "image-card__copy";
  const title = document.createElement("strong");
  title.textContent = record.title;
  const meta = document.createElement("small");
  meta.textContent = `${record.studio} · ${record.artStyle} · ${(record.generationTime / 1000).toFixed(1)}s`;
  copy.append(title, meta);
  const actions = document.createElement("div");
  actions.className = "image-card__actions";
  [
    ["favorite", record.favorite ? "♥" : "♡", `${record.favorite ? "Remove from" : "Add to"} favorites`],
    ["download", "↓", "Download demo image"],
    ["collection", "＋", "Move to collection"],
    ["delete", "×", "Delete demo image"]
  ].forEach(([action, label, aria]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.imageAction = action;
    button.setAttribute("aria-label", aria);
    if (action === "favorite") button.setAttribute("aria-pressed", String(record.favorite));
    button.textContent = label;
    actions.append(button);
  });
  article.append(artwork, copy, actions);
  return article;
}

/** Renders gallery results in idle-sized batches. */
export function renderImageGallery(records, root, { batchSize = 12 } = {}) {
  root.replaceChildren();
  if (!records.length) {
    const empty = document.createElement("div");
    empty.className = "gallery-empty";
    const title = document.createElement("strong");
    title.textContent = "No demo images found";
    const copy = document.createElement("small");
    copy.textContent = "Generate artwork or change the gallery filters.";
    empty.append(title, copy);
    root.append(empty);
    return;
  }
  let index = 0;
  const renderBatch = () => {
    const fragment = document.createDocumentFragment();
    records.slice(index, index + batchSize).forEach((record) => fragment.append(createImageCard(record)));
    root.append(fragment);
    index += batchSize;
    if (index < records.length) (globalThis.requestIdleCallback || ((callback) => setTimeout(callback, 16)))(renderBatch);
  };
  renderBatch();
}
