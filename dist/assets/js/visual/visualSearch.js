/**
 * Bounded cached search across normalized visual datasets.
 */
export class VisualSearch {
  constructor({ cacheLimit = 120 } = {}) {
    this.cacheLimit = cacheLimit;
    this.cache = new Map();
  }

  search(items, query = "") {
    const normalized = String(query).trim().toLocaleLowerCase();
    if (!normalized) return items;
    const key = `${items.length}:${items[0]?.category || "visual"}:${normalized}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const result = items.filter((item) => [item.name, item.category, ...(item.tags || [])].join(" ").toLocaleLowerCase().includes(normalized));
    this.cache.set(key, result);
    if (this.cache.size > this.cacheLimit) this.cache.delete(this.cache.keys().next().value);
    return result;
  }

  clear() {
    this.cache.clear();
  }
}
