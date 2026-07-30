/**
 * UCE-specific settings with forward-compatible defaults.
 */
export class SettingsEngine {
  constructor(storage, defaults = {}) {
    this.storage = storage;
    this.defaults = { defaultVisibility: "private", defaultSort: "modified-desc", pageSize: 12, ...defaults };
  }

  get() {
    return { ...this.defaults, ...this.storage.read("settings", {}) };
  }

  set(patch) {
    return this.storage.write("settings", { ...this.get(), ...patch });
  }

  reset() {
    return this.storage.write("settings", { ...this.defaults });
  }
}
