/**
 * Selects clearly labeled placeholder artwork and creates offline demo responses.
 */
import { getPlaceholder } from "./placeholderImages.js";

const CATEGORY_TERMS = Object.freeze({
  fantasy: ["fantasy", "magic", "dragon", "astral"],
  anime: ["anime", "manga"],
  realistic: ["realistic", "photo", "photoreal"],
  "sci-fi": ["sci-fi", "futuristic", "neon", "space"],
  modern: ["modern", "editorial"],
  creature: ["creature", "monster", "beast"],
  landscape: ["landscape", "world", "vista", "environment"],
  portrait: ["portrait", "face", "character"],
  "concept-art": ["concept art", "character sheet"],
  abstract: ["abstract", "geometric"]
});

/** Infers an appropriate demo category from request text. */
export function inferDemoCategory(request) {
  const source = [request.prompt, request.theme, request.artStyle, request.studio].join(" ").toLocaleLowerCase();
  return Object.entries(CATEGORY_TERMS).find(([, terms]) => terms.some((term) => source.includes(term)))?.[0] || "abstract";
}

/** Generates an offline demo image descriptor without network access. */
export function generateDemoArtwork(request) {
  const placeholder = getPlaceholder(inferDemoCategory(request));
  return {
    placeholderId: placeholder.id,
    category: placeholder.category,
    artwork: placeholder.artwork,
    background: placeholder.background,
    accent: placeholder.accent,
    alt: `Demo ${placeholder.name} artwork generated using Mock Provider`,
    width: 768,
    height: 768,
    demo: true
  };
}

