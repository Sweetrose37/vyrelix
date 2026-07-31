/**
 * Compatibility registry for creative capabilities and their project types.
 */
export class StudioManager {
  constructor() {
    this.studios = new Map();
  }

  register(descriptor) {
    if (!descriptor?.id || !descriptor?.projectType) throw new Error("Studios require an id and project type.");
    if (this.studios.has(descriptor.id)) throw new Error(`Studio already registered: ${descriptor.id}.`);
    this.studios.set(descriptor.id, Object.freeze({
      active: false,
      generator: false,
      icon: "✦",
      description: "A future Vyrelix creative studio.",
      ...descriptor
    }));
    return this;
  }

  get(id) {
    return this.studios.get(id) || null;
  }

  list({ active } = {}) {
    const studios = [...this.studios.values()];
    return typeof active === "boolean" ? studios.filter((studio) => studio.active === active) : studios;
  }

  projectTypes() {
    return [...new Set(this.list().map((studio) => studio.projectType))];
  }
}
