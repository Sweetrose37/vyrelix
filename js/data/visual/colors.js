/**
 * Generates 1,200 deterministic named colors plus curated specialty colors.
 * Entries use CSS HSL values so the catalog remains compact and device-local.
 */
const HUES = Object.freeze([
  ["Crimson", 0], ["Ember", 28], ["Solar", 52], ["Verdant", 112],
  ["Jade", 152], ["Aqua", 184], ["Azure", 212], ["Cobalt", 236],
  ["Violet", 270], ["Orchid", 302], ["Rose", 332], ["Umber", 24]
]);
const TONES = Object.freeze([
  ["Whisper", 92, 82], ["Pale", 82, 74], ["Soft", 72, 66], ["Bright", 86, 58],
  ["Pure", 72, 50], ["Deep", 68, 40], ["Dark", 58, 29], ["Shadow", 48, 20],
  ["Pastel", 64, 78], ["Neon", 100, 54]
]);
const FINISHES = Object.freeze([
  ["Matte", "matte"], ["Gloss", "gloss"], ["Metallic", "metallic"], ["Pearlescent", "pearlescent"],
  ["Transparent", "transparent"], ["Crystal", "crystal"], ["Satin", "satin"], ["Earth", "earth"],
  ["Fantasy", "fantasy"], ["Alien", "alien"]
]);

export const NAMED_COLORS = Object.freeze(HUES.flatMap(([family, hue]) =>
  TONES.flatMap(([tone, saturation, lightness], toneIndex) =>
    FINISHES.map(([finish, finishId], finishIndex) => {
      const adjustedHue = (hue + finishIndex * 2 + toneIndex) % 360;
      return Object.freeze({
        id: `color-${family.toLocaleLowerCase()}-${tone.toLocaleLowerCase()}-${finishId}`,
        name: `${tone} ${family} ${finish}`,
        category: finish,
        family,
        finish: finishId,
        value: `hsl(${adjustedHue} ${Math.max(20, saturation - (finishId === "earth" ? 24 : 0))}% ${lightness}%)`,
        tags: Object.freeze([family.toLocaleLowerCase(), tone.toLocaleLowerCase(), finishId]),
        studios: Object.freeze(["*"])
      });
    })
  )
));

export const SPECIALTY_COLORS = Object.freeze([
  { id: "color-burnished-gold", name: "Burnished Gold", category: "Metallic", family: "Gold", finish: "metallic", value: "#D4AF37", tags: ["gold", "metallic"], studios: ["*"] },
  { id: "color-moon-silver", name: "Moon Silver", category: "Metallic", family: "Silver", finish: "metallic", value: "#C9CED8", tags: ["silver", "metallic"], studios: ["*"] },
  { id: "color-void-black", name: "Void Black", category: "Fantasy", family: "Black", finish: "matte", value: "#090911", tags: ["black", "fantasy"], studios: ["*"] },
  { id: "color-starlight", name: "Starlight", category: "Fantasy", family: "White", finish: "glow", value: "#F7F3DE", tags: ["white", "glow"], studios: ["*"] }
].map(Object.freeze));

export const COLORS = Object.freeze([...SPECIALTY_COLORS, ...NAMED_COLORS]);
