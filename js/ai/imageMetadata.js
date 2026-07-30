/**
 * Builds complete metadata for every saved generated image.
 */
import { createId } from "../../utilities/helpers.js";

/** Creates a stable image record from request and provider response. */
export function buildImageMetadata(request, response) {
  return {
    id: createId("image"),
    kind: "image",
    title: request.title || "Untitled demo generation",
    promptId: request.promptId || "",
    projectId: request.projectId || "",
    prompt: request.prompt,
    negativePrompt: request.negativePrompt || "",
    studio: request.studio || "Universal Studio",
    theme: request.theme || "Original",
    artStyle: request.artStyle || "Unspecified",
    camera: request.camera || "Unspecified",
    lighting: request.lighting || "Unspecified",
    timestamp: new Date().toISOString(),
    createdAt: Date.now(),
    provider: response.provider,
    generationTime: response.generationTime,
    demo: Boolean(response.demo),
    favorite: false,
    collection: request.collection || "All Generations",
    artwork: structuredClone(response.artwork)
  };
}

