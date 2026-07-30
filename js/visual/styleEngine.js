/**
 * Extensible art-style registry and saved style support.
 */
export class StyleEngine {
  constructor(styles, storage) {
    this.styles = new Map(styles.map((item) => [item.id, item]));
    this.storage = storage;
  }

  register(style) {
    if (!style?.id || this.styles.has(style.id)) throw new Error("Art style requires a unique id.");
    this.styles.set(style.id, Object.freeze(style));
    return this;
  }

  get(id) {
    return this.styles.get(id) || null;
  }

  save(name, visual) {
    const style = { id: `style-${Date.now()}`, name: String(name || "Saved Style").trim(), visual: structuredClone(visual), updatedAt: new Date().toISOString() };
    this.storage.saveUnique("styles", style);
    return style;
  }
}
