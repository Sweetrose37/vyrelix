/**
 * Abortable provider-like timing and progress simulation.
 */
export const GENERATION_STAGES = Object.freeze([
  "Preparing Prompt…", "Building Request…", "Generating…", "Rendering…", "Finishing…", "Completed"
]);

/** Creates a cross-runtime cancellation error. */
function cancellationError() {
  const error = new Error("Generation cancelled.");
  error.name = "AbortError";
  return error;
}

/** Waits for an abortable duration. */
export function wait(duration, signal) {
  return new Promise((resolve, reject) => {
    const timer = globalThis.setTimeout(resolve, duration);
    signal?.addEventListener("abort", () => {
      globalThis.clearTimeout(timer);
      reject(cancellationError());
    }, { once: true });
  });
}

/** Runs every mock generation stage in 2–5 seconds by default. */
export async function simulateLatency({ mode = "normal", signal, onProgress = () => {} } = {}) {
  const total = mode === "instant" ? 90 : mode === "slow" ? 7000 : 2000 + Math.floor(Math.random() * 3001);
  const slice = total / (GENERATION_STAGES.length - 1);
  for (let index = 0; index < GENERATION_STAGES.length; index += 1) {
    onProgress({ stage: GENERATION_STAGES[index], progress: Math.round(index / (GENERATION_STAGES.length - 1) * 100), estimatedMs: Math.max(0, total - index * slice) });
    if (index < GENERATION_STAGES.length - 1) await wait(slice, signal);
  }
  return total;
}
