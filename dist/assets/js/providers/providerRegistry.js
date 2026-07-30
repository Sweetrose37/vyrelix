/**
 * Extensible provider registry with contract validation.
 */
const REQUIRED_METHODS = Object.freeze(["initialize", "validate", "generate", "cancel", "history", "healthCheck"]);

export class ProviderRegistry {
  /** Creates an empty provider registry. */
  constructor() {
    this.providers = new Map();
  }

  /** Registers an adapter that implements the universal contract. */
  register(provider) {
    if (!provider?.id || REQUIRED_METHODS.some((method) => typeof provider[method] !== "function")) {
      throw new TypeError("Provider does not implement the Vyrelix provider contract.");
    }
    this.providers.set(provider.id, provider);
    return provider;
  }

  /** Returns a provider by id. */
  get(id) {
    return this.providers.get(id) || null;
  }

  /** Returns every registered provider. */
  list() {
    return [...this.providers.values()];
  }
}

