/** Lens-character presets that describe perspective without invoking image generation. */
import { createVisualOptions } from "./helpers.js";

export const CAMERA_LENSES = Object.freeze([
  ...createVisualOptions(["14mm Ultra Wide", "24mm Wide", "35mm Documentary", "50mm Natural"], "Wide"),
  ...createVisualOptions(["85mm Portrait", "105mm Portrait", "135mm Compression"], "Portrait"),
  ...createVisualOptions(["Macro Lens", "Tilt Shift", "Fisheye"], "Specialty")
]);
