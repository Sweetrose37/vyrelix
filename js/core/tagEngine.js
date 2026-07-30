/**
 * Unlimited tag editing, suggestions, and device-local favorite tag support.
 */
export class TagEngine {
  constructor(storage) {
    this.storage = storage;
  }

  normalize(tags = []) {
    return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
  }

  add(tags, tag) {
    return this.normalize([...tags, tag]);
  }

  remove(tags, tag) {
    return tags.filter((item) => item !== tag);
  }

  edit(tags, from, to) {
    return this.normalize(tags.map((tag) => tag === from ? to : tag));
  }

  toggleFavorite(tag) {
    const favorites = new Set(this.storage.read("favoriteTags"));
    favorites.has(tag) ? favorites.delete(tag) : favorites.add(tag);
    return this.storage.write("favoriteTags", [...favorites]);
  }

  suggest(projects, query = "", limit = 8) {
    const normalized = query.toLocaleLowerCase();
    const frequency = new Map();
    projects.flatMap((project) => project.tags || []).forEach((tag) => frequency.set(tag, (frequency.get(tag) || 0) + 1));
    return [...frequency].filter(([tag]) => tag.toLocaleLowerCase().includes(normalized)).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tag]) => tag);
  }
}
