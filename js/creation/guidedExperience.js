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

const GARMENT_COLORS = Object.freeze([
  option("Black", "Black", "#18171d"),
  option("White", "White", "#fffdf8"),
  option("Ivory", "Ivory", "#f6efe0"),
  option("Stone", "Stone Gray", "#8e8a89"),
  option("Chocolate", "Chocolate Brown", "#624033"),
  option("Camel", "Camel", "#bd8c5b"),
  option("Blush", "Blush Pink", "#dfa6b5"),
  option("Rose", "Rose Pink", "#c96383"),
  option("Berry", "Berry", "#913b62"),
  option("Burgundy", "Burgundy", "#682b3c"),
  option("Ruby", "Ruby Red", "#a9283f"),
  option("Orange", "Burnt Orange", "#c46737"),
  option("Golden", "Golden Yellow", "#d5a93e"),
  option("Emerald", "Emerald Green", "#287057"),
  option("Teal", "Teal", "#287b79"),
  option("Sky", "Sky Blue", "#78b9d2"),
  option("Navy", "Navy Blue", "#243a62"),
  option("Lavender", "Lavender", "#a795ca"),
  option("Neon", "Neon Bright", "#b8e63d"),
  option("Rainbow", "Multicolor Rainbow", "linear-gradient(135deg,#ef476f,#ffd166,#06d6a0,#118ab2,#8b5cf6)"),
  option("Silver", "Silver", "#a8abb3"),
  option("Gold", "Metallic Gold", "#bb8a35")
]);

const BABY_COLORS = Object.freeze([
  option("Cloud White", "Cloud White", "#fffdf8"),
  option("Warm Cream", "Warm Cream", "#f5ead8"),
  option("Baby Pink", "Baby Pink", "#edbdca"),
  option("Powder Blue", "Powder Blue", "#b9d7e7"),
  option("Soft Lavender", "Soft Lavender", "#cfc0df"),
  option("Mint", "Soft Mint", "#bfe0d4"),
  option("Butter Yellow", "Butter Yellow", "#f2dda0"),
  option("Peach", "Soft Peach", "#efc0a6"),
  option("Sage", "Soft Sage", "#b9c7aa"),
  option("Chocolate", "Chocolate Brown", "#624033"),
  option("Navy", "Navy Blue", "#30466c"),
  option("Rainbow", "Pastel Rainbow", "linear-gradient(135deg,#edbdca,#f2dda0,#bfe0d4,#b9d7e7,#cfc0df)")
]);

const garmentColorSteps = Object.freeze({
  topColor: GARMENT_COLORS,
  bottomColor: GARMENT_COLORS,
  outfitColor: GARMENT_COLORS,
  outerwearColor: GARMENT_COLORS,
  shoeColor: GARMENT_COLORS,
  accessoryColor: GARMENT_COLORS,
  jewelryColor: GARMENT_COLORS,
  propColor: GARMENT_COLORS
});

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
  Object.freeze({ id: "clothingColor", group: "Wardrobe", label: "Clothing Color", prompt: "Choose the main color for the look.", options: GARMENT_COLORS, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "fabric", group: "Wardrobe", label: "Fabric & Material", prompt: "Choose the texture and material of the clothing.", options: choices("Cotton", "Linen", "Denim", "Leather", "Silk", "Satin", "Velvet", "Knit", "Chiffon", "Lace", "Wool", "Metallic", "Sequins", "Technical Fabric"), allowCustom: true }),
  Object.freeze({ id: "pattern", group: "Wardrobe", label: "Pattern", prompt: "Choose a pattern or surface treatment.", options: choices("Solid", "Stripes", "Plaid", "Polka Dots", "Floral", "Animal Print", "Geometric", "Abstract", "Camouflage", "Embroidered", "Graphic Print"), allowCustom: true }),
  Object.freeze({ id: "fit", group: "Wardrobe", label: "Fit & Silhouette", prompt: "Choose how the clothing fits and moves.", options: choices("Tailored", "Relaxed", "Oversized", "Fitted", "Flowing", "Structured", "Layered", "Cropped", "Draped"), allowCustom: true }),
  Object.freeze({ id: "occasion", group: "Wardrobe", label: "Occasion", prompt: "Choose where this look belongs.", options: choices("Everyday", "Work", "School", "Celebration", "Wedding", "Red Carpet", "Vacation", "Festival", "Sports", "Performance", "Fantasy Adventure"), allowCustom: true }),
  Object.freeze({ id: "season", group: "Wardrobe", label: "Season", prompt: "Choose the season for the look.", options: choices("Spring", "Summer", "Autumn", "Winter", "All Season"), allowCustom: true }),
  Object.freeze({ id: "era", group: "Wardrobe", label: "Era", prompt: "Choose a time-period influence.", options: choices("Contemporary", "1920s", "1950s", "1970s", "1980s", "1990s", "Y2K", "Historical", "Retro Future", "Far Future"), allowCustom: true }),
  Object.freeze({ id: "culturalInfluence", group: "Wardrobe", label: "Cultural Influence", prompt: "Add a respectful cultural or regional fashion influence.", options: choices("None", "African Contemporary", "Caribbean", "East Asian Contemporary", "South Asian", "Middle Eastern", "Indigenous-Inspired Textiles", "European Heritage", "Latin American", "Global Fusion"), allowCustom: true }),
  Object.freeze({ id: "top", group: "Wardrobe", label: "Tops", prompt: "Choose a top or upper-body garment.", options: choices("T-Shirt", "Graphic Tee", "Polo", "Blouse", "Button-Down", "Oxford Shirt", "Henley", "Sweater", "Cardigan Top", "Hoodie", "Sweatshirt", "Crop Top", "Tank Top", "Camisole", "Corset", "Bodysuit", "Turtleneck", "Tunic", "Vest", "Jersey", "Halter Top", "Off-Shoulder Top", "Wrap Top"), allowCustom: true }),
  Object.freeze({ id: "topColor", group: "Wardrobe", label: "Top Color", prompt: "Choose the main color for the selected top.", options: garmentColorSteps.topColor, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "bottom", group: "Wardrobe", label: "Bottoms", prompt: "Choose bottoms.", options: choices("Jeans", "Tailored Trousers", "Chinos", "Joggers", "Leggings", "Track Pants", "Shorts", "Bermuda Shorts", "Mini Skirt", "Midi Skirt", "Maxi Skirt", "Pleated Skirt", "Cargo Pants", "Palazzo Pants", "Culottes", "Leather Pants", "Corduroy Pants", "Wide-Leg Trousers"), allowCustom: true }),
  Object.freeze({ id: "bottomColor", group: "Wardrobe", label: "Bottom Color", prompt: "Choose the main color for the selected bottoms.", options: garmentColorSteps.bottomColor, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "outfit", group: "Wardrobe", label: "Dresses & Full Outfits", prompt: "Choose a complete outfit if preferred.", options: choices("Evening Gown", "Cocktail Dress", "Sundress", "Maxi Dress", "Shirt Dress", "Slip Dress", "Suit", "Three-Piece Suit", "Tuxedo", "Skirt Suit", "Pantsuit", "Jumpsuit", "Romper", "Tracksuit", "Matching Set", "Fantasy Armor", "Royal Robes", "Formal Uniform", "Performance Costume"), allowCustom: true }),
  Object.freeze({ id: "outfitColor", group: "Wardrobe", label: "Outfit Color", prompt: "Choose the main color for the dress or complete outfit.", options: garmentColorSteps.outfitColor, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "outerwear", group: "Wardrobe", label: "Outerwear", prompt: "Choose an outer layer.", options: choices("None", "Blazer", "Leather Jacket", "Denim Jacket", "Bomber Jacket", "Varsity Jacket", "Moto Jacket", "Trench Coat", "Overcoat", "Peacoat", "Puffer Jacket", "Parka", "Cape", "Faux Fur Coat", "Cardigan", "Shawl", "Raincoat", "Fantasy Cloak"), allowCustom: true }),
  Object.freeze({ id: "outerwearColor", group: "Wardrobe", label: "Outerwear Color", prompt: "Choose the color for the jacket, coat, or outer layer.", options: garmentColorSteps.outerwearColor, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "shoes", group: "Wardrobe", label: "Shoes", prompt: "Choose the footwear.", options: choices("Barefoot", "Low-Top Sneakers", "High-Top Sneakers", "Running Shoes", "Loafers", "Oxfords", "Brogues", "Dress Shoes", "Pumps", "Stiletto Heels", "Block Heels", "Platforms", "Wedges", "Ankle Boots", "Knee-High Boots", "Combat Boots", "Chelsea Boots", "Cowboy Boots", "Sandals", "Slides", "Ballet Flats", "Moccasins", "Cleats", "Fantasy Boots"), allowCustom: true }),
  Object.freeze({ id: "shoeColor", group: "Wardrobe", label: "Shoe Color", prompt: "Choose the main color for the footwear.", options: garmentColorSteps.shoeColor, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "accessories", group: "Accessories", label: "Accessories", prompt: "Choose any finishing accessories.", options: choices("Glasses", "Sunglasses", "Wide-Brim Hat", "Baseball Cap", "Beanie", "Headband", "Hair Clip", "Scarf", "Necktie", "Bow Tie", "Handbag", "Clutch", "Crossbody Bag", "Backpack", "Watch", "Belt", "Gloves", "Umbrella", "Headphones", "None"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "accessoryColor", group: "Accessories", label: "Accessory Color", prompt: "Choose a main color for the selected accessories.", options: garmentColorSteps.accessoryColor, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "jewelry", group: "Accessories", label: "Jewelry", prompt: "Choose jewelry details.", options: choices("Stud Earrings", "Hoop Earrings", "Drop Earrings", "Choker", "Pendant Necklace", "Statement Necklace", "Chain", "Bracelets", "Bangles", "Rings", "Brooch", "Cufflinks", "Body Jewelry", "Pearls", "Beaded Jewelry", "None"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "jewelryColor", group: "Accessories", label: "Jewelry Color", prompt: "Choose the metal, gemstone, or primary jewelry color.", options: garmentColorSteps.jewelryColor, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "props", group: "Accessories", label: "Props", prompt: "Give the character something to interact with.", options: choices("Phone", "Book", "Flowers", "Coffee Cup", "Camera", "Sports Ball", "Art Supplies", "Microphone", "Musical Instrument", "Sword", "Shield", "Magic Staff", "Laptop", "Briefcase", "Shopping Bag", "None"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "propColor", group: "Accessories", label: "Prop Color", prompt: "Choose a primary color for the selected prop.", options: garmentColorSteps.propColor, visual: "swatch", allowCustom: true }),
  Object.freeze({ id: "pose", group: "Direction", label: "Pose", prompt: "Choose a pose.", options: choices("Standing", "Walking", "Sitting", "Leaning", "Fashion Pose", "Running", "Dancing", "Portrait", "Action Pose", "Crawling", "Playing", "Sleeping"), allowCustom: true }),
  Object.freeze({ id: "expression", group: "Direction", label: "Expression", prompt: "Choose an expression.", options: choices("Happy", "Confident", "Serious", "Laughing", "Cute", "Sad", "Angry", "Relaxed", "Surprised", "Shy", "Playful", "Curious", "Sleepy"), allowCustom: true }),
  Object.freeze({ id: "artisticStyle", group: "Scene", label: "Artistic Style", prompt: "Choose the visual language.", options: choices("Photorealistic", "Semi-Realistic", "Expressive 3D", "Anime", "Pixar-inspired", "Comic", "Watercolor", "Oil Painting", "Pencil Sketch", "Fantasy", "Cyberpunk", "Concept Art", "Voxel", "Pixel Art", "Sticker", "Clay", "3D Render"), visual: "style", allowCustom: true }),
  Object.freeze({ id: "background", group: "Scene", label: "Background", prompt: "Choose the setting.", options: choices("Studio", "Bedroom", "Luxury Home", "Playroom", "School", "Beach", "Forest", "Cafe", "Street", "City", "Mountains", "White Background", "Transparent", "Fantasy World"), allowCustom: true }),
  Object.freeze({ id: "lighting", group: "Scene", label: "Lighting", prompt: "Choose the lighting atmosphere.", options: choices("Studio", "Soft Daylight", "Golden Hour", "Cinematic", "Neon", "Night", "Indoor", "Outdoor", "Dreamy Glow", "Flash Photography"), allowCustom: true }),
  Object.freeze({ id: "colorPalette", group: "Scene", label: "Color Palette", prompt: "Choose a palette to guide the final look.", options: PALETTES, visual: "palette", allowCustom: true })
]);

const AGE_WARDROBE_OVERRIDES = Object.freeze({
  woman: Object.freeze({
    ...garmentColorSteps,
    clothingStyle: choices("Luxury", "Casual", "Streetwear", "Business", "Preppy", "Bohemian", "Minimal", "Romantic", "Alternative", "Sportswear", "Traditional", "Futuristic", "Formal"),
    top: choices("T-Shirt", "Graphic Tee", "Blouse", "Button-Down", "Sweater", "Hoodie", "Crop Top", "Tank Top", "Camisole", "Corset", "Bodysuit", "Turtleneck", "Tunic", "Halter Top", "Off-Shoulder Top", "Wrap Top", "Peplum Top", "Vest", "Jersey"),
    bottom: choices("Skinny Jeans", "Straight Jeans", "Wide-Leg Jeans", "Tailored Trousers", "Joggers", "Leggings", "Shorts", "Mini Skirt", "Midi Skirt", "Maxi Skirt", "Pleated Skirt", "Cargo Pants", "Palazzo Pants", "Culottes", "Leather Pants"),
    outfit: choices("Evening Gown", "Ball Gown", "Cocktail Dress", "Sundress", "Maxi Dress", "Shirt Dress", "Slip Dress", "Pantsuit", "Skirt Suit", "Jumpsuit", "Romper", "Tracksuit", "Matching Set", "Tuxedo", "Fantasy Armor", "Royal Robes", "Performance Costume"),
    outerwear: choices("None", "Blazer", "Leather Jacket", "Denim Jacket", "Cropped Jacket", "Bomber Jacket", "Trench Coat", "Overcoat", "Puffer Jacket", "Cape", "Faux Fur Coat", "Cardigan", "Shawl", "Raincoat", "Fantasy Cloak"),
    shoes: choices("Barefoot", "Low-Top Sneakers", "High-Top Sneakers", "Running Shoes", "Loafers", "Oxfords", "Pumps", "Stiletto Heels", "Block Heels", "Kitten Heels", "Platforms", "Wedges", "Ankle Boots", "Knee-High Boots", "Combat Boots", "Sandals", "Slides", "Ballet Flats", "Mules", "Fantasy Boots"),
    accessories: choices("Glasses", "Sunglasses", "Wide-Brim Hat", "Baseball Cap", "Beanie", "Headband", "Hair Clip", "Scarf", "Handbag", "Clutch", "Crossbody Bag", "Backpack", "Watch", "Belt", "Gloves", "Umbrella", "Headphones", "None"),
    jewelry: choices("Stud Earrings", "Hoop Earrings", "Drop Earrings", "Choker", "Pendant Necklace", "Statement Necklace", "Chain", "Bracelets", "Bangles", "Rings", "Brooch", "Pearls", "Beaded Jewelry", "None")
  }),
  man: Object.freeze({
    ...garmentColorSteps,
    clothingStyle: choices("Luxury", "Casual", "Streetwear", "Business", "Preppy", "Minimal", "Rugged", "Sportswear", "Alternative", "Traditional", "Futuristic", "Formal"),
    top: choices("T-Shirt", "Graphic Tee", "Polo", "Button-Down", "Oxford Shirt", "Henley", "Sweater", "Hoodie", "Sweatshirt", "Tank Top", "Turtleneck", "Tunic", "Sweater Vest", "Utility Vest", "Jersey", "Rugby Shirt"),
    bottom: choices("Slim Jeans", "Straight Jeans", "Relaxed Jeans", "Tailored Trousers", "Chinos", "Joggers", "Track Pants", "Shorts", "Bermuda Shorts", "Cargo Pants", "Corduroy Pants", "Leather Pants", "Wide-Leg Trousers"),
    outfit: choices("Two-Piece Suit", "Three-Piece Suit", "Tuxedo", "Double-Breasted Suit", "Jumpsuit", "Tracksuit", "Matching Set", "Formal Uniform", "Traditional Formalwear", "Fantasy Armor", "Royal Robes", "Performance Costume"),
    outerwear: choices("None", "Blazer", "Leather Jacket", "Denim Jacket", "Bomber Jacket", "Varsity Jacket", "Moto Jacket", "Trench Coat", "Overcoat", "Peacoat", "Puffer Jacket", "Parka", "Cardigan", "Raincoat", "Fantasy Cloak"),
    shoes: choices("Barefoot", "Low-Top Sneakers", "High-Top Sneakers", "Running Shoes", "Loafers", "Oxfords", "Brogues", "Monk Straps", "Dress Shoes", "Chelsea Boots", "Combat Boots", "Work Boots", "Cowboy Boots", "Sandals", "Slides", "Moccasins", "Cleats", "Fantasy Boots"),
    accessories: choices("Glasses", "Sunglasses", "Fedora", "Baseball Cap", "Beanie", "Scarf", "Necktie", "Bow Tie", "Pocket Square", "Crossbody Bag", "Backpack", "Watch", "Belt", "Gloves", "Briefcase", "Headphones", "None"),
    jewelry: choices("Stud Earrings", "Hoop Earrings", "Chain", "Pendant Necklace", "Bracelet", "Watch Stack", "Rings", "Signet Ring", "Cufflinks", "Tie Bar", "Brooch", "Beaded Jewelry", "None")
  }),
  baby: Object.freeze({
    clothingStyle: choices("Cozy", "Classic", "Playful", "Luxury Keepsake", "Seasonal", "Traditional"),
    fabric: choices("Organic Cotton", "Soft Knit", "Fleece", "Linen Blend", "Velvet", "Muslin"),
    pattern: choices("Solid", "Tiny Floral", "Stars", "Animals", "Stripes", "Polka Dots", "Storybook Print"),
    fit: choices("Soft Relaxed", "Snug", "Layered", "Roomy"),
    occasion: choices("Everyday", "Bedtime", "Family Portrait", "Celebration", "Christening", "Holiday"),
    season: choices("Spring", "Summer", "Autumn", "Winter", "All Season"),
    era: choices("Contemporary", "Classic Keepsake", "Vintage-Inspired"),
    culturalInfluence: choices("None", "Family Heritage", "Traditional Celebration", "Global Contemporary"),
    makeup: choices("None"),
    topColor: BABY_COLORS,
    bottomColor: BABY_COLORS,
    outfitColor: BABY_COLORS,
    outerwearColor: BABY_COLORS,
    shoeColor: BABY_COLORS,
    accessoryColor: BABY_COLORS,
    jewelryColor: BABY_COLORS,
    propColor: BABY_COLORS,
    top: choices("Short-Sleeve Onesie", "Long-Sleeve Onesie", "Bodysuit", "Kimono Top", "Soft T-Shirt", "Knit Sweater", "Sleep Top", "Ruffle Top", "Polo Bodysuit"),
    bottom: choices("Soft Leggings", "Bloomers", "Diaper Cover", "Pull-On Pants", "Footed Pants", "Knit Pants", "Soft Shorts", "Suspender Pants"),
    outfit: choices("Baby Set", "Romper", "Sleep and Play", "Footed Pajamas", "Christening Outfit", "Naming Ceremony Outfit", "Snowsuit", "Special Occasion Set", "Mini Formal Set", "Tutu Set"),
    outerwear: choices("None", "Cardigan", "Soft Jacket", "Fleece Jacket", "Puffer Suit", "Rain Suit", "Knit Cape", "Sherpa Coat"),
    shoes: choices("Barefoot", "Socks", "Knit Booties", "Leather Baby Booties", "Crib Shoes", "Soft-Sole Sneakers", "Soft Sandals", "Keepsake Dress Shoes"),
    accessories: choices("Hair Bow", "Headband", "Knit Hat", "Sun Hat", "Bonnet", "Bib", "Pacifier", "Swaddle", "Mittens", "None"),
    jewelry: choices("None", "Keepsake Bracelet", "ID Bracelet", "Tiny Stud Earrings", "Heritage Keepsake"),
    props: choices("Stuffed Animal", "Rattle", "Bottle", "Board Book", "Soft Toy", "Blanket", "Teething Toy", "Stacking Rings", "Baby Blocks", "Keepsake Toy"),
    pose: choices("Lying Down", "Tummy Time", "Supported Sitting", "Crawling", "Sleeping", "Reaching", "Cuddling")
  }),
  toddler: Object.freeze({
    ...garmentColorSteps,
    clothingStyle: choices("Playful", "Everyday", "Preppy", "Mini Streetwear", "Dressy", "Seasonal", "Traditional"),
    fabric: choices("Cotton", "Denim", "Soft Knit", "Fleece", "Linen", "Corduroy"),
    pattern: choices("Solid", "Stripes", "Plaid", "Polka Dots", "Floral", "Animals", "Graphic Print"),
    fit: choices("Relaxed", "Roomy", "Layered", "Fitted", "Play-Ready"),
    occasion: choices("Everyday", "Playtime", "Family Portrait", "School", "Celebration", "Holiday"),
    era: choices("Contemporary", "Retro", "Classic"),
    culturalInfluence: choices("None", "Family Heritage", "Traditional Celebration", "Global Contemporary"),
    makeup: choices("None", "Playful Face Paint"),
    top: choices("Graphic Tee", "Character Tee", "Polo", "Sweater", "Hoodie", "Sweatshirt", "Tunic", "Button-Down", "Tank Top", "Ruffle Top", "Jersey"),
    bottom: choices("Pull-On Jeans", "Joggers", "Leggings", "Shorts", "Skirt", "Cargo Pants", "Corduroy Pants", "Soft Trousers", "Overalls"),
    outfit: choices("Toddler Set", "Romper", "Overalls", "Party Dress", "Mini Suit", "Tracksuit", "Pajama Set", "Rain Set", "Dance Outfit", "Traditional Celebration Set"),
    outerwear: choices("None", "Cardigan", "Denim Jacket", "Bomber Jacket", "Puffer Jacket", "Raincoat", "Fleece", "Parka", "Mini Trench"),
    shoes: choices("Barefoot", "Everyday Sneakers", "High-Top Sneakers", "Light-Up Shoes", "Rain Boots", "Winter Boots", "Sandals", "Slip-Ons", "Ballet Flats", "Dress Shoes"),
    accessories: choices("Glasses", "Sunglasses", "Sun Hat", "Hair Bows", "Headband", "Mini Backpack", "Beanie", "Scarf", "Character Bag", "None"),
    jewelry: choices("None", "Beaded Bracelet", "Keepsake Necklace"),
    props: choices("Stuffed Animal", "Toy", "Picture Book", "Blocks", "Ball", "Crayon", "Bubble Wand", "Snack Cup"),
    pose: choices("Standing", "Walking", "Running", "Sitting", "Dancing", "Playing", "Jumping", "Napping")
  }),
  child: Object.freeze({
    ...garmentColorSteps,
    clothingStyle: choices("Everyday", "Playful", "Preppy", "Streetwear", "Sportswear", "Formal", "Fantasy", "Traditional"),
    fabric: choices("Cotton", "Denim", "Knit", "Fleece", "Linen", "Velvet", "Sports Fabric"),
    pattern: choices("Solid", "Stripes", "Plaid", "Polka Dots", "Floral", "Geometric", "Graphic Print"),
    fit: choices("Relaxed", "Fitted", "Oversized", "Layered", "Play-Ready"),
    occasion: choices("Everyday", "School", "Celebration", "Sports", "Performance", "Family Portrait", "Fantasy Adventure"),
    era: choices("Contemporary", "Retro", "Historical", "Future"),
    culturalInfluence: choices("None", "Family Heritage", "Traditional Celebration", "Global Contemporary"),
    makeup: choices("None", "Stage Makeup", "Playful Face Paint"),
    top: choices("T-Shirt", "Graphic Tee", "Polo", "Blouse", "Button-Down", "Sweater", "Hoodie", "Sweatshirt", "Tank Top", "Tunic", "Jersey", "School Shirt"),
    bottom: choices("Jeans", "Joggers", "Leggings", "Track Pants", "Shorts", "Skirt", "Cargo Pants", "Corduroy Pants", "School Uniform Bottom"),
    outfit: choices("School Uniform", "Party Dress", "Suit", "Matching Set", "Tracksuit", "Overalls", "Jumpsuit", "Fantasy Costume", "Dance Outfit", "Sports Uniform", "Traditional Celebration Outfit"),
    outerwear: choices("None", "Cardigan", "Denim Jacket", "Bomber Jacket", "Varsity Jacket", "Puffer Jacket", "Raincoat", "Parka", "Fleece Jacket"),
    shoes: choices("Everyday Sneakers", "High-Top Sneakers", "Running Shoes", "Light-Up Shoes", "Rain Boots", "Winter Boots", "Sandals", "Ballet Flats", "Loafers", "Dress Shoes", "Cleats"),
    accessories: choices("Glasses", "Sunglasses", "Hat", "Hair Bows", "Headband", "Backpack", "Watch", "Scarf", "Sports Cap", "Headphones", "None"),
    jewelry: choices("None", "Friendship Bracelet", "Beaded Necklace", "Small Earrings"),
    props: choices("Book", "Toy", "Sports Ball", "Art Supplies", "Musical Instrument", "Game Controller", "Science Kit"),
    pose: choices("Standing", "Walking", "Running", "Sitting", "Dancing", "Playing", "Action Pose", "Portrait")
  }),
  teen: Object.freeze({
    ...garmentColorSteps,
    clothingStyle: choices("Casual", "Streetwear", "Preppy", "Sportswear", "Y2K", "Alternative", "Formal", "Creative"),
    fabric: choices("Cotton", "Denim", "Leather", "Knit", "Satin", "Velvet", "Technical Fabric"),
    pattern: choices("Solid", "Stripes", "Plaid", "Floral", "Geometric", "Graphic Print", "Abstract"),
    fit: choices("Tailored", "Relaxed", "Oversized", "Fitted", "Layered", "Cropped"),
    occasion: choices("Everyday", "School", "Celebration", "Formal", "Sports", "Performance", "Festival"),
    culturalInfluence: choices("None", "Family Heritage", "Traditional Celebration", "Global Contemporary", "Regional Street Style"),
    makeup: choices("None", "Natural", "Soft Glam", "Editorial", "Stage Makeup", "Creative Face Paint"),
    top: choices("T-Shirt", "Graphic Tee", "Polo", "Button-Down", "Blouse", "Sweater", "Hoodie", "Sweatshirt", "Crop Top", "Tank Top", "Turtleneck", "Cardigan", "Jersey", "Vest"),
    bottom: choices("Skinny Jeans", "Straight Jeans", "Wide-Leg Jeans", "Joggers", "Leggings", "Track Pants", "Shorts", "Skirt", "Cargo Pants", "Corduroy Pants", "School Uniform Bottom"),
    outfit: choices("School Look", "Party Dress", "Suit", "Jumpsuit", "Matching Set", "Tracksuit", "Dance Outfit", "Festival Look", "Sports Uniform", "Formal Look", "Traditional Celebration Outfit"),
    outerwear: choices("None", "Blazer", "Denim Jacket", "Bomber Jacket", "Varsity Jacket", "Moto Jacket", "Puffer Jacket", "Cardigan", "Trench Coat", "Parka"),
    shoes: choices("Low-Top Sneakers", "High-Top Sneakers", "Running Shoes", "Loafers", "Oxfords", "Ankle Boots", "Combat Boots", "Sandals", "Slides", "Ballet Flats", "Block Heels", "Dress Shoes", "Cleats"),
    accessories: choices("Glasses", "Sunglasses", "Baseball Cap", "Beanie", "Headband", "Hair Clip", "Backpack", "Crossbody Bag", "Watch", "Belt", "Scarf", "Headphones", "None"),
    jewelry: choices("None", "Stud Earrings", "Small Hoops", "Pendant Necklace", "Chain", "Friendship Bracelet", "Beaded Bracelet", "Rings", "Brooch"),
    props: choices("Phone", "Book", "Camera", "Sports Ball", "Art Supplies", "Musical Instrument", "Laptop", "Game Controller")
  })
});

const BOOK_COVER_STEPS = Object.freeze([
  Object.freeze({ id: "title", group: "Book", label: "Book Title", prompt: "Enter the exact title that should appear on the cover.", options: Object.freeze([]), input: "text", required: true }),
  Object.freeze({ id: "author", group: "Book", label: "Author Name", prompt: "Enter the author or pen name.", options: Object.freeze([]), input: "text" }),
  Object.freeze({ id: "subtitle", group: "Book", label: "Subtitle", prompt: "Add an optional subtitle or series line.", options: Object.freeze([]), input: "text" }),
  Object.freeze({ id: "genre", group: "Book", label: "Genre", prompt: "Choose the genre readers should recognize immediately.", options: choices("Fantasy", "Romance", "Thriller", "Mystery", "Memoir", "Literary Fiction", "Science Fiction", "Horror", "Young Adult", "Nonfiction"), allowCustom: true }),
  Object.freeze({ id: "audience", group: "Book", label: "Audience", prompt: "Choose the intended reader.", options: choices("Children", "Young Adult", "New Adult", "Adult", "Professional", "General Audience"), allowCustom: true }),
  Object.freeze({ id: "storyHook", group: "Story", label: "Story Hook", prompt: "Describe the central promise, conflict, or transformation.", options: Object.freeze([]), input: "textarea" }),
  Object.freeze({ id: "imagery", group: "Story", label: "Key Imagery", prompt: "Choose a visual focus or describe your own.", options: choices("Main Character", "Symbolic Object", "Story Setting", "Silhouette", "Typography Only", "Character Ensemble", "Abstract Metaphor"), allowCustom: true }),
  Object.freeze({ id: "setting", group: "Story", label: "Setting", prompt: "Choose the world shown on the cover.", options: choices("Contemporary City", "Small Town", "Historical World", "Fantasy Realm", "Outer Space", "Nature", "Interior Scene", "Abstract Space"), allowCustom: true }),
  Object.freeze({ id: "coverStyle", group: "Design", label: "Cover Style", prompt: "Choose the visual language.", options: choices("Luxury Editorial", "Painterly", "Cinematic", "Illustrated", "Photographic", "Minimal", "Vintage", "Bold Graphic", "Typographic"), visual: "style", allowCustom: true }),
  Object.freeze({ id: "coverTone", group: "Design", label: "Mood", prompt: "Choose how the cover should feel.", options: choices("Atmospheric", "Bold", "Intimate", "Mysterious", "Romantic", "Playful", "Dark", "Hopeful"), allowCustom: true }),
  Object.freeze({ id: "typography", group: "Design", label: "Typography", prompt: "Choose a type direction for the title and author.", options: choices("Elegant Serif", "Modern Sans Serif", "Hand Lettered", "Art Deco", "Classic Literary", "Bold Display", "Vintage Type", "Minimal"), allowCustom: true }),
  Object.freeze({ id: "colorPalette", group: "Design", label: "Color Palette", prompt: "Choose the cover color direction.", options: PALETTES, visual: "palette", allowCustom: true }),
  Object.freeze({ id: "composition", group: "Design", label: "Composition", prompt: "Choose the cover layout.", options: choices("Centered Hero", "Top Title and Scenic Art", "Large Type with Small Symbol", "Full-Bleed Character", "Split Composition", "Minimal Negative Space"), allowCustom: true }),
  Object.freeze({ id: "coverFormat", group: "Production", label: "Cover Format", prompt: "Choose what needs to be designed.", options: choices("Front Cover", "Full Wrap Cover", "Ebook Cover", "Paperback", "Hardcover Dust Jacket"), allowCustom: true }),
  Object.freeze({ id: "trimSize", group: "Production", label: "Trim Size", prompt: "Choose the finished book proportions.", options: choices("5 x 8 in", "5.5 x 8.5 in", "6 x 9 in", "Square", "A5", "Custom Size"), allowCustom: true }),
  Object.freeze({ id: "finish", group: "Production", label: "Print Finish", prompt: "Choose optional production finishes.", options: choices("Matte", "Gloss", "Soft Touch", "Gold Foil", "Silver Foil", "Embossed", "Spot UV", "Digital Only"), multiple: true, allowCustom: true })
]);

const CHILDREN_BOOK_STEPS = Object.freeze([
  Object.freeze({ id: "title", group: "Story", label: "Book Title", prompt: "Enter a working title for the book.", options: Object.freeze([]), input: "text", required: true }),
  Object.freeze({ id: "premise", group: "Story", label: "Story Idea", prompt: "What happens, and why will a young reader care?", options: Object.freeze([]), input: "textarea", required: true }),
  Object.freeze({ id: "readingAge", group: "Story", label: "Reading Age", prompt: "Choose the age range this book is written for.", options: choices("Baby 0-2", "Toddler 2-4", "Preschool 3-5", "Early Reader 5-7", "Growing Reader 7-9", "Middle Grade 8-12"), allowCustom: true }),
  Object.freeze({ id: "bookFormat", group: "Story", label: "Book Type", prompt: "Choose the storytelling format.", options: choices("Board Book", "Picture Book", "Bedtime Story", "Early Reader", "Educational Story", "Chapter Book", "Activity Story"), allowCustom: true }),
  Object.freeze({ id: "pageCount", group: "Story", label: "Page Count", prompt: "Choose the approximate finished length.", options: choices("12 Pages", "16 Pages", "24 Pages", "32 Pages", "40 Pages", "48 Pages"), allowCustom: true }),
  Object.freeze({ id: "lesson", group: "Story", label: "Theme or Lesson", prompt: "Choose the heart of the story.", options: choices("Friendship", "Kindness", "Confidence", "Family", "Curiosity", "Feelings", "Sharing", "Courage", "Learning", "No Explicit Lesson"), allowCustom: true }),
  Object.freeze({ id: "mainCharacter", group: "Characters", label: "Main Character", prompt: "Describe the lead character, appearance, and personality.", options: Object.freeze([]), input: "textarea" }),
  Object.freeze({ id: "supportingCharacters", group: "Characters", label: "Supporting Characters", prompt: "Add family, friends, animals, or magical companions.", options: Object.freeze([]), input: "textarea" }),
  Object.freeze({ id: "setting", group: "Characters", label: "Story World", prompt: "Choose where the story takes place.", options: choices("Cozy Home", "Neighborhood", "School", "Forest", "Farm", "Ocean", "Outer Space", "Fantasy Kingdom", "Magical Everyday World"), allowCustom: true }),
  Object.freeze({ id: "continuity", group: "Characters", label: "Character Continuity", prompt: "Choose how strictly character details repeat across pages.", options: choices("Exact Model Sheet", "Consistent Outfit and Props", "Consistent Features with Outfit Changes", "Flexible Storybook Interpretation"), allowCustom: true }),
  Object.freeze({ id: "illustrationStyle", group: "Illustration", label: "Illustration Style", prompt: "Choose the art style for every page.", options: choices("Soft Watercolor", "Colorful Gouache", "Paper Cut Collage", "Soft 3D", "Kawaii", "Colored Pencil", "Ink and Wash", "Bold Flat Shapes", "Classic Storybook"), visual: "style", allowCustom: true }),
  Object.freeze({ id: "colorPalette", group: "Illustration", label: "Color Palette", prompt: "Choose a coordinated palette for the whole book.", options: PALETTES, visual: "palette", allowCustom: true }),
  Object.freeze({ id: "mood", group: "Illustration", label: "Mood", prompt: "Choose the emotional feeling.", options: choices("Warm and Safe", "Playful", "Dreamy", "Adventurous", "Funny", "Gentle", "Bright and Energetic"), allowCustom: true }),
  Object.freeze({ id: "pageLayout", group: "Layout", label: "Page Layout", prompt: "Choose how text and illustrations share each page.", options: choices("Full-Bleed Spreads", "Spot Illustrations", "Text Beside Art", "Framed Vignettes", "Comic Panels", "Mixed Layout"), allowCustom: true }),
  Object.freeze({ id: "textDensity", group: "Layout", label: "Text Amount", prompt: "Choose how much text appears per page.", options: choices("A Few Words", "One Short Sentence", "Two to Four Sentences", "Short Paragraphs", "Chapter Text"), allowCustom: true }),
  Object.freeze({ id: "typography", group: "Layout", label: "Typography", prompt: "Choose a readable type style.", options: choices("Rounded and Friendly", "Handwritten", "Classic Storybook Serif", "Clean Sans Serif", "Playful Display with Simple Body Text"), allowCustom: true }),
  Object.freeze({ id: "coverDirection", group: "Layout", label: "Cover Direction", prompt: "Describe the front-cover moment and title placement.", options: Object.freeze([]), input: "textarea" }),
  Object.freeze({ id: "delivery", group: "Production", label: "What to Build", prompt: "Choose the book material Vyrelix should prepare.", options: choices("Complete Book Plan", "Page-by-Page Storyboard", "Story and Illustration Direction", "Cover and Interior System", "Character and World Bible"), allowCustom: true })
]);

const STICKER_STEPS = Object.freeze([
  Object.freeze({ id: "packName", group: "Pack", label: "Pack Name", prompt: "Name this sticker pack.", options: Object.freeze([]), input: "text", required: true }),
  Object.freeze({ id: "stickerSubject", group: "Pack", label: "Character or Subject", prompt: "Describe who or what appears in every sticker.", options: Object.freeze([]), input: "textarea", required: true }),
  Object.freeze({ id: "packSize", group: "Pack", label: "Number of Stickers", prompt: "Choose how many coordinated stickers to create.", options: choices("4 Stickers", "6 Stickers", "8 Stickers", "12 Stickers", "16 Stickers", "24 Stickers"), allowCustom: true }),
  Object.freeze({ id: "packTheme", group: "Pack", label: "Pack Theme", prompt: "Choose what connects the set.", options: choices("Everyday Reactions", "Celebration", "Love and Friendship", "Work and Productivity", "School", "Gaming", "Food", "Self Care", "Seasonal", "Brand Mascot"), allowCustom: true }),
  Object.freeze({ id: "variationType", group: "Pack", label: "Variation Type", prompt: "Choose how the stickers vary.", options: choices("Expressions", "Poses and Actions", "Short Phrases", "Outfit Changes", "Props", "Mixed Variety"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "expressions", group: "Expressions", label: "Expressions", prompt: "Choose all expressions needed in the pack.", options: choices("Happy", "Laughing", "Excited", "Confident", "Love", "Surprised", "Thinking", "Sleepy", "Sad", "Angry", "Celebrating", "Shy"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "actions", group: "Expressions", label: "Actions and Poses", prompt: "Choose all actions needed in the pack.", options: choices("Waving", "Thumbs Up", "Dancing", "Cheering", "Working", "Relaxing", "Eating", "Running", "Taking a Photo", "Holding a Sign", "Facepalm", "Hugging"), multiple: true, allowCustom: true }),
  Object.freeze({ id: "phrases", group: "Expressions", label: "Words or Phrases", prompt: "Add any exact words that should appear.", options: Object.freeze([]), input: "textarea" }),
  Object.freeze({ id: "stickerStyle", group: "Design", label: "Sticker Style", prompt: "Choose the visual style for the complete pack.", options: choices("Cute 2D", "Soft 3D", "Kawaii", "Hand Drawn", "Bold Graphic", "Retro Cartoon", "Watercolor", "Pixel Art", "Realistic"), visual: "style", allowCustom: true }),
  Object.freeze({ id: "palette", group: "Design", label: "Color Palette", prompt: "Choose the coordinated color direction.", options: PALETTES, visual: "palette", allowCustom: true }),
  Object.freeze({ id: "outlineColor", group: "Design", label: "Outline Color", prompt: "Choose the sticker border color.", options: choices("White", "Black", "Color Matched", "Cream", "No Outline"), allowCustom: true }),
  Object.freeze({ id: "outlineThickness", group: "Design", label: "Outline Thickness", prompt: "Choose how bold the border should be.", options: choices("Thin", "Medium", "Thick", "Extra Thick"), allowCustom: true }),
  Object.freeze({ id: "background", group: "Design", label: "Background", prompt: "Choose the area outside each sticker.", options: choices("Transparent", "White", "Color Matched", "Textured"), allowCustom: true }),
  Object.freeze({ id: "cutStyle", group: "Production", label: "Cut Style", prompt: "Choose how physical or digital stickers are prepared.", options: choices("Die-Cut", "Kiss-Cut Sheet", "Printable Sheet", "Digital Only"), allowCustom: true }),
  Object.freeze({ id: "finish", group: "Production", label: "Finish", prompt: "Choose the surface finish.", options: choices("Matte", "Glossy", "Holographic", "Glitter", "Clear Vinyl", "Paper"), allowCustom: true }),
  Object.freeze({ id: "arrangement", group: "Production", label: "Delivery Arrangement", prompt: "Choose how the finished pack is organized.", options: choices("Individual Transparent Files", "Sticker Sheet", "Individual Files and Sheet", "Messaging App Pack"), allowCustom: true }),
  Object.freeze({ id: "constraints", group: "Production", label: "Production Notes", prompt: "Add sizing, safe-area, text, or content requirements.", options: Object.freeze([]), input: "textarea" })
]);

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

export function guidedSteps(categoryOrId, answers = {}) {
  const category = typeof categoryOrId === "string" ? getCreationCategory(categoryOrId) : categoryOrId;
  if (category.id === "book-cover") return BOOK_COVER_STEPS;
  if (category.id === "children-book") return CHILDREN_BOOK_STEPS;
  if (category.id === "sticker") return STICKER_STEPS;
  const personLike = new Set(["person", "woman", "man", "teen", "family", "baby", "toddler", "child", "fantasy-character", "sci-fi-character"]);
  if (!personLike.has(category.id)) return Object.freeze(genericSteps(category));
  const selectedAge = String(answers.age || "").toLocaleLowerCase().replace(/[^a-z]/g, "");
  const overrides = AGE_WARDROBE_OVERRIDES[category.id] || AGE_WARDROBE_OVERRIDES[selectedAge];
  if (!overrides) return PERSON_STEPS;
  return Object.freeze(PERSON_STEPS.map((step) => Object.freeze(overrides[step.id] ? { ...step, options: overrides[step.id] } : step)));
}

export function suggestedAnswer(step, category) {
  if (step.options?.length) return step.options[0].value;
  const tailored = {
    title: category.id === "children-book" ? "The Little Star Who Found Home" : "Untitled Book",
    author: "Author Name",
    premise: "A curious young hero faces a small challenge, discovers an unexpected strength, and returns home changed.",
    mainCharacter: "A warm, curious young hero with a distinctive outfit and an expressive personality.",
    supportingCharacters: "A loyal friend and a caring grown-up who help the hero along the way.",
    coverDirection: "Show the main character in the story world with clear title space and one inviting visual mystery.",
    packName: "Everyday Expressions",
    stickerSubject: "One expressive original character shown consistently across the complete pack.",
    phrases: "Hello!; Thank you!; You got this!; Yay!",
    constraints: "Keep every sticker readable at small sizes with clean separation and consistent character details."
  };
  if (tailored[step.id]) return tailored[step.id];
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
  clothingColor: "clothing",
  topColor: "clothing",
  bottomColor: "clothing",
  outfitColor: "clothing",
  outerwearColor: "clothing",
  shoeColor: "clothing",
  accessoryColor: "accessories",
  jewelryColor: "accessories",
  propColor: "accessories",
  fabric: "materials",
  pattern: "clothing",
  fit: "clothing",
  occasion: "purpose",
  season: "environment",
  era: "artistic-style",
  culturalInfluence: "clothing",
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
  setting: "environment",
  title: "subject",
  author: "typography",
  subtitle: "headline",
  genre: "purpose",
  storyHook: "story",
  imagery: "subject",
  coverStyle: "artistic-style",
  coverTone: "mood",
  typography: "typography",
  coverFormat: "aspect-ratio",
  trimSize: "aspect-ratio",
  finish: "materials",
  premise: "story",
  readingAge: "purpose",
  bookFormat: "purpose",
  pageCount: "composition",
  lesson: "story",
  mainCharacter: "subject",
  supportingCharacters: "subject",
  continuity: "quality",
  illustrationStyle: "artistic-style",
  pageLayout: "composition",
  textDensity: "composition",
  coverDirection: "story",
  delivery: "purpose",
  packName: "subject",
  stickerSubject: "subject",
  packSize: "composition",
  packTheme: "purpose",
  variationType: "composition",
  expressions: "expression",
  actions: "pose",
  phrases: "headline",
  stickerStyle: "artistic-style",
  outlineColor: "palette",
  outlineThickness: "quality",
  cutStyle: "materials",
  arrangement: "aspect-ratio",
  constraints: "negative-prompt"
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
  const steps = guidedSteps(category, answers);
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
  specification.displayName = displayAnswer(answers.title || answers.packName || answers.stickerSubject || answers.assetSubject);
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
