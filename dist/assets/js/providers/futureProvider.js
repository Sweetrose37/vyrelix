/**
 * Complete inactive adapter shape for future network providers, including OpenAI.
 */
import { BaseProvider } from "./baseProvider.js";

export class FutureProvider extends BaseProvider {
  /** Creates an inactive provider with future credential metadata. */
  constructor({ id, name, credentialLabel = "API Key Required" }) {
    super({ id, name, configured: false, demo: false });
    this.credentialLabel = credentialLabel;
    this.connectionActions = Object.freeze(["Connect Provider", "Test Connection"]);
  }

  /** Always reports configuration requirements without a network request. */
  validate() {
    return { valid: false, errors: [this.id === "openai" ? "API key missing." : "Provider not configured."] };
  }

  /** Prevents inactive providers from generating. */
  async generate() {
    throw new Error(this.id === "openai" ? "API key missing." : "Provider not configured.");
  }

  /** Has no active request to cancel. */
  cancel() {
    return false;
  }

  /** Has no remote history until configured. */
  history() {
    return [];
  }

  /** Reports inactive health without transmitting anything. */
  async healthCheck() {
    return { online: false, configured: false, provider: this.id, message: this.credentialLabel };
  }
}

