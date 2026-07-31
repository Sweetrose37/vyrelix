import { createId } from "../../utilities/helpers.js";
import { inferCreationCategory } from "./creationSchemas.js";

const PANEL_GROUPS = Object.freeze({
  Foundation: ["subject", "purpose", "story", "theme", "mood", "environment", "scene", "background", "foreground"],
  Visual: ["artistic-style", "palette", "color-harmony", "lighting", "composition", "camera", "lens", "perspective", "rendering", "quality", "aspect-ratio", "output-size"],
  Brand: ["typography", "brand-identity", "logo-style", "layout", "headline", "call-to-action"],
  Materials: ["materials", "paper", "foil", "embossing", "texture", "fabric", "glass", "wood", "metal", "plastic", "gemstones"],
  Character: ["hair", "eyes", "face", "body", "pose", "expression", "clothing", "accessories", "armor", "weapons"],
  World: ["architecture", "nature", "animals", "weather", "time-of-day", "season", "vehicle-details"],
  Effects: ["magic", "special-effects", "particles", "smoke", "fire", "water", "snow"],
  Advanced: ["negative-prompt", "seed", "model", "advanced-controls"]
});

const LABEL_OVERRIDES = Object.freeze({
  "artistic-style": "Artistic Style",
  "color-harmony": "Color Harmony",
  "aspect-ratio": "Aspect Ratio",
  "output-size": "Output Size",
  "brand-identity": "Brand Identity",
  "logo-style": "Logo Style",
  "call-to-action": "Call to Action",
  "time-of-day": "Time of Day",
  "vehicle-details": "Vehicle Details",
  "special-effects": "Special Effects",
  "negative-prompt": "Negative Prompt",
  "advanced-controls": "Advanced AI Controls"
});

const PANEL_HINTS = Object.freeze({
  subject: "What is the central subject or message?",
  purpose: "What should this creation accomplish?",
  story: "What is happening, and why does it matter?",
  theme: "What idea connects the whole direction?",
  mood: "How should the finished work feel?",
  environment: "Where does the idea exist?",
  scene: "Describe the moment or spatial arrangement.",
  "artistic-style": "Choose or describe the visual language.",
  palette: "Add colors, finishes, and colors to avoid.",
  lighting: "Describe the light quality and direction.",
  composition: "Define hierarchy, balance, and focal point.",
  typography: "Describe type style, hierarchy, and lettering.",
  materials: "Choose physical or simulated materials.",
  rendering: "Define the production and rendering approach.",
  "negative-prompt": "List unwanted qualities or elements.",
  seed: "Use a repeatable numeric seed.",
  "aspect-ratio": "Square, portrait, landscape, or custom.",
  quality: "Draft, polished, premium, or production-ready."
});

const PANEL_SUGGESTIONS = Object.freeze({
  subject: ["Primary hero subject", "Product-focused subject", "People-centered subject", "Environment-led subject"],
  story: ["A clear transformation", "A memorable reveal", "An intimate human moment", "A bold aspirational narrative"],
  theme: ["Modern elegance", "Nature and renewal", "Future-forward innovation", "Celebration and connection"],
  environment: ["Clean studio setting", "Natural outdoor setting", "Premium interior", "Cinematic imagined world"],
  scene: ["Hero reveal", "Quiet detail moment", "Dynamic action scene", "Editorial still life"],
  purpose: ["Create a memorable first impression", "Communicate clearly at a glance", "Feel polished and production-ready"],
  mood: ["Luxurious and confident", "Warm and inviting", "Cinematic and dramatic", "Playful and energetic", "Quiet and refined"],
  "artistic-style": ["Luxury editorial", "Cinematic realism", "Modern minimalism", "Art Deco", "Bold vector illustration"],
  palette: ["Black, burnished gold, and ivory", "Warm neutrals with one vivid accent", "Deep jewel tones", "Monochrome with metallic highlights"],
  lighting: ["Soft directional studio light", "Golden-hour rim lighting", "Dramatic high-contrast lighting", "Even editorial illumination"],
  composition: ["Clear centered hierarchy", "Asymmetrical editorial grid", "Rule-of-thirds focal point", "Generous negative space"],
  typography: ["High-contrast serif with restrained sans serif", "Modern geometric sans serif", "Elegant custom lettering", "Bold condensed display type"],
  materials: ["Matte paper with metallic foil", "Brushed metal and glass", "Natural wood and linen", "Glossy molded plastic"],
  rendering: ["Photorealistic product visualization", "Crisp vector finish", "Detailed cinematic render", "Tactile editorial illustration"],
  "negative-prompt": ["low quality, visual artifacts, unintended cropping, watermark", "clutter, weak hierarchy, unreadable type, muddy colors"],
  "aspect-ratio": ["1:1 square", "4:5 portrait", "16:9 landscape", "9:16 vertical"],
  quality: ["Production-ready", "Premium detail", "Presentation quality"],
  background: ["Clean seamless background", "Contextual lifestyle environment", "Layered atmospheric depth"],
  camera: ["Eye-level editorial view", "Three-quarter product view", "Wide establishing view", "Macro detail"],
  texture: ["Fine uncoated paper grain", "Subtle brushed finish", "Soft tactile fabric", "Polished reflective surface"]
});

const GROUP_SUGGESTIONS = Object.freeze({
  Foundation: ["Clear and focused", "Rich and detailed", "Minimal and refined", "Bold and expressive"],
  Visual: ["Balanced professional direction", "Cinematic premium direction", "Clean minimal direction", "Experimental creative direction"],
  Brand: ["Premium editorial system", "Modern accessible system", "Bold campaign system", "Elegant heritage system"],
  Materials: ["Matte tactile finish", "Polished reflective finish", "Natural organic finish", "Premium metallic finish"],
  Character: ["Natural and expressive", "Heroic and confident", "Stylized and playful", "Elegant and composed"],
  World: ["Grounded realism", "Cinematic atmosphere", "Imaginative fantasy", "Future-forward environment"],
  Effects: ["Subtle atmospheric effect", "Dynamic dramatic effect", "Soft magical effect", "Clean effect-free finish"],
  Advanced: ["Balanced defaults", "High detail", "Fast draft", "Maximum creative control"]
});

function titleCase(value) {
  return String(value).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const CREATIVE_PANELS = Object.freeze(
  Object.entries(PANEL_GROUPS).flatMap(([group, ids]) => ids.map((id) => Object.freeze({
    id,
    group,
    label: LABEL_OVERRIDES[id] || titleCase(id),
    hint: PANEL_HINTS[id] || `Define the ${titleCase(id).toLocaleLowerCase()} for this creation.`,
    suggestions: Object.freeze(PANEL_SUGGESTIONS[id] || GROUP_SUGGESTIONS[group] || [])
  })))
);

const BASE_STYLES = Object.freeze([
  "Photorealistic", "Editorial", "Luxury", "Minimal", "Anime", "Manga", "Comic", "Fantasy", "Dark Fantasy", "Sci-Fi",
  "Cyberpunk", "Steampunk", "Noir", "Concept Art", "Oil Painting", "Watercolor", "Ink", "Sketch", "Pastel", "Pixel Art",
  "Voxel", "Clay", "3D", "Low Poly", "Flat Illustration", "Sticker", "Children’s Book", "Paper Cut", "Vintage", "Retro",
  "Y2K", "Vaporwave", "Synthwave", "Art Deco", "Art Nouveau", "Impressionism", "Expressionism", "Abstract", "Surrealism",
  "Pop Art", "Graffiti", "Street Art", "Vector", "Blueprint", "Architectural Rendering", "Fashion Photography",
  "Luxury Product Photography", "Macro Photography", "Cinematic", "Film Still", "Magazine Editorial", "Bauhaus", "Brutalist",
  "Organic Modern", "Memphis", "Swiss International", "Gothic", "Baroque", "Rococo", "Mid-century Modern", "Futurist"
]);
const STYLE_VARIANTS = Object.freeze(["Signature", "Refined", "Expressive", "Contemporary", "Experimental"]);

export const ARTISTIC_STYLES = Object.freeze(BASE_STYLES.flatMap((style) =>
  STYLE_VARIANTS.map((variant) => Object.freeze({
    id: `${style}-${variant}`.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: `${variant} ${style}`,
    family: style,
    tags: [style.toLocaleLowerCase(), variant.toLocaleLowerCase()]
  }))
));

export const EVERYTHING_LIBRARY = Object.freeze([
  "People", "Characters", "Animals", "Creatures", "Fantasy", "Monsters", "Robots", "Vehicles", "Architecture", "Buildings",
  "Landscapes", "Cities", "Worlds", "Products", "Packaging", "Mockups", "Logos", "Brand Identity", "Business Cards", "Flyers",
  "Posters", "Brochures", "Menus", "Wedding Invitations", "Birthday Invitations", "Greeting Cards", "Book Covers", "Magazine Covers",
  "Album Covers", "Movie Posters", "Comic Covers", "Trading Cards", "Children’s Books", "Illustrations", "Paintings", "Photography",
  "Fashion", "Jewelry", "Furniture", "Home Decor", "Interior Design", "Exterior Design", "Game Assets", "Icons", "UI Design",
  "UX Design", "Websites", "Landing Pages", "Dashboards", "Apps", "Wireframes", "Presentations", "Infographics", "Social Media Posts",
  "Instagram Stories", "TikTok Covers", "YouTube Thumbnails", "Ads", "Billboards", "Email Headers", "Merchandise", "T-Shirts",
  "Mugs", "Phone Cases", "Patterns", "Textures", "Wallpaper", "Emoji", "Memes", "NFT Concepts", "Pixel Art", "Voxel Art",
  "Low Poly", "3D Models", "3D Scenes", "Collectibles", "Action Figures", "Toy Packaging", "Trading Figures", "Sticker Packs",
  "Individual Stickers", "Die Cut Stickers", "Emoji Packs", "Icon Packs", "Coloring Books", "Tattoos", "Certificates", "Resumes",
  "Product Labels", "Bottle Labels", "Food Packaging", "Cosmetics", "Perfume Bottles", "Luxury Boxes"
]);

const VOCABULARIES = Object.freeze({
  style: BASE_STYLES,
  colors: ["black", "white", "gold", "silver", "ivory", "cream", "red", "orange", "yellow", "green", "emerald", "blue", "navy", "purple", "pink", "teal", "bronze", "copper", "pastel", "monochrome"],
  mood: ["luxury", "luxurious", "elegant", "playful", "cinematic", "dramatic", "romantic", "minimal", "bold", "warm", "moody", "futuristic", "friendly", "premium", "whimsical"],
  materials: ["paper", "foil", "gold foil", "embossing", "glass", "wood", "metal", "plastic", "fabric", "silk", "linen", "gemstone", "leather", "ceramic", "chrome"],
  typography: ["serif", "sans serif", "script", "calligraphy", "handwritten", "condensed", "geometric", "typographic", "lettering"],
  composition: ["centered", "symmetrical", "asymmetrical", "grid", "minimal", "close-up", "wide angle", "overhead", "negative space"],
  rendering: ["photorealistic", "realistic", "3d", "vector", "illustration", "render", "painting", "sketch", "high detail", "production-ready"],
  lighting: ["soft light", "studio light", "golden hour", "rim light", "neon", "dramatic lighting", "daylight", "backlit"]
});

const CATEGORY_PANELS = Object.freeze({
  Character: ["subject", "story", "mood", "artistic-style", "hair", "eyes", "face", "body", "pose", "expression", "clothing", "accessories", "lighting", "composition", "palette", "rendering"],
  Creature: ["subject", "story", "environment", "mood", "artistic-style", "body", "pose", "expression", "texture", "lighting", "composition", "palette", "rendering"],
  Poster: ["purpose", "headline", "subject", "theme", "artistic-style", "typography", "palette", "layout", "composition", "call-to-action", "quality"],
  Logo: ["purpose", "brand-identity", "logo-style", "artistic-style", "typography", "palette", "composition", "negative-prompt"],
  Architecture: ["purpose", "architecture", "environment", "materials", "lighting", "perspective", "camera", "artistic-style", "weather", "time-of-day", "rendering"],
  Environment: ["environment", "nature", "weather", "season", "time-of-day", "mood", "lighting", "composition", "camera", "palette", "artistic-style"],
  Vehicle: ["subject", "vehicle-details", "materials", "environment", "camera", "lighting", "composition", "palette", "rendering"],
  "Book Cover": ["title", "story", "subject", "mood", "artistic-style", "typography", "palette", "composition", "rendering"],
  Object: ["subject", "purpose", "materials", "artistic-style", "palette", "lighting", "composition", "camera", "rendering", "quality"],
  Scene: ["story", "scene", "environment", "subject", "mood", "lighting", "camera", "composition", "artistic-style", "rendering"],
  Icon: ["subject", "purpose", "artistic-style", "palette", "composition", "rendering", "negative-prompt"]
});

function matches(text, item) {
  return text.includes(item.toLocaleLowerCase());
}

function detect(text, vocabulary) {
  return vocabulary.filter((item) => matches(text, item)).slice(0, 5);
}

function panel(kind, value = "", source = "ai") {
  const descriptor = CREATIVE_PANELS.find((item) => item.id === kind) || {
    id: kind, label: titleCase(kind), group: "Custom", hint: `Define ${titleCase(kind).toLocaleLowerCase()}.`, suggestions: []
  };
  return {
    uid: createId("panel"),
    kind: descriptor.id,
    label: descriptor.label,
    group: descriptor.group,
    value,
    source,
    locked: false,
    collapsed: false
  };
}

export function buildPromptFromSpecification(specification) {
  const sections = specification.sections
    .filter((section) => String(section.value || "").trim())
    .map((section) => `${section.label}: ${String(section.value).trim()}`);
  return [
    `Create ${specification.categoryLabel || "an original creative work"}.`,
    specification.goal ? `Creative goal: ${specification.goal}.` : "",
    ...sections
  ].filter(Boolean).join(" ");
}

export function analyzeCreativeIntent(description) {
  const goal = String(description || "").trim();
  const text = goal.toLocaleLowerCase();
  const category = inferCreationCategory(goal);
  const detected = {
    style: detect(text, VOCABULARIES.style),
    colors: detect(text, VOCABULARIES.colors),
    mood: detect(text, VOCABULARIES.mood),
    materials: detect(text, VOCABULARIES.materials),
    typography: detect(text, VOCABULARIES.typography),
    composition: detect(text, VOCABULARIES.composition),
    rendering: detect(text, VOCABULARIES.rendering),
    lighting: detect(text, VOCABULARIES.lighting)
  };
  const values = {
    subject: goal,
    purpose: goal,
    "artistic-style": detected.style.join(", "),
    palette: detected.colors.join(", "),
    mood: detected.mood.join(", "),
    materials: detected.materials.join(", "),
    typography: detected.typography.join(", "),
    composition: detected.composition.join(", "),
    rendering: detected.rendering.join(", "),
    lighting: detected.lighting.join(", "),
    quality: "Production-ready"
  };
  const kinds = [...new Set(CATEGORY_PANELS[category.projectType] || CATEGORY_PANELS.Object)];
  const sections = kinds.map((kind) => panel(kind, values[kind] || "", values[kind] ? "detected" : "suggested"));
  const specification = {
    id: createId("spec"),
    goal,
    categoryId: category.id,
    categoryLabel: category.label,
    projectType: category.projectType,
    confidence: category.id === "anything" ? 0.62 : 0.91,
    detected,
    sections,
    references: [],
    negativePrompt: "low quality, visual artifacts, weak hierarchy, unintended cropping, watermark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  specification.prompt = buildPromptFromSpecification(specification);
  return specification;
}

export function blankSpecification(goal = "") {
  const specification = analyzeCreativeIntent(goal || "A new original creation");
  specification.goal = goal;
  specification.categoryId = "anything";
  specification.categoryLabel = "Creative Project";
  specification.projectType = "Object";
  specification.sections = ["subject", "purpose", "artistic-style", "palette", "composition", "quality"].map((kind) => panel(kind, kind === "subject" ? goal : "", "manual"));
  specification.prompt = buildPromptFromSpecification(specification);
  return specification;
}

export function createPanel(kind, value = "", source = "manual") {
  return panel(kind, value, source);
}

export function recommendCompletions(specification) {
  return specification.sections
    .filter((section) => !section.locked && !String(section.value || "").trim())
    .map((section) => ({
      id: createId("suggestion"),
      panelUid: section.uid,
      kind: section.kind,
      label: section.label,
      before: section.value,
      after: PANEL_SUGGESTIONS[section.kind]?.[0] || `A cohesive ${section.label.toLocaleLowerCase()} that supports ${specification.goal || "the creative goal"}`,
      reason: `Completes the ${section.label.toLocaleLowerCase()} while matching the current direction`
    }));
}

export function contextualSuggestion(specification, action) {
  const transformations = Object.freeze({
    next: ["purpose", "Clarify the primary audience and the single response this creation should inspire"],
    improve: ["quality", "Production-ready detail, stronger hierarchy, and a more cohesive finish"],
    style: ["artistic-style", "Refined contemporary editorial direction tailored to the current subject and audience"],
    colors: ["palette", "A cohesive primary, supporting, and accent palette with accessible contrast"],
    lighting: ["lighting", "Purposeful directional lighting that reinforces the subject, mood, and material finish"],
    composition: ["composition", "A clear focal point, balanced hierarchy, and intentional negative space"],
    cinematic: ["lighting", "Cinematic directional lighting with atmospheric depth and deliberate contrast"],
    luxurious: ["materials", "Premium tactile materials, restrained metallic accents, and impeccable finishing"],
    realistic: ["rendering", "Photorealistic material response, accurate proportions, and natural light behavior"],
    creative: ["artistic-style", "Unexpected contemporary fusion with one memorable signature element"],
    detail: ["quality", "Intricate, intentional micro-detail with clean production-ready edges"],
    simplify: ["composition", "Focused visual hierarchy, fewer competing elements, and generous negative space"],
    trends: ["artistic-style", "Contemporary editorial direction with bold type, tactile depth, and expressive restraint"],
    surprise: ["mood", "An unexpected contrast between quiet elegance and one playful visual interruption"]
  });
  const [kind, after] = transformations[action] || transformations.improve;
  const existing = specification.sections.find((section) => section.kind === kind);
  return {
    id: createId("suggestion"),
    panelUid: existing?.uid || "",
    kind,
    label: CREATIVE_PANELS.find((item) => item.id === kind)?.label || titleCase(kind),
    before: existing?.value || "",
    after,
    reason: "Previewed creative direction—apply only if it fits your intent"
  };
}
