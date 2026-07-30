/**
 * Lazy ES-module loader with promise caching for optional studio implementations.
 */
export class ModuleLoader {
  constructor() {
    this.factories = new Map();
    this.cache = new Map();
  }

  register(id, factory) {
    if (typeof factory !== "function") throw new TypeError("Module factory must be a function.");
    this.factories.set(id, factory);
    return this;
  }

  async load(id) {
    if (!this.factories.has(id)) throw new Error(`Unknown module: ${id}.`);
    if (!this.cache.has(id)) this.cache.set(id, Promise.resolve().then(() => this.factories.get(id)()));
    return this.cache.get(id);
  }

  unload(id) {
    this.cache.delete(id);
  }
}
