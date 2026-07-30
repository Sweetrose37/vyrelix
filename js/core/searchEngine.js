/**
 * Cached universal project search across names, tags, categories, studios, dates, favorites, and status.
 */
export class SearchEngine {
  constructor({ limit = 100 } = {}) {
    this.limit = limit;
    this.cache = new Map();
  }

  search(projects, query = "", criteria = {}) {
    const normalized = String(query).trim().toLocaleLowerCase();
    const signature = `${projects.length}:${projects.map((item) => `${item.id}:${item.modifiedAt}`).join("|")}:${normalized}:${JSON.stringify(criteria)}`;
    if (this.cache.has(signature)) return this.cache.get(signature);
    const result = projects.filter((project) => {
      const haystack = [project.name, project.category, project.studio, project.type, project.status, project.createdAt, project.favorite ? "favorite" : "", ...(project.tags || [])]
        .join(" ").toLocaleLowerCase();
      if (normalized && !haystack.includes(normalized)) return false;
      if (criteria.favorite !== undefined && project.favorite !== criteria.favorite) return false;
      if (criteria.status && project.status !== criteria.status) return false;
      return true;
    });
    this.cache.set(signature, result);
    if (this.cache.size > this.limit) this.cache.delete(this.cache.keys().next().value);
    return result;
  }

  clear() {
    this.cache.clear();
  }
}
