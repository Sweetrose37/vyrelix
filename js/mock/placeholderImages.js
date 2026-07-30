/**
 * Cached CSS demo-art library. Every item is visibly non-AI placeholder artwork.
 */
export const PLACEHOLDER_IMAGES = Object.freeze([
  ["fantasy", "Fantasy", "#261447", "#d4af37", "radial-gradient(circle at 50% 28%, #f5dc82 0 5%, transparent 6%), linear-gradient(140deg, #261447, #703b74 55%, #d4af37)"],
  ["anime", "Anime", "#172554", "#fb7185", "radial-gradient(circle at 65% 30%, #fff 0 7%, transparent 8%), linear-gradient(145deg, #172554, #6366f1 48%, #fb7185)"],
  ["realistic", "Realistic", "#1f2937", "#d6b98c", "radial-gradient(ellipse at 50% 38%, #d6b98c 0 18%, transparent 19%), linear-gradient(160deg, #111827, #475569 60%, #a78b6d)"],
  ["sci-fi", "Sci-Fi", "#041b2d", "#22d3ee", "repeating-linear-gradient(90deg, transparent 0 18px, rgba(34,211,238,.18) 19px 20px), linear-gradient(135deg, #041b2d, #164e63, #7c3aed)"],
  ["modern", "Modern", "#18181b", "#f4f4f5", "linear-gradient(30deg, transparent 45%, rgba(244,244,245,.85) 46% 52%, transparent 53%), linear-gradient(145deg, #18181b, #3f3f46, #a1a1aa)"],
  ["creature", "Creature", "#14261c", "#84cc16", "radial-gradient(ellipse at 40% 40%, #bef264 0 4%, transparent 5%), radial-gradient(ellipse at 60% 40%, #bef264 0 4%, transparent 5%), linear-gradient(150deg, #14261c, #365314, #713f12)"],
  ["landscape", "Landscape", "#13233a", "#f59e0b", "linear-gradient(165deg, transparent 0 48%, #1e3a2a 49% 63%, #0f2419 64%), linear-gradient(#13233a, #b45309 58%, #f59e0b)"],
  ["portrait", "Portrait", "#2e1b3a", "#f0b7a4", "radial-gradient(ellipse at 50% 38%, #f0b7a4 0 17%, transparent 18%), radial-gradient(ellipse at 50% 75%, #7c3aed 0 27%, transparent 28%), linear-gradient(145deg, #2e1b3a, #6b3357)"],
  ["concept-art", "Concept Art", "#292524", "#f97316", "linear-gradient(115deg, transparent 0 48%, rgba(249,115,22,.72) 49% 52%, transparent 53%), radial-gradient(circle at 70% 30%, #facc15 0 4%, transparent 5%), linear-gradient(145deg, #292524, #7c2d12)"],
  ["abstract", "Abstract", "#1e1b4b", "#e879f9", "conic-gradient(from 25deg at 50% 50%, #22d3ee, #1e1b4b, #e879f9, #facc15, #22d3ee)"]
].map(([id, name, background, accent, artwork]) => Object.freeze({ id, name, category: id, background, accent, artwork, demo: true })));

/** Returns a cached placeholder by id with a safe fallback. */
export function getPlaceholder(id) {
  return PLACEHOLDER_IMAGES.find((item) => item.id === id) || PLACEHOLDER_IMAGES.at(-1);
}

