/** Universal material catalog shared by characters, objects, vehicles, architecture, and future studios. */
import { createVisualOptions } from "./helpers.js";

const GROUPS = Object.freeze({
  Natural: ["Wood", "Stone", "Leather", "Cotton", "Silk", "Velvet", "Linen", "Denim", "Organic"],
  Metal: ["Iron", "Steel", "Gold", "Silver", "Bronze", "Copper"],
  Elemental: ["Crystal", "Glass", "Ice", "Lava", "Energy", "Shadow", "Light"],
  Manufactured: ["Synthetic", "Carbon Fiber", "Plastic", "Ceramic"],
  Precious: ["Gemstone", "Magic Material", "Sci-Fi Alloy"]
});

export const MATERIALS = Object.freeze(Object.entries(GROUPS).flatMap(([category, names]) =>
  createVisualOptions(names, category).map((item) => Object.freeze({
    ...item,
    properties: Object.freeze({
      reflective: ["Metal", "Precious"].includes(category),
      translucent: ["Crystal", "Glass", "Ice", "Light", "Energy"].includes(item.name),
      organic: ["Natural"].includes(category)
    })
  }))
));
