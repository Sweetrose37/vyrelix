/** Visual effect modifiers shared by previews and future studios. */
import { createVisualOptions } from "./helpers.js";

export const VISUAL_EFFECTS = Object.freeze([
  ...createVisualOptions(["Glow", "Sparkles", "Energy", "Magic", "Aura", "Particles", "Stars"], "Luminous"),
  ...createVisualOptions(["Smoke", "Fire", "Lightning", "Snow", "Rain", "Dust"], "Elemental"),
  ...createVisualOptions(["Fog", "Mist"], "Atmospheric")
]);
