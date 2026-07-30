/**
 * Device-local image gallery persistence with favorites and collections.
 */
const IMAGE_KEY = "vyrelix.v5.images";

export class ImageStorage {
  /** Creates image storage over Web Storage. */
  constructor(adapter = globalThis.localStorage) {
    this.adapter = adapter;
  }

  /** Reads safe gallery records. */
  list() {
    try {
      const value = JSON.parse(this.adapter?.getItem(IMAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  /** Writes safe gallery records. */
  write(items) {
    const value = structuredClone(items);
    this.adapter?.setItem(IMAGE_KEY, JSON.stringify(value));
    return value;
  }

  /** Inserts or replaces one image record. */
  save(record) {
    this.write([record, ...this.list().filter((item) => item.id !== record.id)]);
    return record;
  }

  /** Returns an image by id. */
  get(id) {
    return this.list().find((item) => item.id === id) || null;
  }

  /** Updates an image record. */
  update(id, patch) {
    const current = this.get(id);
    if (!current) throw new Error("Image not found.");
    return this.save({ ...current, ...patch });
  }

  /** Toggles favorite status. */
  toggleFavorite(id) {
    const current = this.get(id);
    return this.update(id, { favorite: !current.favorite });
  }

  /** Deletes one image. */
  remove(id) {
    this.write(this.list().filter((item) => item.id !== id));
  }

  /** Returns unique collection names. */
  collections() {
    return [...new Set(this.list().map((item) => item.collection).filter(Boolean))].sort();
  }

  /** Clears generation history and gallery records. */
  clear() {
    this.adapter?.removeItem(IMAGE_KEY);
  }
}

