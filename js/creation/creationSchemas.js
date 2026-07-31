/**
 * Universal creative-goal schemas used by the adaptive creation experience.
 * Categories map into existing UCE project types without exposing studio choices.
 */

const field = (name, label, placeholder, options = {}) => Object.freeze({
  name, label, placeholder, type: "text", required: false, ...options
});

const PEOPLE_FIELDS = Object.freeze([
  field("subjectName", "Name or subject", "e.g. Maya and her family"),
  field("role", "Role or relationship", "e.g. new parent, adventurous siblings"),
  field("appearance", "Appearance", "Distinctive features, clothing, age details", { type: "textarea" }),
  field("personality", "Personality", "Warm, curious, confident"),
  field("setting", "Setting", "Where should the subject appear?"),
  field("moment", "Moment or action", "What is happening in the scene?")
]);

const INVITATION_FIELDS = Object.freeze([
  field("eventTitle", "Event title", "e.g. Jordan & Riley", { required: true }),
  field("eventDate", "Date and time", "e.g. Saturday, June 14 at 4 PM"),
  field("venue", "Venue", "Location or venue name"),
  field("message", "Invitation wording", "Add the message guests should see", { type: "textarea" }),
  field("tone", "Tone", "Elegant, playful, modern"),
  field("details", "Important details", "RSVP, dress code, registry, or theme", { type: "textarea" })
]);

const BRAND_FIELDS = Object.freeze([
  field("brandName", "Brand name", "e.g. Vyrelix", { required: true }),
  field("industry", "Industry", "What does the brand do?"),
  field("audience", "Audience", "Who should this connect with?"),
  field("brandValues", "Brand values", "Bold, refined, trustworthy"),
  field("tagline", "Tagline", "Optional supporting phrase"),
  field("visualDirection", "Visual direction", "Symbols, shapes, and ideas to explore", { type: "textarea" })
]);

const CAMPAIGN_FIELDS = Object.freeze([
  field("headline", "Headline", "The main message", { required: true }),
  field("offer", "Offer or story", "What are you promoting?", { type: "textarea" }),
  field("audience", "Audience", "Who is this for?"),
  field("platform", "Format or platform", "Print, Instagram, story, display ad"),
  field("callToAction", "Call to action", "e.g. Learn more, Shop now"),
  field("campaignTone", "Campaign tone", "Energetic, premium, friendly")
]);

const UNIVERSAL_FIELDS = Object.freeze([
  field("purpose", "Purpose", "What should this creation accomplish?"),
  field("style", "Style", "Modern, cinematic, minimal, editorial"),
  field("mood", "Mood", "How should it feel?"),
  field("palette", "Color direction", "Colors to use or avoid"),
  field("composition", "Composition", "Layout, framing, or focal point"),
  field("lighting", "Lighting", "Soft daylight, dramatic studio, neon glow"),
  field("camera", "Camera and viewpoint", "Close-up, wide angle, overhead, eye level"),
  field("format", "Format and aspect ratio", "Square, portrait, landscape, print size"),
  field("quality", "Detail and finish", "Draft, polished, photoreal, production-ready"),
  field("avoid", "What to avoid", "Unwanted elements, colors, styles, or effects", { type: "textarea" }),
  field("extraDetails", "Additional direction", "Anything else Vyrelix should understand", { type: "textarea" })
]);

const category = ({ id, label, icon, projectType, keywords, fields, ideas }) => Object.freeze({
  id, label, icon, projectType, keywords: Object.freeze(keywords),
  fields: Object.freeze(fields), ideas: Object.freeze(ideas)
});

export const CREATION_CATEGORIES = Object.freeze([
  category({ id: "person", label: "Person", icon: "◉", projectType: "Character", keywords: ["person", "portrait", "woman", "man", "human"], fields: PEOPLE_FIELDS, ideas: ["Editorial portrait", "Candid lifestyle moment", "Cinematic character study"] }),
  category({ id: "family", label: "Family", icon: "⌂", projectType: "Character", keywords: ["family", "parents", "siblings", "couple"], fields: PEOPLE_FIELDS, ideas: ["Warm family portrait", "Joyful everyday memory", "Elegant generational keepsake"] }),
  category({ id: "baby", label: "Baby", icon: "♡", projectType: "Character", keywords: ["baby", "newborn", "infant"], fields: PEOPLE_FIELDS, ideas: ["Soft newborn portrait", "Whimsical nursery moment", "Timeless family keepsake"] }),
  category({ id: "toddler", label: "Toddler", icon: "✦", projectType: "Character", keywords: ["toddler", "young child", "little one"], fields: PEOPLE_FIELDS, ideas: ["Playful discovery scene", "Bright milestone portrait", "Storybook adventure"] }),
  category({ id: "animal", label: "Animal", icon: "◇", projectType: "Creature", keywords: ["animal", "pet", "dog", "cat", "bird", "horse", "wildlife"], fields: Object.freeze([
    field("species", "Species or breed", "e.g. golden retriever", { required: true }),
    field("personality", "Personality", "Playful, noble, curious"),
    field("appearance", "Appearance", "Markings, coat, accessories", { type: "textarea" }),
    field("pose", "Pose or action", "Running, resting, looking at camera"),
    field("setting", "Setting", "Studio, home, forest, beach"),
    field("relationship", "People or companions", "Optional supporting subjects")
  ]), ideas: ["Expressive pet portrait", "Wildlife story moment", "Whimsical animal character"] }),
  category({ id: "fantasy-character", label: "Fantasy Character", icon: "✧", projectType: "Character", keywords: ["fantasy character", "hero", "warrior", "mage", "elf", "character"], fields: PEOPLE_FIELDS, ideas: ["Mythic guardian", "Arcane wanderer", "Royal fantasy portrait"] }),
  category({ id: "wedding-invitation", label: "Wedding Invitation", icon: "♢", projectType: "Poster", keywords: ["wedding invitation", "wedding invite", "save the date"], fields: INVITATION_FIELDS, ideas: ["Botanical elegance", "Modern editorial invitation", "Romantic celestial suite"] }),
  category({ id: "birthday-invitation", label: "Birthday Invitation", icon: "☆", projectType: "Poster", keywords: ["birthday invitation", "birthday invite", "birthday party"], fields: INVITATION_FIELDS, ideas: ["Colorful celebration", "Elegant milestone invitation", "Playful themed party"] }),
  category({ id: "business-card", label: "Business Card", icon: "▤", projectType: "Logo", keywords: ["business card", "calling card"], fields: BRAND_FIELDS, ideas: ["Minimal premium card", "Bold typographic identity", "Refined textured stationery"] }),
  category({ id: "poster", label: "Poster", icon: "▣", projectType: "Poster", keywords: ["poster", "flyer", "event poster"], fields: CAMPAIGN_FIELDS, ideas: ["Bold typographic poster", "Cinematic event artwork", "Minimal editorial composition"] }),
  category({ id: "logo", label: "Logo", icon: "◎", projectType: "Logo", keywords: ["logo", "brand mark", "branding", "identity"], fields: BRAND_FIELDS, ideas: ["Distinctive wordmark", "Memorable symbol system", "Flexible monogram"] }),
  category({ id: "product-mockup", label: "Product Mockup", icon: "▰", projectType: "Object", keywords: ["product mockup", "packaging", "product render", "mockup"], fields: Object.freeze([
    field("productName", "Product name", "e.g. Aurora candle", { required: true }),
    field("productType", "Product type", "Bottle, box, device, apparel"),
    field("materials", "Materials and finish", "Glass, matte paper, brushed metal"),
    field("branding", "Branding details", "Logo placement, label, typography", { type: "textarea" }),
    field("scene", "Mockup scene", "Studio pedestal, lifestyle setting, shelf"),
    field("camera", "View and framing", "Front, three-quarter, close-up")
  ]), ideas: ["Premium studio launch", "Lifestyle product story", "Clean ecommerce presentation"] }),
  category({ id: "book-cover", label: "Book Cover", icon: "▥", projectType: "Book Cover", keywords: ["book cover", "novel cover", "ebook cover"], fields: Object.freeze([
    field("title", "Book title", "Title displayed on the cover", { required: true }),
    field("author", "Author name", "Name displayed on the cover"),
    field("genre", "Genre", "Fantasy, romance, thriller, memoir"),
    field("storyHook", "Story hook", "The central promise or conflict", { type: "textarea" }),
    field("imagery", "Key imagery", "Symbols, characters, or setting"),
    field("coverTone", "Tone", "Atmospheric, bold, intimate")
  ]), ideas: ["Symbolic literary cover", "Cinematic genre cover", "Elegant typographic cover"] }),
  category({ id: "interior", label: "Interior", icon: "⌑", projectType: "Architecture", keywords: ["interior", "room", "kitchen", "bedroom", "living room", "office"], fields: Object.freeze([
    field("room", "Room or space", "Living room, kitchen, boutique", { required: true }),
    field("function", "How it is used", "Relaxing, entertaining, working"),
    field("interiorStyle", "Design style", "Warm modern, art deco, organic"),
    field("materials", "Materials", "Wood, stone, linen, metal"),
    field("palette", "Color palette", "Neutrals with emerald accents"),
    field("lighting", "Lighting", "Soft daylight, dramatic evening")
  ]), ideas: ["Warm modern sanctuary", "Editorial luxury interior", "Practical small-space transformation"] }),
  category({ id: "landscape", label: "Landscape", icon: "△", projectType: "Environment", keywords: ["landscape", "nature", "mountain", "forest", "beach", "garden"], fields: Object.freeze([
    field("location", "Location", "Coast, forest, desert, imagined world", { required: true }),
    field("season", "Season and weather", "Autumn mist, summer sun, fresh snow"),
    field("time", "Time of day", "Golden hour, blue hour, night"),
    field("features", "Key features", "Mountains, water, architecture", { type: "textarea" }),
    field("atmosphere", "Atmosphere", "Serene, dramatic, mysterious"),
    field("viewpoint", "Viewpoint", "Aerial, eye level, sweeping panorama")
  ]), ideas: ["Epic cinematic vista", "Quiet atmospheric landscape", "Dreamlike natural world"] }),
  category({ id: "vehicle", label: "Vehicle", icon: "➤", projectType: "Vehicle", keywords: ["vehicle", "car", "motorcycle", "truck", "spaceship", "aircraft"], fields: Object.freeze([
    field("vehicleType", "Vehicle type", "Sports car, motorcycle, spacecraft", { required: true }),
    field("purpose", "Purpose", "Racing, exploration, everyday travel"),
    field("era", "Era", "Vintage, contemporary, near future"),
    field("form", "Shape and features", "Silhouette, components, modifications", { type: "textarea" }),
    field("finish", "Color and finish", "Pearl white, weathered steel"),
    field("environment", "Environment", "Studio, city, track, alien terrain")
  ]), ideas: ["Hero vehicle reveal", "Technical concept design", "Cinematic motion scene"] }),
  category({ id: "social-media-graphic", label: "Social Media Graphic", icon: "◫", projectType: "Poster", keywords: ["social media", "instagram", "social post", "story graphic"], fields: CAMPAIGN_FIELDS, ideas: ["Scroll-stopping announcement", "Branded carousel cover", "Polished story campaign"] }),
  category({ id: "advertisement", label: "Advertisement", icon: "◈", projectType: "Poster", keywords: ["advertisement", "advert", "ad campaign", "promotion"], fields: CAMPAIGN_FIELDS, ideas: ["Premium product campaign", "Direct-response promotion", "Emotional brand story"] }),
  category({ id: "anything", label: "Anything…", icon: "∞", projectType: "Object", keywords: [], fields: UNIVERSAL_FIELDS, ideas: ["Unexpected creative direction", "Elegant visual concept", "Bold experimental idea"] })
]);

export const CREATION_MODES = Object.freeze([
  Object.freeze({ id: "quick", icon: "⚡", name: "Quick Create", description: "One description. Vyrelix fills in the rest." }),
  Object.freeze({ id: "guided", icon: "🎨", name: "Guided Creator", description: "Answer only the questions relevant to your goal." }),
  Object.freeze({ id: "advanced", icon: "🛠", name: "Advanced Creator", description: "Open every available creative control." }),
  Object.freeze({ id: "director", icon: "🤖", name: "AI Creative Director", description: "Build the direction through a focused conversation." }),
  Object.freeze({ id: "inspire", icon: "🎲", name: "Inspire Me", description: "Generate, mix, and favorite creative ideas." }),
  Object.freeze({ id: "templates", icon: "📄", name: "Templates", description: "Begin with a professional creative direction." }),
  Object.freeze({ id: "reference", icon: "📷", name: "Reference Mode", description: "Upload images and build from local analysis." })
]);

export function getCreationCategory(id) {
  return CREATION_CATEGORIES.find((item) => item.id === id) || CREATION_CATEGORIES.at(-1);
}

export function getCreationMode(id) {
  return CREATION_MODES.find((item) => item.id === id) || CREATION_MODES[0];
}

export function inferCreationCategory(goal = "") {
  const normalized = String(goal).toLocaleLowerCase();
  const candidates = CREATION_CATEGORIES
    .filter((item) => item.id !== "anything")
    .map((item) => {
      const label = item.label.toLocaleLowerCase();
      const matchedKeywords = item.keywords.filter((keyword) => normalized.includes(keyword));
      const labelMatch = normalized.includes(label);
      const longestKeyword = Math.max(0, ...matchedKeywords.map((keyword) => keyword.length));
      return { item, score: (labelMatch ? 1000 : 0) + longestKeyword };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score);
  return candidates[0]?.item || getCreationCategory("anything");
}

export function advancedFields(category) {
  const names = new Set(category.fields.map((item) => item.name));
  return [...category.fields, ...UNIVERSAL_FIELDS.filter((item) => !names.has(item.name))];
}

export function smartDefaults(category, goal) {
  const result = {};
  category.fields.forEach((item, index) => {
    result[item.name] = index === 0 ? String(goal).trim() : "";
  });
  return result;
}
