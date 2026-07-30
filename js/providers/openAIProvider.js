/**
 * Complete but intentionally inactive OpenAI adapter boundary.
 * It never accepts, stores, tests, or transmits an API key in this phase.
 */
import { BaseProvider } from "./baseProvider.js";

export class OpenAIProvider extends BaseProvider {
  /** Creates the inactive OpenAI image adapter. */
  constructor() {
    super({ id: "openai", name: "OpenAI", configured: false, demo: false });
    this.credentialLabel = "API Key Required";
    this.connectionActions = Object.freeze(["Connect Provider", "Test Connection"]);
    this.configurationSchema = Object.freeze({
      apiKey: { type: "secret", required: true, persisted: false },
      model: { type: "select", required: true },
      organization: { type: "text", required: false }
    });
    this.activeRequest = null;
  }

  /** Initializes local adapter state without network access. */
  async initialize() {
    this.initialized = true;
    this.configured = false;
    return this;
  }

  /** Reports the missing-key state without accepting credentials. */
  validate() {
    return { valid: false, errors: ["API key missing."] };
  }

  /** Prevents network generation until a later secure integration phase. */
  async generate() {
    throw new Error("API key missing.");
  }

  /** Cancels future active requests when this adapter is connected. */
  cancel() {
    if (!this.activeRequest) return false;
    this.activeRequest.abort?.();
    this.activeRequest = null;
    return true;
  }

  /** Returns no provider-side history while inactive. */
  history() {
    return [];
  }

  /** Returns configuration state without testing a connection. */
  async healthCheck() {
    return { online: false, configured: false, provider: this.id, message: "API Key Required" };
  }
}

