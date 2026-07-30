/**
 * Versioned device-local provider and developer settings.
 */
const SETTINGS_KEY = "vyrelix.v5.provider-settings";
const DEFAULTS = Object.freeze({
  defaultProvider: "mock",
  enabled: { mock: true, openai: false, google: false, replicate: false, stability: false, huggingface: false },
  latencyMode: "normal",
  randomFailures: false
});

export class ProviderStorage {
  /** Creates storage over a Web Storage compatible adapter. */
  constructor(adapter = globalThis.localStorage) {
    this.adapter = adapter;
  }

  /** Reads safe provider settings with default values. */
  read() {
    try {
      const stored = JSON.parse(this.adapter?.getItem(SETTINGS_KEY) || "{}");
      return { ...structuredClone(DEFAULTS), ...stored, enabled: { ...DEFAULTS.enabled, ...(stored.enabled || {}) } };
    } catch {
      return structuredClone(DEFAULTS);
    }
  }

  /** Writes a complete settings snapshot. */
  write(settings) {
    const value = { ...this.read(), ...structuredClone(settings), enabled: { ...this.read().enabled, ...(settings.enabled || {}) } };
    this.adapter?.setItem(SETTINGS_KEY, JSON.stringify(value));
    return value;
  }

  /** Restores provider defaults. */
  reset() {
    this.adapter?.removeItem(SETTINGS_KEY);
    return this.read();
  }
}

