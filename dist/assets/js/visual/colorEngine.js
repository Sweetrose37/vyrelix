/**
 * Modular color roles, lookup, palette storage, and harmony generation.
 */
export const COLOR_ROLES = Object.freeze(["primary", "secondary", "accent", "background", "highlight", "shadow", "glow", "outline"]);

function parseColor(value) {
  const hsl = String(value).match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/i);
  if (hsl) return [Number(hsl[1]), Number(hsl[2]), Number(hsl[3])];
  const hex = String(value).replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return [45, 60, 50];
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), light = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(light * 100)];
  const delta = max - min;
  const saturation = delta / (1 - Math.abs(2 * light - 1));
  const hue = max === r ? 60 * (((g - b) / delta) % 6) : max === g ? 60 * ((b - r) / delta + 2) : 60 * ((r - g) / delta + 4);
  return [Math.round((hue + 360) % 360), Math.round(saturation * 100), Math.round(light * 100)];
}

export class ColorEngine {
  constructor(colors, storage) {
    this.colors = colors;
    this.storage = storage;
    this.byId = new Map(colors.map((color) => [color.id, color]));
  }

  get(id) {
    return this.byId.get(id) || null;
  }

  harmony(color, mode = "complementary") {
    const [hue, saturation, lightness] = parseColor(color?.value || color);
    const offsets = {
      complementary: [0, 180], analogous: [-30, 0, 30], triadic: [0, 120, 240],
      "split-complementary": [0, 150, 210], monochromatic: [0, 0, 0, 0]
    }[mode] || [0];
    return offsets.map((offset, index) => ({
      name: `${mode} ${index + 1}`,
      value: `hsl(${(hue + offset + 360) % 360} ${saturation}% ${mode === "monochromatic" ? Math.max(12, Math.min(90, lightness - 24 + index * 16)) : lightness}%)`
    }));
  }

  savePalette(name, colors) {
    const palette = { id: `palette-${Date.now()}`, name: String(name || "Saved Palette").trim(), colors: structuredClone(colors), updatedAt: new Date().toISOString() };
    this.storage.saveUnique("palettes", palette);
    return palette;
  }
}
