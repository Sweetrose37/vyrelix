/**
 * Accessible selector-card factory shared by every visual dataset.
 */
export function createAssetPreview(item, { selected = false, favorite = false, multi = false } = {}) {
  const button = document.createElement("button");
  const swatch = document.createElement("span");
  const copy = document.createElement("span");
  const name = document.createElement("strong");
  const category = document.createElement("small");
  const favoriteButton = document.createElement("button");
  button.type = "button";
  button.className = "visual-asset";
  button.dataset.visualAsset = item.id;
  button.setAttribute("aria-pressed", String(selected));
  button.setAttribute("aria-label", `${selected ? "Selected" : "Select"} ${item.name}, ${item.category}`);
  swatch.className = "visual-asset__swatch";
  if (item.value) swatch.style.setProperty("--asset-color", item.value);
  else swatch.textContent = item.name.slice(0, 1);
  swatch.setAttribute("aria-hidden", "true");
  name.textContent = item.name;
  category.textContent = item.category;
  copy.append(name, category);
  button.append(swatch, copy);
  favoriteButton.type = "button";
  favoriteButton.className = "visual-asset__favorite";
  favoriteButton.dataset.visualFavorite = item.id;
  favoriteButton.setAttribute("aria-label", `${favorite ? "Remove" : "Add"} ${item.name} ${favorite ? "from" : "to"} visual favorites`);
  favoriteButton.setAttribute("aria-pressed", String(favorite));
  favoriteButton.textContent = favorite ? "♥" : "♡";
  const wrapper = document.createElement("div");
  wrapper.className = `visual-asset-row${multi ? " visual-asset-row--multi" : ""}`;
  wrapper.append(button, favoriteButton);
  return wrapper;
}
