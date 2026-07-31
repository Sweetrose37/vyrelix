/**
 * Mobile-first guided creation metadata. It adapts the existing Universal
 * Creative Engine without changing the persisted project schema.
 */
import { CREATION_CATEGORIES, getCreationCategory } from "./creationSchemas.js";
import {
  CREATIVE_PANELS,
  analyzeCreativeIntent,
  buildPromptFromSpecification,
  createPanel
} from "./creativeIntelligence.js";

const option = (label, value = label, swatch = "") => Object.freeze({ label, value, swatch });
const choices = (...labels) => Object.freeze(labels.map((label) => option(label)));

const SKIN_TONES = Object.freeze([
  option("Porcelain", "Porcelain skin tone", "#f6d6c7"),
  option("Fair", "Fair skin tone", "#eac0a8"),
  option("Light", "Light skin tone", "#dca986"),
  option("Medium", "Medium skin tone", "#bd7f5b"),
  option("Tan", "Tan skin tone", "#9b6042"),
  option("Deep", "Deep skin tone", "#6f422f"),
  option("Rich", "Rich deep skin tone", "#3f281f")
]);

const PALETTES = Object.freeze([
  option("Soft Neutrals", "Ivory, warm beige, taupe, charcoal", "linear-gradient(135deg,#f4ead8 0 25%,#cdbda6 25% 50%,#89796a 50% 75%,#302e32 75%)"),
  option("Black & Gold", "Black, burnished gold, warm ivory", "linear-gradient(135deg,#111116 0 34%,#c8a65d 34% 67%,#f6edda 67%)"),
  option("Ocean", "Deep navy, ocean blue, seafoam, white", "linear-gradient(135deg,#0d2748 0 25%,#247ba0 25% 50%,#8ad4c8 50% 75%,#f7fbff 75%)"),
  option("Earth", "Forest green, clay, sand, cream", "linear-gradient(135deg,#344e41 0 25%,#a15c3a 25% 50%,#d9c3a2 50% 75%,#f4efe4 75%)"),
  option("Sunset", "Plum, coral, apricot, golden yellow", "linear-gradient(135deg,#5b285e 0 25%,#e76f51 25% 50%,#f4a261 50% 75%,#e9c46a 75%)"),
  option("Candy", "Berry pink, lilac, sky blue, lemon", "linear-gradient(135deg,#ed6a9e 0 25%,#b99bea 25% 50%,#82c8e5 50% 75%,#f7df72 75%)")
]);

const PERSON_STEPS = Object.freeze([
  Object.freeze({ id: "gender", group: "Identity", label: "Character Type", prompt: "Choose how this character is represented.", options: choices("Woman", "Man", "Non-binary", "Androgynous", "Girl", "Boy"), allowCustom: true }),
  Object.freeze({ id: "age", group: "Identity", label: "Age Group", prompt: "Choose the character's life stage.", options: choices("Baby", "Toddler", "Child", "Teen", "Young Adult", "Adult", "Middle Aged", "Senior"), allowCustom: true }),
  Object.freeze({ id: "bodyType", group: "Body", label: "Body Type", prompt: "Choose a body shape and build.", options: choices("Slim", "Athletic", "Average", "Curvy", "Plus Size", "Muscular", "Petite", "Broad", "Soft"), allowCustom: true }),
  Object.freeze({ id: "height", group: "Body", label: "Height", prompt: "Choose the character's height.", options: choices("Petite", "Short", "Average Height", "Tall", "Very Tall"), allowCustom: true }),
  Object.freeze({ id: "skinTone", group: "Body", label: "Skin Tone", prompt: "Choose a skin tone.", options: SKIN_TONES, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "faceShape", group: "Face", label: "Face Shape", prompt: "Choose the face shape.", options: choices("Oval", "Round", "Square", "Heart", "Diamond", "Oblong", "Soft baby face"), allowCustom: true }),
  Object.freeze({ id: "eyebrows", group: "Face", label: "Eyebrows", prompt: "Choose an eyebrow style.", options: choices("Natural", "Soft Arch", "High Arch", "Straight", "Full", "Fine", "Feathered"), allowCustom: true }),
  Object.freeze({ id: "eyeShape", group: "Face", label: "Eye Shape", prompt: "Choose an eye shape.", options: choices("Almond", "Round", "Hooded", "Monolid", "Upturned", "Downturned", "Wide Set", "Close Set"), allowCustom: true }),
  Object.freeze({ id: "eyeColor", group: "Face", label: "Eye Color", prompt: "Choose an eye color.", options: choices("Deep Brown", "Warm Brown", "Hazel", "Green", "Blue", "Gray", "Amber", "Violet", "Two-Tone"), allowCustom: true }),
  Object.freeze({ id: "facialDetails", group: "Face", label: "Facial Details", prompt: "Add the details that make the face distinctive.", options: choices("Freckles", "Dimples", "Beauty Mark", "Soft Features", "Angular Features", "Rosy Cheeks", "None"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "hairStyle", group: "Hair", label: "Hair Style", prompt: "Choose a hairstyle.", options: choices("Silk Press", "Afro", "Curls", "Waves", "Box Braids", "Cornrows", "Locs", "Twists", "Bob", "Pixie", "Fade", "Buzz Cut", "Ponytail", "Bun", "Pigtails", "Bald"), allowCustom: true }),
  Object.freeze({ id: "hairLength", group: "Hair", label: "Hair Length", prompt: "Choose the hair length.", options: choices("Bald", "Very Short", "Short", "Shoulder Length", "Long", "Waist Length", "Extra Long"), allowCustom: true }),
  Object.freeze({ id: "hairTexture", group: "Hair", label: "Hair Texture", prompt: "Choose the hair texture.", options: choices("Straight", "Wavy", "Loose Curls", "Tight Curls", "Coily", "Kinky-Coily", "Silky", "Fluffy"), allowCustom: true }),
  Object.freeze({ id: "hairColor", group: "Hair", label: "Hair Color", prompt: "Choose a hair color.", options: choices("Jet Black", "Soft Black", "Dark Brown", "Chestnut", "Honey Blonde", "Platinum", "Auburn", "Copper", "Gray", "White", "Pastel", "Fantasy Ombre"), allowCustom: true }),
  Object.freeze({ id: "facialHair", group: "Face", label: "Facial Hair", prompt: "Choose facial hair if desired.", options: choices("None", "Clean Shaven", "Stubble", "Mustache", "Goatee", "Short Beard", "Full Beard", "Braided Beard"), allowCustom: true }),
  Object.freeze({ id: "makeup", group: "Face", label: "Makeup", prompt: "Choose a makeup direction.", options: choices("None", "Natural", "Soft Glam", "Full Glam", "Editorial", "Fantasy", "Face Paint", "Stage Makeup"), allowCustom: true }),
  Object.freeze({ id: "clothingStyle", group: "Wardrobe", label: "Clothing Style", prompt: "Choose the overall wardrobe style.", options: choices("Luxury", "Casual", "Streetwear", "Business", "Preppy", "Bohemian", "Fantasy", "Historical", "Sportswear", "Swimwear", "Traditional", "Futuristic", "Formal"), allowCustom: true }),
  Object.freeze({ id: "top", group: "Wardrobe", label: "Tops", prompt: "Choose a top or upper-body garment.", options: choices("T-Shirt", "Blouse", "Button-Down", "Sweater", "Hoodie", "Crop Top", "Tank Top", "Corset", "Tunic", "Jersey", "Baby Onesie", "Graphic Tee"), allowCustom: true }),
  Object.freeze({ id: "bottom", group: "Wardrobe", label: "Bottoms", prompt: "Choose bottoms.", options: choices("Jeans", "Tailored Trousers", "Joggers", "Leggings", "Shorts", "Mini Skirt", "Midi Skirt", "Maxi Skirt", "Cargo Pants", "Diaper Cover", "School Uniform Bottom"), allowCustom: true }),
  Object.freeze({ id: "outfit", group: "Wardrobe", label: "Dresses & Full Outfits", prompt: "Choose a complete outfit if preferred.", options: choices("Evening Gown", "Cocktail Dress", "Sundress", "Suit", "Tuxedo", "Jumpsuit", "Romper", "Tracksuit", "Fantasy Armor", "Royal Robes", "Baby Set", "Toddler Set"), allowCustom: true }),
  Object.freeze({ id: "outerwear", group: "Wardrobe", label: "Outerwear", prompt: "Choose an outer layer.", options: choices("None", "Blazer", "Leather Jacket", "Denim Jacket", "Trench Coat", "Puffer Jacket", "Cape", "Fur Coat", "Cardigan", "Varsity Jacket", "Raincoat"), allowCustom: true }),
  Object.freeze({ id: "shoes", group: "Wardrobe", label: "Shoes", prompt: "Choose the footwear.", options: choices("Barefoot", "Sneakers", "High Tops", "Loafers", "Dress Shoes", "Heels", "Boots", "Sandals", "Slides", "Ballet Flats", "Baby Booties", "Light-Up Shoes", "Fantasy Boots"), allowCustom: true }),
  Object.freeze({ id: "accessories", group: "Accessories", label: "Accessories", prompt: "Choose any finishing accessories.", options: choices("Glasses", "Sunglasses", "Hat", "Headband", "Scarf", "Handbag", "Backpack", "Watch", "Belt", "Hair Bows", "Pacifier", "None"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "jewelry", group: "Accessories", label: "Jewelry", prompt: "Choose jewelry details.", options: choices("Earrings", "Necklace", "Bracelets", "Rings", "Body Jewelry", "Pearls", "Gold Jewelry", "Silver Jewelry", "Beaded Jewelry", "None"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "props", group: "Accessories", label: "Props", prompt: "Give the character something to interact with.", options: choices("Phone", "Book", "Flowers", "Coffee Cup", "Camera", "Sports Ball", "Toy", "Stuffed Animal", "Musical Instrument", "Sword", "Magic Staff", "Laptop", "None"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "pose", group: "Direction", label: "Pose", prompt: "Choose a pose.", options: choices("Standing", "Walking", "Sitting", "Leaning", "Fashion Pose", "Running", "Dancing", "Portrait", "Action Pose", "Crawling", "Playing", "Sleeping"), allowCustom: true }),
  Object.freeze({ id: "expression", group: "Direction", label: "Expression", prompt: "Choose an expression.", options: choices("Happy", "Confident", "Serious", "Laughing", "Cute", "Sad", "Angry", "Relaxed", "Surprised", "Shy", "Playful", "Curious", "Sleepy"), allowCustom: true }),
  Object.freeze({ id: "artisticStyle", group: "Scene", label: "Artistic Style", prompt: "Choose the visual language.", options: choices("Photorealistic", "Semi-Realistic", "Expressive 3D", "Anime", "Pixar-inspired", "Comic", "Watercolor", "Oil Painting", "Pencil Sketch", "Fantasy", "Cyberpunk", "Concept Art", "Voxel", "Pixel Art", "Sticker", "Clay", "3D Render"), visual: "style", allowCustom: true }),
  Object.freeze({ id: "background", group: "Scene", label: "Background", prompt: "Choose the setting.", options: choices("Studio", "Bedroom", "Luxury Home", "Playroom", "School", "Beach", "Forest", "Cafe", "Street", "City", "Mountains", "White Background", "Transparent", "Fantasy World"), allowCustom: true }),
  Object.freeze({ id: "lighting", group: "Scene", label: "Lighting", prompt: "Choose the lighting atmosphere.", options: choices("Studio", "Soft Daylight", "Golden Hour", "Cinematic", "Neon", "Night", "Indoor", "Outdoor", "Dreamy Glow", "Flash Photography"), allowCustom: true }),
  Object.freeze({ id: "colorPalette", group: "Scene", label: "Color Palette", prompt: "Choose a palette to guide the final look.", options: PALETTES, visual: "palette", allowCustom: true })
]);

const AGE_WARDROBE_OVERRIDES = Object.freeze({
  baby: Object.freeze({
    clothingStyle: choices("Cozy", "Classic", "Playful", "Luxury Keepsake", "Seasonal", "Traditional"),
    top: choices("Baby Onesie", "Bodysuit", "Soft T-Shirt", "Knit Sweater", "Sleep Top"),
    bottom: choices("Soft Leggings", "Bloomers", "Diaper Cover", "Pull-On Pants", "Footed Pants"),
    outfit: choices("Baby Set", "Romper", "Sleep and Play", "Christening Outfit", "Snowsuit", "Special Occasion Set"),
    outerwear: choices("None", "Cardigan", "Soft Jacket", "Puffer Suit", "Rain Suit"),
    shoes: choices("Barefoot", "Socks", "Baby Booties", "Crib Shoes", "Soft-Sole Shoes", "Soft Sandals"),
    accessories: choices("Hair Bow", "Headband", "Knit Hat", "Bib", "Pacifier", "Swaddle", "None"),
    jewelry: choices("None", "Keepsake Bracelet", "ID Bracelet", "Tiny Stud Earrings"),
    props: choices("Stuffed Animal", "Rattle", "Bottle", "Board Book", "Soft Toy", "Blanket", "Teething Toy"),
    pose: choices("Lying Down", "Tummy Time", "Supported Sitting", "Crawling", "Sleeping", "Reaching", "Cuddling")
  }),
  toddler: Object.freeze({
    clothingStyle: choices("Playful", "Everyday", "Preppy", "Mini Streetwear", "Dressy", "Seasonal", "Traditional"),
    top: choices("Graphic Tee", "Polo", "Sweater", "Hoodie", "Tunic", "Button-Down", "Tank Top"),
    bottom: choices("Pull-On Jeans", "Joggers", "Leggings", "Shorts", "Skirt", "Overalls"),
    outfit: choices("Toddler Set", "Romper", "Overalls", "Party Dress", "Mini Suit", "Pajama Set", "Rain Set"),
    outerwear: choices("None", "Cardigan", "Denim Jacket", "Puffer Jacket", "Raincoat", "Fleece"),
    shoes: choices("Barefoot", "Sneakers", "Light-Up Shoes", "Rain Boots", "Sandals", "Slip-Ons", "Dress Shoes"),
    accessories: choices("Glasses", "Sun Hat", "Hair Bows", "Headband", "Mini Backpack", "Beanie", "None"),
    jewelry: choices("None", "Beaded Bracelet", "Keepsake Necklace"),
    props: choices("Stuffed Animal", "Toy", "Picture Book", "Blocks", "Ball", "Crayon", "Bubble Wand", "Snack Cup"),
    pose: choices("Standing", "Walking", "Running", "Sitting", "Dancing", "Playing", "Jumping", "Napping")
  }),
  child: Object.freeze({
    clothingStyle: choices("Everyday", "Playful", "Preppy", "Streetwear", "Sportswear", "Formal", "Fantasy", "Traditional"),
    top: choices("Graphic Tee", "Polo", "Blouse", "Button-Down", "Sweater", "Hoodie", "Jersey"),
    bottom: choices("Jeans", "Joggers", "Leggings", "Shorts", "Skirt", "Cargo Pants", "School Uniform Bottom"),
    outfit: choices("School Uniform", "Party Dress", "Suit", "Tracksuit", "Overalls", "Fantasy Costume", "Dance Outfit"),
    outerwear: choices("None", "Cardigan", "Denim Jacket", "Varsity Jacket", "Puffer Jacket", "Raincoat"),
    shoes: choices("Sneakers", "High Tops", "Light-Up Shoes", "Boots", "Sandals", "Ballet Flats", "Dress Shoes"),
    accessories: choices("Glasses", "Hat", "Hair Bows", "Headband", "Backpack", "Watch", "None"),
    jewelry: choices("None", "Friendship Bracelet", "Beaded Necklace", "Small Earrings"),
    props: choices("Book", "Toy", "Sports Ball", "Art Supplies", "Musical Instrument", "Game Controller", "Science Kit"),
    pose: choices("Standing", "Walking", "Running", "Sitting", "Dancing", "Playing", "Action Pose", "Portrait")
  }),
  teen: Object.freeze({
    clothingStyle: choices("Casual", "Streetwear", "Preppy", "Sportswear", "Y2K", "Alternative", "Formal", "Creative"),
    top: choices("Graphic Tee", "Button-Down", "Sweater", "Hoodie", "Crop Top", "Tank Top", "Jersey"),
    bottom: choices("Jeans", "Joggers", "Leggings", "Shorts", "Skirt", "Cargo Pants", "School Uniform Bottom"),
    outfit: choices("School Look", "Party Dress", "Suit", "Jumpsuit", "Tracksuit", "Dance Outfit", "Festival Look"),
    outerwear: choices("None", "Blazer", "Denim Jacket", "Varsity Jacket", "Puffer Jacket", "Cardigan"),
    shoes: choices("Sneakers", "High Tops", "Loafers", "Boots", "Sandals", "Ballet Flats", "Dress Shoes"),
    accessories: choices("Glasses", "Sunglasses", "Hat", "Headband", "Backpack", "Watch", "Headphones", "None"),
    props: choices("Phone", "Book", "Camera", "Sports Ball", "Art Supplies", "Musical Instrument", "Laptop", "Game Controller")
  })
});

const FIELD_OPTIONS = Object.freeze({
  role: choices("Hero", "Professional", "Creator", "Explorer", "Caregiver"),
  personality: choices("Warm", "Curious", "Confident", "Playful", "Calm", "Bold"),
  setting: choices("Studio", "Home", "Nature", "City", "Fantasy world"),
  moment: choices("Portrait", "Quiet moment", "Celebration", "Action", "Candid story"),
  species: choices("Dog", "Cat", "Bird", "Horse", "Wildlife", "Mythical animal"),
  pose: choices("Portrait", "Standing", "Running", "Resting", "Action"),
  tone: choices("Elegant", "Playful", "Modern", "Romantic", "Bold", "Minimal"),
  audience: choices("Families", "Young adults", "Professionals", "Collectors", "General audience"),
  brandValues: choices("Bold", "Refined", "Trustworthy", "Playful", "Sustainable", "Innovative"),
  visualDirection: choices("Minimal geometry", "Organic forms", "Expressive typography", "Heritage detail", "Future-forward"),
  campaignTone: choices("Energetic", "Premium", "Friendly", "Urgent", "Inspiring"),
  platform: choices("Mobile", "Responsive web", "Instagram", "TikTok", "Print", "Presentation"),
  materials: choices("Paper", "Glass", "Metal", "Fabric", "Wood", "Recycled materials"),
  presentation: choices("Clean studio", "Lifestyle", "Retail", "Editorial", "Ecommerce"),
  format: choices("Portrait", "Square", "Landscape", "Transparent", "Print-ready"),
  genre: choices("Fantasy", "Romance", "Thriller", "Memoir", "Children's", "Science Fiction"),
  coverTone: choices("Atmospheric", "Bold", "Intimate", "Mysterious", "Playful"),
  interiorStyle: choices("Warm Modern", "Art Deco", "Organic", "Minimal", "Industrial", "Classic"),
  lighting: choices("Soft Daylight", "Golden Hour", "Cinematic", "Studio", "Neon", "Night"),
  palette: PALETTES,
  atmosphere: choices("Serene", "Dramatic", "Mysterious", "Joyful", "Luxurious"),
  viewpoint: choices("Eye level", "Close-up", "Wide angle", "Overhead", "Three-quarter"),
  style: choices("Modern", "Cinematic", "Minimal", "Editorial", "Playful", "Luxury"),
  mood: choices("Warm", "Confident", "Dreamy", "Energetic", "Calm", "Dramatic"),
  composition: choices("Centered", "Rule of thirds", "Symmetrical", "Dynamic", "Spacious"),
  camera: choices("Eye level", "Low angle", "Wide establishing", "Close portrait", "Overhead"),
  quality: choices("Polished", "Production-ready", "Photoreal", "Highly detailed"),
  constraints: choices("Transparent background", "Simple silhouette", "Small-size clarity", "Print safe"),
  season: choices("Spring", "Summer", "Autumn", "Winter"),
  time: choices("Sunrise", "Day", "Golden Hour", "Blue Hour", "Night")
});

const FEATURED_CATEGORY_IDS = Object.freeze([
  "person", "woman", "man", "teen", "child", "toddler", "baby", "animal", "fantasy-character", "illustration", "product", "logo",
  "brand-identity", "social-media-graphic", "website-concept", "app-screen",
  "wedding-invitation", "book-cover", "packaging", "sticker", "poster",
  "children-book", "game-asset", "anything"
]);

const CATEGORY_PRESENTATION = Object.freeze({
  person: ["👤", "Character Builder", "Build any original person from head to toe"],
  woman: ["👩", "Woman", "Fashion, portraits, and original women"],
  man: ["👨", "Man", "Fashion, portraits, and original men"],
  teen: ["🧑", "Teen", "Age-appropriate fashion and expressive characters"],
  child: ["🧒", "Child", "Playful, age-appropriate original characters"],
  toddler: ["👶", "Toddler", "Toddler outfits, poses, props, and expressions"],
  baby: ["🍼", "Baby", "Baby clothing, accessories, poses, and keepsakes"],
  animal: ["🐶", "Animal", "Pets, wildlife, and expressive creatures"],
  "fantasy-character": ["🧙", "Fantasy", "Heroes, mages, and imagined beings"],
  illustration: ["🎨", "Artwork", "Illustration and expressive visual art"],
  product: ["📦", "Product", "Product concepts and presentations"],
  logo: ["🏷", "Logo", "Marks, symbols, and wordmarks"],
  "brand-identity": ["💼", "Branding", "Complete visual identity directions"],
  "social-media-graphic": ["📱", "Social Media", "Posts, stories, and campaigns"],
  "website-concept": ["🖥", "Website", "Responsive website concepts"],
  "app-screen": ["📲", "Mobile App", "Mobile product and interface concepts"],
  "wedding-invitation": ["🎉", "Invitation", "Wedding and event invitations"],
  "book-cover": ["📖", "Book Cover", "Book, magazine, and story covers"],
  packaging: ["🎁", "Packaging", "Packaging systems and label concepts"],
  sticker: ["😊", "Sticker Pack", "Sticker families and expressive icons"],
  poster: ["🎬", "Movie Poster", "Cinematic posters and campaign art"],
  "children-book": ["🧸", "Children's Book", "Stories and picture-book directions"],
  "game-asset": ["🎮", "Game Asset", "Characters, props, and game-ready ideas"],
  anything: ["✨", "More", "Explore every creative possibility"]
});

export const INSPIRATION_IDEAS = Object.freeze([
  Object.freeze({ id: "golden-guardian", categoryId: "fantasy-character", title: "Golden Guardian", description: "A future guardian balancing heritage, power, and luminous armor.", style: "Cinematic realism", palette: "Black, burnished gold, warm amber", collection: "Featured", accent: "#d6ad58" }),
  Object.freeze({ id: "quiet-bloom", categoryId: "illustration", title: "Quiet Bloom", description: "A poetic botanical portrait with layered paper texture and gentle motion.", style: "Editorial collage", palette: "Sage, blush, cream, charcoal", collection: "Calm", accent: "#96aa8c" }),
  Object.freeze({ id: "orbit-coffee", categoryId: "logo", title: "Orbit Coffee", description: "A neighborhood coffee identity built around ritual, warmth, and motion.", style: "Modern geometric", palette: "Espresso, copper, oat", collection: "Popular", accent: "#b8754b" }),
  Object.freeze({ id: "tiny-adventures", categoryId: "sticker", title: "Tiny Adventures", description: "A playful sticker family celebrating small wins and curious discoveries.", style: "Soft dimensional illustration", palette: "Sky, coral, lilac, lemon", collection: "Playful", accent: "#ed7f86" }),
  Object.freeze({ id: "midnight-vows", categoryId: "wedding-invitation", title: "Midnight Vows", description: "An intimate celestial invitation with refined type and metallic details.", style: "Luxury editorial", palette: "Midnight, silver, pearl", collection: "Seasonal", accent: "#9ca7c6" }),
  Object.freeze({ id: "kinetic-finance", categoryId: "app-screen", title: "Kinetic Finance", description: "A welcoming finance app that makes first-time investing feel understandable.", style: "Calm modern interface", palette: "Ink, mint, electric blue", collection: "Featured", accent: "#55cbb4" }),
  Object.freeze({ id: "wild-atlas", categoryId: "book-cover", title: "Wild Atlas", description: "A tactile adventure cover where landscapes form a hidden animal silhouette.", style: "Painterly graphic", palette: "Forest, clay, parchment", collection: "Popular", accent: "#6f8f62" }),
  Object.freeze({ id: "neon-rain", categoryId: "poster", title: "Neon Rain", description: "A cinematic mystery poster shaped by reflections, negative space, and one bold title.", style: "Neo-noir", palette: "Indigo, magenta, cyan", collection: "Bold", accent: "#b94fbd" }),
  Object.freeze({ id: "kindred-home", categoryId: "website-concept", title: "Kindred Home", description: "An editorial home-goods website grounded in material, craft, and calm browsing.", style: "Warm minimalism", palette: "Linen, walnut, moss", collection: "Calm", accent: "#9e876a" }),
  Object.freeze({ id: "solar-scout", categoryId: "packaging", title: "Solar Scout", description: "Collectible toy packaging with modular graphics and a bright space-age personality.", style: "Retro future", palette: "Navy, orange, cream, teal", collection: "Playful", accent: "#ee8b45" }),
  Object.freeze({ id: "city-pulse", categoryId: "social-media-graphic", title: "City Pulse", description: "A flexible social campaign combining bold type, candid movement, and vibrant color.", style: "Contemporary editorial", palette: "Cobalt, red, white, black", collection: "Bold", accent: "#3856d8" }),
  Object.freeze({ id: "moonlit-fox", categoryId: "animal", title: "Moonlit Fox", description: "A curious fox crossing a silver forest clearing under a vast night sky.", style: "Storybook realism", palette: "Moon silver, pine, ember", collection: "Seasonal", accent: "#a2aec8" })
]);

function titleCase(value) {
  return String(value).replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeOptions(options = []) {
  return options.map((item) => typeof item === "string" ? option(item) : item);
}

function optionsForField(field) {
  if (FIELD_OPTIONS[field.name]) return FIELD_OPTIONS[field.name];
  const key = Object.keys(FIELD_OPTIONS).find((name) => field.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()));
  return key ? FIELD_OPTIONS[key] : Object.freeze([]);
}

function genericSteps(category) {
  return category.fields.map((field) => Object.freeze({
    id: field.name,
    label: field.label,
    prompt: field.placeholder || `Choose the ${field.label.toLocaleLowerCase()} that fits your idea.`,
    options: normalizeOptions(optionsForField(field)),
    input: optionsForField(field).length ? "" : field.type === "textarea" ? "textarea" : "text",
    visual: field.name === "palette" ? "palette" : "",
    allowCustom: Boolean(optionsForField(field).length),
    required: Boolean(field.required)
  }));
}

export function categoryPresentation(categoryOrId) {
  const category = typeof categoryOrId === "string" ? getCreationCategory(categoryOrId) : categoryOrId;
  const presentation = CATEGORY_PRESENTATION[category.id] || [category.icon || "✦", category.label, category.ideas?.[0] || `Create a polished ${category.label.toLocaleLowerCase()}`];
  return Object.freeze({ id: category.id, icon: presentation[0], label: presentation[1], description: presentation[2], category });
}

export function featuredGuidedCategories() {
  return FEATURED_CATEGORY_IDS.map((id) => categoryPresentation(id));
}

export function allGuidedCategories() {
  const featured = new Set(FEATURED_CATEGORY_IDS);
  return [
    ...featuredGuidedCategories(),
    ...CREATION_CATEGORIES.filter((category) => !featured.has(category.id)).map(categoryPresentation)
  ];
}

export function guidedSteps(categoryOrId) {
  const category = typeof categoryOrId === "string" ? getCreationCategory(categoryOrId) : categoryOrId;
  const personLike = new Set(["person", "woman", "man", "teen", "family", "baby", "toddler", "child", "fantasy-character", "sci-fi-character"]);
  if (!personLike.has(category.id)) return Object.freeze(genericSteps(category));
  const overrides = AGE_WARDROBE_OVERRIDES[category.id];
  if (!overrides) return PERSON_STEPS;
  return Object.freeze(PERSON_STEPS.map((step) => Object.freeze(overrides[step.id] ? { ...step, options: overrides[step.id] } : step)));
}

export function suggestedAnswer(step, category) {
  if (step.options?.length) return step.options[0].value;
  return category.ideas?.[0] || `A polished ${category.label.toLocaleLowerCase()} direction`;
}

const PANEL_MAP = Object.freeze({
  artisticStyle: "artistic-style",
  colorPalette: "palette",
  brandName: "brand-identity",
  brandValues: "brand-identity",
  visualDirection: "artistic-style",
  bodyType: "body",
  height: "body",
  skinTone: "body",
  faceShape: "face",
  eyebrows: "face",
  eyeShape: "eyes",
  eyeColor: "eyes",
  facialDetails: "face",
  hairStyle: "hair",
  hairLength: "hair",
  hairTexture: "hair",
  hairColor: "hair",
  facialHair: "face",
  makeup: "face",
  clothingStyle: "clothing",
  top: "clothing",
  bottom: "clothing",
  outfit: "clothing",
  outerwear: "clothing",
  shoes: "clothing",
  jewelry: "accessories",
  props: "accessories",
  background: "background",
  lighting: "lighting",
  hair: "hair",
  eyes: "eyes",
  face: "face",
  clothing: "clothing",
  accessories: "accessories",
  pose: "pose",
  expression: "expression",
  materials: "materials",
  camera: "camera",
  viewpoint: "camera",
  composition: "composition",
  palette: "palette",
  atmosphere: "mood",
  tone: "mood",
  style: "artistic-style",
  format: "aspect-ratio",
  headline: "headline",
  callToAction: "call-to-action",
  environment: "environment",
  setting: "environment"
});

function displayAnswer(value) {
  return Array.isArray(value) ? value.join(", ") : String(value || "").trim();
}

function panelKindFor(key) {
  if (PANEL_MAP[key]) return PANEL_MAP[key];
  if (CREATIVE_PANELS.some((panel) => panel.id === key)) return key;
  const normalized = key.toLocaleLowerCase();
  if (normalized.includes("style")) return "artistic-style";
  if (normalized.includes("color") || normalized.includes("palette")) return "palette";
  if (normalized.includes("material")) return "materials";
  if (normalized.includes("audience") || normalized.includes("purpose")) return "purpose";
  if (normalized.includes("title") || normalized.includes("name")) return "subject";
  return "purpose";
}

export function guidedSpecification(categoryId, answers = {}, seedGoal = "") {
  const category = getCreationCategory(categoryId);
  const steps = guidedSteps(category);
  const labels = new Map(steps.map((step) => [step.id, step.label]));
  const summary = Object.entries(answers)
    .map(([key, value]) => [key, labels.get(key) || titleCase(key), displayAnswer(value)])
    .filter(([, , value]) => value);
  const direction = summary.map(([, label, value]) => `${label}: ${value}`).join("; ");
  const goal = [String(seedGoal || "").trim(), direction ? `Create ${category.label}. ${direction}` : `Create ${category.label}.`].filter(Boolean).join(" ");
  const specification = analyzeCreativeIntent(goal);
  specification.categoryId = category.id;
  specification.categoryLabel = category.label;
  specification.projectType = category.projectType;
  const grouped = new Map();
  summary.forEach(([key, label, value]) => {
    const kind = panelKindFor(key);
    const entries = grouped.get(kind) || [];
    entries.push(`${label}: ${value}`);
    grouped.set(kind, entries);
  });
  grouped.forEach((values, kind) => {
    let panel = specification.sections.find((item) => item.kind === kind);
    if (!panel) {
      panel = createPanel(kind, "", "guided");
      specification.sections.push(panel);
    }
    panel.value = values.join(" · ");
    panel.source = "guided";
  });
  specification.guided = { categoryId: category.id, answers: structuredClone(answers) };
  specification.prompt = buildPromptFromSpecification(specification);
  return specification;
}

export function inspirationSpecification(idea) {
  const category = getCreationCategory(idea.categoryId);
  return guidedSpecification(category.id, {
    subject: idea.description,
    artisticStyle: idea.style,
    colorPalette: idea.palette,
    mood: idea.collection
  });
}
