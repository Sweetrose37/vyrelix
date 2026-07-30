/**
 * Reusable built-in and custom project template framework.
 */
export const BUILT_IN_TEMPLATES = Object.freeze([
  Object.freeze({ id: "blank", name: "Blank Project", values: {} }),
  Object.freeze({ id: "fantasy", name: "Fantasy Template", values: { theme: "Fantasy" } }),
  Object.freeze({ id: "sci-fi", name: "Sci-Fi Template", values: { theme: "Sci-Fi" } }),
  Object.freeze({ id: "modern", name: "Modern Template", values: { theme: "Modern" } }),
  Object.freeze({ id: "anime", name: "Anime Template", values: { theme: "Anime", artStyle: "Illustrative" } }),
  Object.freeze({ id: "realistic", name: "Realistic Template", values: { theme: "Realistic", artStyle: "Photoreal" } })
]);

export class ProjectTemplateManager {
  constructor(storage) {
    this.storage = storage;
  }

  list() {
    return [...BUILT_IN_TEMPLATES, ...this.storage.read("templates")];
  }

  save(template) {
    const value = {
      id: template.id || `custom-${Date.now()}`,
      name: String(template.name || "Custom Template").trim(),
      values: structuredClone(template.values || {}),
      custom: true
    };
    this.storage.update("templates", (items) => [value, ...items.filter((item) => item.id !== value.id)]);
    return value;
  }

  remove(id) {
    return this.storage.update("templates", (items) => items.filter((item) => item.id !== id));
  }

  apply(id, values = {}) {
    const template = this.list().find((item) => item.id === id);
    if (!template) throw new Error("Template not found.");
    return { ...structuredClone(template.values), ...values };
  }
}
