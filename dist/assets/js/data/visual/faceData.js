/** Character facial structure, facial hair, and surface-detail datasets. */
import { createVisualOptions } from "./helpers.js";

export const FACE_SHAPES = createVisualOptions(["Oval", "Round", "Square", "Heart", "Diamond", "Oblong", "Angular", "Soft Sculpted"], "Face");
export const FACIAL_HAIR = createVisualOptions(["None", "Stubble", "Short Beard", "Full Beard", "Goatee", "Mustache", "Braided Beard"], "Facial Hair");
export const FACE_DETAILS = Object.freeze([
  ...createVisualOptions(["No Freckles", "Light Freckles", "Sun Freckles", "Dense Freckles"], "Freckles"),
  ...createVisualOptions(["No Scars", "Brow Scar", "Cheek Scar", "Lip Scar", "Ceremonial Scar"], "Scars"),
  ...createVisualOptions(["No Birthmarks", "Temple Birthmark", "Cheek Birthmark", "Constellation Birthmark"], "Birthmarks"),
  ...createVisualOptions(["No Makeup", "Natural Makeup", "Graphic Liner", "Metallic Makeup", "Fantasy Makeup"], "Makeup")
]);
