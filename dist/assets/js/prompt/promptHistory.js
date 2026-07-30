/**
 * Searchable prompt-history lifecycle facade.
 */
import { createId } from "../../utilities/helpers.js";

export class PromptHistory {
  /** Creates prompt history over shared prompt storage. */
  constructor(storage) {
    this.storage = storage;
  }

  /** Searches prompt metadata and content. */
  search(query = "") {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return this.storage.list();
    return this.storage.list().filter((item) =>
      [item.title, item.studio, item.promptType, item.prompt, ...(item.tags || [])].join(" ").toLocaleLowerCase().includes(needle)
    );
  }

  /** Duplicates a prompt as an independent record. */
  duplicate(id) {
    const item = this.storage.get(id);
    if (!item) throw new Error("Prompt not found.");
    return this.storage.save({ ...structuredClone(item), id: createId("prompt"), title: `${item.title} Copy`, favorite: false, createdAt: Date.now(), timestamp: new Date().toISOString() });
  }

  /** Renames a prompt. */
  rename(id, title) {
    if (!String(title).trim()) throw new Error("Prompt name is required.");
    return this.storage.update(id, { title: String(title).trim() });
  }

  /** Deletes a prompt. */
  remove(id) {
    this.storage.remove(id);
  }
}

