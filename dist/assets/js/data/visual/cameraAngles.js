/** Camera framing and viewpoint dataset shared by character, scene, world, and object previews. */
import { createVisualOptions } from "./helpers.js";

export const CAMERA_ANGLES = Object.freeze([
  ...createVisualOptions(["Portrait", "Full Body", "Close-Up", "Macro", "Wide"], "Framing"),
  ...createVisualOptions(["Bird's Eye", "Worm's Eye", "Dutch Angle"], "Angle"),
  ...createVisualOptions(["Action Shot", "Hero Shot"], "Dynamic"),
  ...createVisualOptions(["Profile", "Front", "Rear", "Three Quarter"], "View")
]);
