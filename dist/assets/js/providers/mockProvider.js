/**
 * Fully functional offline provider that simulates a real image service.
 */
import { BaseProvider } from "./baseProvider.js";
import { simulateLatency } from "../mock/fakeLatency.js";
import { generateDemoArtwork } from "../mock/demoGenerator.js";

export class MockProvider extends BaseProvider {
  /** Creates the default configured provider. */
  constructor() {
    super({ id: "mock", name: "Mock Provider", configured: true, demo: true });
    this.controller = null;
    this.records = [];
  }

  /** Validates prompt requests locally. */
  validate(request) {
    const errors = [];
    if (!String(request?.prompt || "").trim()) errors.push("A generated prompt is required.");
    if (String(request?.prompt || "").length > 8000) errors.push("Prompt is too long for the demo provider.");
    return { valid: errors.length === 0, errors };
  }

  /** Simulates progress and returns clearly marked demo artwork. */
  async generate(request, context = {}) {
    const validation = this.validate(request);
    if (!validation.valid) throw new Error(validation.errors.join(" "));
    this.controller = new AbortController();
    try {
      if (context.randomFailures && Math.random() < 0.2) throw new Error("Mock provider simulated a temporary failure.");
      const generationTime = await simulateLatency({
        mode: context.latencyMode,
        signal: this.controller.signal,
        onProgress: context.onProgress
      });
      const response = { artwork: generateDemoArtwork(request), generationTime, provider: this.id, demo: true };
      this.records.unshift(response);
      return response;
    } finally {
      this.controller = null;
    }
  }

  /** Cancels the current simulated request. */
  cancel() {
    if (!this.controller) return false;
    this.controller.abort();
    this.controller = null;
    return true;
  }

  /** Returns bounded in-session adapter activity. */
  history() {
    return this.records.slice(0, 50);
  }

  /** Reports offline readiness. */
  async healthCheck() {
    return { online: true, configured: true, provider: this.id, message: "Offline demo ready." };
  }
}
