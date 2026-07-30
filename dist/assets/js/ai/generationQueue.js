/**
 * Single-flight generation queue with cancellation and observable state.
 */
export class GenerationQueue {
  /** Creates an empty sequential queue. */
  constructor() {
    this.pending = [];
    this.running = false;
    this.currentCancel = null;
  }

  /** Adds one generation task and resolves when processed. */
  enqueue(task, cancel = null) {
    return new Promise((resolve, reject) => {
      this.pending.push({ task, cancel, resolve, reject });
      this.run();
    });
  }

  /** Processes pending tasks one at a time. */
  async run() {
    if (this.running || !this.pending.length) return;
    this.running = true;
    const item = this.pending.shift();
    this.currentCancel = item.cancel;
    try {
      item.resolve(await item.task());
    } catch (error) {
      item.reject(error);
    } finally {
      this.running = false;
      this.currentCancel = null;
      this.run();
    }
  }

  /** Cancels the active task and clears queued tasks. */
  cancel() {
    const cancelled = this.currentCancel?.() || false;
    this.pending.splice(0).forEach((item) => {
      const error = new Error("Generation cancelled.");
      error.name = "AbortError";
      item.reject(error);
    });
    return cancelled;
  }

  /** Returns queue status for UI display. */
  status() {
    return { running: this.running, queued: this.pending.length };
  }
}
