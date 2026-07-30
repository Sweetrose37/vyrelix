/**
 * Versioned local persistence for UVE presets, favorites, recent selections, palettes, and styles.
 */
export const VISUAL_STORAGE_KEYS = Object.freeze({
  presets: "vyrelix.v3.visual-presets",
  favorites: "vyrelix.v3.visual-favorites",
  recent: "vyrelix.v3.visual-recent",
  palettes: "vyrelix.v3.visual-palettes",
  styles: "vyrelix.v3.visual-styles"
});

export class VisualStorage {
  constructor(adapter = globalThis.localStorage) {
    this.adapter = adapter;
  }

  read(collection, fallback = []) {
    const key = VISUAL_STORAGE_KEYS[collection];
    if (!key || !this.adapter) return structuredClone(fallback);
    try {
      const value = JSON.parse(this.adapter.getItem(key) || "null");
      return value === null || (Array.isArray(fallback) && !Array.isArray(value)) ? structuredClone(fallback) : value;
    } catch {
      return structuredClone(fallback);
    }
  }

  write(collection, value) {
    const key = VISUAL_STORAGE_KEYS[collection];
    if (!key || !this.adapter) throw new Error(`Unknown visual storage collection: ${collection}.`);
    this.adapter.setItem(key, JSON.stringify(value));
    return value;
  }

  update(collection, updater, fallback = []) {
    return this.write(collection, updater(this.read(collection, fallback)));
  }

  toggleFavorite(assetId) {
    const favorites = new Set(this.read("favorites"));
    favorites.has(assetId) ? favorites.delete(assetId) : favorites.add(assetId);
    this.write("favorites", [...favorites]);
    return favorites.has(assetId);
  }

  touch(assetId, limit = 50) {
    return this.update("recent", (ids) => [assetId, ...ids.filter((id) => id !== assetId)].slice(0, limit));
  }

  saveUnique(collection, value, limit = 100) {
    return this.update(collection, (items) => [value, ...items.filter((item) => item.id !== value.id)].slice(0, limit));
  }
}
