/**
 * Searchable and sortable generation history facade.
 */
export class GenerationHistory {
  /** Wraps image storage. */
  constructor(storage) {
    this.storage = storage;
  }

  /** Filters and sorts saved generations. */
  query({ query = "", sort = "newest", collection = "all", favorites = false } = {}) {
    const needle = query.trim().toLocaleLowerCase();
    const items = this.storage.list().filter((item) =>
      (!needle || [item.title, item.prompt, item.studio, item.theme, item.artStyle, item.provider].join(" ").toLocaleLowerCase().includes(needle))
      && (collection === "all" || item.collection === collection)
      && (!favorites || item.favorite)
    );
    return items.sort((a, b) => sort === "oldest" ? a.createdAt - b.createdAt : sort === "title" ? a.title.localeCompare(b.title) : b.createdAt - a.createdAt);
  }
}

