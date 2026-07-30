/** Character hair styles and visual texture options. */
import { createVisualOptions } from "./helpers.js";

export const HAIR_STYLES = Object.freeze([
  ...createVisualOptions(["Bald", "Buzz Cut", "Cropped", "Bob", "Shoulder Length", "Long", "Waist Length"], "Length"),
  ...createVisualOptions(["Ponytail", "Braids", "Crown Braid", "Locs", "Top Knot", "Undercut", "Mohawk"], "Styled"),
  ...createVisualOptions(["Cloud Curls", "Wind Swept", "Slicked Back", "Asymmetrical"], "Silhouette")
]);
export const HAIR_TEXTURES = createVisualOptions(["Straight", "Wavy", "Curly", "Coiled", "Silky", "Coarse", "Feathered"], "Hair Texture");
