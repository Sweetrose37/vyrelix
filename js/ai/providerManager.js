/**
 * Provider selection, fallback, initialization, and health coordination.
 */
import { ProviderRegistry } from "../providers/providerRegistry.js";
import { ProviderStorage } from "../providers/providerStorage.js";
import { ProviderSettings } from "../providers/providerSettings.js";
import { MockProvider } from "../providers/mockProvider.js";
import { FutureProvider } from "../providers/futureProvider.js";
import { OpenAIProvider } from "../providers/openAIProvider.js";

export class ProviderManager {
  /** Creates the full registry with Mock Provider as the safe default. */
  constructor({ adapter = globalThis.localStorage } = {}) {
    this.registry = new ProviderRegistry();
    this.storage = new ProviderStorage(adapter);
    this.settings = new ProviderSettings(this.storage);
    this.registerDefaults();
  }

  /** Registers mock and inactive future adapters. */
  registerDefaults() {
    this.registry.register(new MockProvider());
    this.registry.register(new OpenAIProvider());
    [
      ["google", "Google", "Provider not configured."],
      ["replicate", "Replicate", "Provider not configured."],
      ["stability", "Stability AI", "Provider not configured."],
      ["huggingface", "Hugging Face", "Provider not configured."]
    ].forEach(([id, name, credentialLabel]) => this.registry.register(new FutureProvider({ id, name, credentialLabel })));
  }

  /** Initializes all adapters without contacting future providers. */
  async initialize() {
    await Promise.all(this.registry.list().map((provider) => provider.initialize()));
    return this;
  }

  /** Resolves the preferred configured provider or automatically falls back to Mock Provider. */
  active() {
    const settings = this.settings.get();
    const selected = this.registry.get(settings.defaultProvider);
    if (selected?.configured && settings.enabled[selected.id] !== false) return selected;
    return this.registry.get("mock");
  }

  /** Selects a default provider while retaining fallback behavior. */
  select(id) {
    const provider = this.registry.get(id);
    if (!provider) throw new Error("Provider missing.");
    const enabled = this.settings.get().enabled[id] !== false;
    this.settings.setDefault(provider.configured && enabled ? id : "mock");
    return this.active();
  }

  /** Returns provider view models with active and configured state. */
  list() {
    const settings = this.settings.get();
    const active = this.active();
    return this.registry.list().map((provider) => ({
      id: provider.id,
      name: provider.name,
      configured: provider.configured,
      enabled: settings.enabled[provider.id] !== false,
      active: provider.id === active.id,
      demo: provider.demo,
      credentialLabel: provider.credentialLabel || ""
    }));
  }
}
