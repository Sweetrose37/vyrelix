/**
 * Validates and normalizes Prompt Engine records into provider requests.
 */

/** Builds the provider-agnostic request contract. */
export function buildProviderRequest(promptRecord, options = {}) {
  if (!String(promptRecord?.prompt || "").trim()) throw new Error("A generated prompt is required.");
  const project = promptRecord.project || {};
  return {
    requestId: `request-${Date.now().toString(36)}`,
    promptId: promptRecord.id,
    projectId: promptRecord.projectId,
    title: promptRecord.title,
    prompt: promptRecord.prompt.trim(),
    negativePrompt: promptRecord.negativePrompt || "",
    studio: promptRecord.studio,
    theme: project.mood || options.theme || "Original",
    artStyle: project.visualStyle || options.artStyle || "Unspecified",
    camera: project.camera?.angle || options.camera || "Unspecified",
    lighting: project.lighting || options.lighting || "Unspecified",
    collection: options.collection || "All Generations",
    seed: promptRecord.seed,
    timestamp: new Date().toISOString()
  };
}

