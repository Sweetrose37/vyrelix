/**
 * Corruption-tolerant local storage for prompts, drafts, recents, favorites, and presets.
 */
const KEYS = Object.freeze({
  prompts: "vyrelix.v4.prompts",
  drafts: "vyrelix.v4.prompt-drafts",
  recent: "vyrelix.v4.prompt-recent",
  negativePresets: "vyrelix.v4.negative-presets"
});

export class PromptStorage {
  /** Creates the storage boundary around a Web Storage compatible adapter. */
  constructor(adapter = globalThis.localStorage) {
    this.adapter = adapter;
  }

  /** Reads a typed array safely. */
  read(key) {
    try {
      const value = JSON.parse(this.adapter?.getItem(KEYS[key]) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  /** Writes a serializable typed array. */
  write(key, value) {
    const clean = structuredClone(value);
    this.adapter?.setItem(KEYS[key], JSON.stringify(clean));
    return clean;
  }

  /** Returns generated prompts newest first. */
  list() {
    return this.read("prompts").sort((a, b) => b.createdAt - a.createdAt);
  }

  /** Returns a prompt by id. */
  get(id) {
    return this.list().find((item) => item.id === id) || null;
  }

  /** Inserts or replaces a generated prompt and updates recents. */
  save(record) {
    this.write("prompts", [record, ...this.list().filter((item) => item.id !== record.id)]);
    this.write("recent", [record.id, ...this.read("recent").filter((id) => id !== record.id)].slice(0, 30));
    return record;
  }

  /** Applies a patch to a stored prompt. */
  update(id, patch) {
    const current = this.get(id);
    if (!current) throw new Error("Prompt not found.");
    return this.save({ ...current, ...patch });
  }

  /** Deletes a generated prompt. */
  remove(id) {
    this.write("prompts", this.list().filter((item) => item.id !== id));
    this.write("recent", this.read("recent").filter((item) => item !== id));
  }

  /** Stores one draft per project. */
  saveDraft(projectId, values) {
    this.write("drafts", [{ projectId, values, modifiedAt: Date.now() }, ...this.read("drafts").filter((draft) => draft.projectId !== projectId)]);
  }

  /** Retrieves a project draft. */
  getDraft(projectId) {
    return this.read("drafts").find((draft) => draft.projectId === projectId)?.values || null;
  }

  /** Returns favorite prompts only. */
  favorites() {
    return this.list().filter((item) => item.favorite);
  }

  /** Toggles favorite state. */
  toggleFavorite(id) {
    const item = this.get(id);
    return this.update(id, { favorite: !item?.favorite });
  }

  /** Saves or replaces a negative prompt preset. */
  saveNegativePreset(preset) {
    this.write("negativePresets", [preset, ...this.read("negativePresets").filter((item) => item.id !== preset.id)]);
  }

  /** Returns negative prompt presets. */
  negativePresets() {
    return this.read("negativePresets");
  }

  /** Clears only generation demo data. */
  reset() {
    Object.keys(KEYS).forEach((key) => this.adapter?.removeItem(KEYS[key]));
  }
}

