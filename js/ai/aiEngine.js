/**
 * Universal AI Provider Engine composition root.
 */
import { ProviderManager } from "./providerManager.js";
import { GenerationQueue } from "./generationQueue.js";
import { ImageStorage } from "./imageStorage.js";
import { GenerationHistory } from "./generationHistory.js";
import { buildProviderRequest } from "./requestPipeline.js";
import { processProviderResponse } from "./responsePipeline.js";
import { validateProviderRequest } from "../providers/providerValidator.js";
import { normalizeAIError } from "./errorManager.js";

export class AIEngine {
  /** Creates an offline-first provider engine. */
  constructor({ adapter = globalThis.localStorage } = {}) {
    this.providers = new ProviderManager({ adapter });
    this.queue = new GenerationQueue();
    this.images = new ImageStorage(adapter);
    this.history = new GenerationHistory(this.images);
  }

  /** Initializes provider adapters. */
  async initialize() {
    await this.providers.initialize();
    return this;
  }

  /** Runs the provider-independent generation pipeline through the queue. */
  generate(promptRecord, options = {}) {
    const request = buildProviderRequest(promptRecord, options);
    const provider = this.providers.active();
    const validation = validateProviderRequest(provider, request);
    if (!validation.valid) return Promise.reject(normalizeAIError(new Error(validation.errors.join(" "))));
    const settings = this.providers.settings.get();
    return this.queue.enqueue(async () => {
      try {
        const response = await provider.generate(request, {
          latencyMode: settings.latencyMode,
          randomFailures: settings.randomFailures,
          onProgress: options.onProgress
        });
        const record = processProviderResponse(request, response);
        this.images.save(record);
        return record;
      } catch (error) {
        throw normalizeAIError(error);
      }
    }, () => provider.cancel());
  }

  /** Cancels active and queued work. */
  cancel() {
    return this.queue.cancel();
  }

  /** Clears generated image history only. */
  clearHistory() {
    this.images.clear();
  }
}

export const aiEngine = new AIEngine();

