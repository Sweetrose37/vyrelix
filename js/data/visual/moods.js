/** Mood directions kept independent from personality or lore. */
import { createVisualOptions } from "./helpers.js";

export const MOODS = Object.freeze([
  ...createVisualOptions(["Dreamlike", "Quiet", "Serene", "Hopeful"], "Calm"),
  ...createVisualOptions(["Tense", "Ominous", "Mysterious", "Melancholic"], "Dramatic"),
  ...createVisualOptions(["Triumphant", "Energetic", "Playful", "Majestic"], "Expressive")
]);
