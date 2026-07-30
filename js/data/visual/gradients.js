/** Curated gradient presets for reusable preview backgrounds and studio surfaces. */
export const GRADIENTS = Object.freeze([
  { id: "gradient-aurora", name: "Aurora Veil", category: "Fantasy", value: "linear-gradient(135deg, #6D5DFB, #47D7AC)", tags: ["fantasy", "cool"] },
  { id: "gradient-solar", name: "Solar Flare", category: "Cinematic", value: "linear-gradient(135deg, #FF7A45, #FFD66B)", tags: ["warm", "cinematic"] },
  { id: "gradient-void", name: "Void Bloom", category: "Sci-Fi", value: "radial-gradient(circle at 70% 20%, #6842A8, #12121B 62%)", tags: ["space", "dark"] },
  { id: "gradient-ocean", name: "Ocean Glass", category: "Natural", value: "linear-gradient(160deg, #2F80A8, #133B5C)", tags: ["water", "blue"] },
  { id: "gradient-gilded", name: "Gilded Night", category: "Luxury", value: "linear-gradient(145deg, #4A3918, #111116 68%)", tags: ["gold", "dark"] }
].map((item) => Object.freeze({ ...item, studios: Object.freeze(["*"]), tags: Object.freeze(item.tags) })));
