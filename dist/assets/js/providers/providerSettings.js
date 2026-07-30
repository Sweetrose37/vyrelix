/**
 * Focused settings facade for provider selection and developer behavior.
 */
export class ProviderSettings {
  /** Wraps provider storage. */
  constructor(storage) {
    this.storage = storage;
  }

  /** Returns current provider settings. */
  get() {
    return this.storage.read();
  }

  /** Sets the preferred default provider. */
  setDefault(providerId) {
    return this.storage.write({ defaultProvider: providerId });
  }

  /** Enables or disables a provider adapter. */
  setEnabled(providerId, enabled) {
    return this.storage.write({ enabled: { [providerId]: Boolean(enabled) } });
  }

  /** Sets simulated generation speed. */
  setLatencyMode(latencyMode) {
    return this.storage.write({ latencyMode });
  }

  /** Enables controlled mock failures. */
  setRandomFailures(randomFailures) {
    return this.storage.write({ randomFailures: Boolean(randomFailures) });
  }
}

