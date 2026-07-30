/**
 * Validates provider output and produces persisted image metadata.
 */
import { buildImageMetadata } from "./imageMetadata.js";

/** Normalizes a provider response into the universal image record. */
export function processProviderResponse(request, response) {
  if (!response?.artwork) throw new Error("Provider returned an invalid response.");
  return buildImageMetadata(request, response);
}

