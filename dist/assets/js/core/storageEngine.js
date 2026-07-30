/**
 * Expandable, corruption-tolerant local storage adapter for Universal Creation Engine collections.
 */
import { STORAGE_KEYS } from "../../utilities/constants.js";

export const STORAGE_COLLECTIONS = Object.freeze({
  projects: STORAGE_KEYS.projects,
  characters: STORAGE_KEYS.characters,
  creatures: STORAGE_KEYS.creatures,
  worlds: STORAGE_KEYS.worlds,
  scenes: STORAGE_KEYS.scenes,
  objects: STORAGE_KEYS.objects,
  logos: STORAGE_KEYS.logos,
  favorites: STORAGE_KEYS.favorites,
  templates: STORAGE_KEYS.templates,
  recent: STORAGE_KEYS.recent,
  history: STORAGE_KEYS.uceHistory,
  settings: STORAGE_KEYS.uceSettings,
  favoriteTags: STORAGE_KEYS.favoriteTags,
  archive: STORAGE_KEYS.archive
});

export class StorageEngine {
  constructor(adapter = globalThis.localStorage) {
    this.adapter = adapter;
    this.collections = new Map(Object.entries(STORAGE_COLLECTIONS));
  }

  registerCollection(name, key = `vyrelix.v2.${name}`) {
    if (!name || this.collections.has(name)) return this;
    this.collections.set(name, key);
    return this;
  }

  read(name, fallback = []) {
    const key = this.collections.get(name);
    if (!key || !this.adapter) return structuredClone(fallback);
    try {
      const raw = this.adapter.getItem(key);
      if (!raw) return structuredClone(fallback);
      const value = JSON.parse(raw);
      if (value === null || (Array.isArray(fallback) && !Array.isArray(value))) throw new TypeError("Invalid stored collection.");
      return value;
    } catch {
      return structuredClone(fallback);
    }
  }

  write(name, value) {
    const key = this.collections.get(name);
    if (!key || !this.adapter) throw new Error(`Unknown storage collection: ${name}.`);
    const serialized = JSON.stringify(value);
    JSON.parse(serialized);
    this.adapter.setItem(key, serialized);
    return value;
  }

  update(name, updater, fallback = []) {
    return this.write(name, updater(this.read(name, fallback)));
  }

  remove(name) {
    const key = this.collections.get(name);
    if (key && this.adapter) this.adapter.removeItem(key);
  }

  clear() {
    this.collections.forEach((key) => this.adapter?.removeItem(key));
  }
}
