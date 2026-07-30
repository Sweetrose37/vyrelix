/**
 * Cached bounded search helper for prompt collections.
 */
export class PromptSearch {
  /** Initializes an empty query cache. */
  constructor() {
    this.cache = new Map();
  }

  /** Searches prompts with a bounded cache. */
  query(items, query = "", limit = 100) {
    const signature = items.map((item) => `${item.id}:${item.title}:${Boolean(item.favorite)}`).join("|");
    const key = `${signature}:${query.toLocaleLowerCase()}:${limit}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const needle = query.trim().toLocaleLowerCase();
    const result = items.filter((item) => !needle || [item.title, item.studio, item.promptType, item.prompt].join(" ").toLocaleLowerCase().includes(needle)).slice(0, limit);
    if (this.cache.size > 30) this.cache.clear();
    this.cache.set(key, result);
    return result;
  }
}
