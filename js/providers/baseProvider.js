/**
 * Provider interface shared by mock and future image-generation adapters.
 */
export class BaseProvider {
  /** Creates a provider descriptor with stable capabilities. */
  constructor({ id, name, configured = false, demo = false } = {}) {
    this.id = id;
    this.name = name;
    this.configured = configured;
    this.demo = demo;
    this.initialized = false;
  }

  /** Initializes adapter-local state. */
  async initialize() {
    this.initialized = true;
    return this;
  }

  /** Validates a provider request. */
  validate(request) {
    return { valid: Boolean(request?.prompt?.trim()), errors: request?.prompt?.trim() ? [] : ["A prompt is required."] };
  }

  /** Generates an image response. */
  async generate() {
    throw new Error("Provider not configured.");
  }

  /** Cancels an active provider request. */
  cancel() {
    return false;
  }

  /** Returns adapter-local history when supported. */
  history() {
    return [];
  }

  /** Reports provider readiness without making a network call. */
  async healthCheck() {
    return { online: this.configured, configured: this.configured, provider: this.id };
  }
}

