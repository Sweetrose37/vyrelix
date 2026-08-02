const list=value=>value.split("|").map(x=>x.trim()).filter(Boolean);
const genericWords=new Set(["luxury","premium","elegant","modern","stylish","designer","inspired"]);
const synonyms=new Map([["seated","sitting"],["cheerful","happy"],["gown","dress"],["pony tail","ponytail"],["box braid","box braids"],["classrooms","classroom"]]);
const singular=word=>word.endsWith("ies")?`${word.slice(0,-3)}y`:word.endsWith("ss")?word:word.length>3&&word.endsWith("s")?word.slice(0,-1):word;
const canonicalPhrases=new Map([["both hand on hip","hand on hip"],["soft baby curl","baby curl"],["standing for school picture","school portrait pose"]]);
export function normalizeOption(option){let text=typeof option==="string"?option:option?.label||option?.value||"";text=text.toLocaleLowerCase().replace(/[-–—_/]+/g," ").replace(/[^\p{L}\p{N}\s]/gu," ").replace(/\s+/g," ").trim();for(const [from,to] of synonyms)text=text.replace(new RegExp(`\\b${from}\\b`,"g"),to);text=text.split(" ").map(singular).join(" ");return canonicalPhrases.get(text)||text}
const weakKey=value=>normalizeOption(value).split(" ").filter(word=>!genericWords.has(word)).sort().join(" ");
export function addUniqueOptions(existing=[],candidates=[],context="options"){
  const result=[...existing],seen=new Set(existing.map(normalizeOption)),weak=new Set(existing.map(weakKey)),rejected=[];
  for(const candidate of candidates){const label=typeof candidate==="string"?candidate:candidate?.label||candidate?.value||"",key=normalizeOption(label),loose=weakKey(label);if(!label||seen.has(key)||weak.has(loose)){rejected.push(label);continue}seen.add(key);weak.add(loose);result.push(candidate)}
  if(rejected.length&&typeof console!=="undefined")console.info(`Nyvera content library rejected ${rejected.length} duplicate candidate(s) from ${context}:`,rejected);return {options:result,additions:result.slice(existing.length),rejected}
}
export const flattenGroups=groups=>Object.values(groups).flat();
export function isOptionAgeCompatible(option,age=""){
  const label=String(typeof option==="string"?option:option?.label||option?.value||"");
  if(!age)return true;
  const rules={
    Baby:/\b(Toddler|Tween|Teen|Kindergarten|Elementary|Middle School|High School|School|Classroom|Graduation|Locker|Science Lab|Computer Lab)\b/i,
    Toddler:/\b(Baby|Tween|Teen|Kindergarten|Elementary|Middle School|High School|School|Classroom|Graduation|Locker|Science Lab|Computer Lab)\b/i,
    "Young Child":/\b(Baby|Toddler|Tween|Teen|Middle School|High School|Graduation|Locker)\b/i,
    "Older Child":/\b(Baby|Toddler|Teen)\b/i,
    Tween:/\b(Baby|Toddler|Kindergarten|Elementary|High School)\b/i,
    Teen:/\b(Baby|Toddler|Kindergarten|Elementary)\b/i
  };
  return !(rules[age]?.test(label));
}

export const characterScenes={
 "Urban and City":list("Downtown Crosswalk|Rooftop Lounge|Luxury Hotel Entrance|Boutique Shopping District|City Café Terrace|Modern Train Platform|Upscale Apartment Balcony|Art District Street|Nighttime City Boulevard|Glass Office Tower Lobby|Brownstone Front Steps|City Park Promenade|Penthouse Terrace|Museum Plaza|Outdoor Market Street"),
 "Professional and Business":list("Executive Boardroom|Private Office Suite|Coworking Studio|Conference Stage|Corporate Reception Area|Creative Agency Workspace|Fashion Design Studio|Photography Studio|Law Office Library|Medical Office|University Lecture Hall|Podcast Recording Studio|Television Interview Set|Business Networking Event|Product Launch Venue"),
 "Home and Lifestyle":list("Luxury Walk-In Closet|Modern Kitchen|Reading Nook|Home Library|Vanity Room|Cozy Living Room|Elegant Dining Room|Sunroom|Private Garden Patio|Dressing Room|Home Music Room|Craft Studio|Spa-Inspired Bathroom|Fireplace Lounge|Laundry Room Lifestyle Scene"),
 "Fashion and Beauty":list("Editorial Backdrop Studio|Backstage Dressing Area|Beauty Salon|Hair Studio|Makeup Vanity Set|Fashion Show Backstage|Designer Showroom|Boutique Fitting Room|Jewelry Display Salon|Bridal Boutique|Department Store Fashion Floor|Luxury Shoe Boutique|Fashion Week Street|Beauty Campaign Set|Clothing Rack Studio"),
 "Social and Entertainment":list("Brunch Restaurant|Jazz Lounge|Rooftop Dinner|Art Gallery Opening|Birthday Dinner|Wedding Reception|Cocktail Party|Book Signing|Community Event|Award Ceremony|Theater Lobby|Concert Venue|Dance Studio|Wine-Free Social Lounge|Charity Gala"),
 "Faith and Community":list("Church Sanctuary|Church Fellowship Hall|Community Center|Bible Study Room|Ministry Office|Church Steps|Volunteer Event|Women’s Conference Stage|Faith-Based Bookstore|Prayer Room"),
 "Travel and Leisure":list("Airport Lounge|Boutique Hotel Room|Cruise Deck|Resort Lobby|Poolside Cabana|Mountain Lodge|Vineyard-Inspired Estate Without Alcohol|Coastal Boardwalk|Luxury Train Car|Roadside Scenic Overlook|Historic Town Square|European-Inspired Street|Tropical Resort Garden|Desert Resort Patio|Lakeside Dock"),
 Seasonal:list("Spring Flower Market|Summer Patio|Autumn City Park|Winter Hotel Lobby|Rainy City Street|Snowy Urban Walkway|Holiday Living Room|New Year Celebration Set|Valentine Dinner Setting|Graduation Venue")};
export const kidsScenes={
 "Home and Family":list("Breakfast Table|Family Reading Room|Homework Corner|Toy Storage Room|Cozy Blanket Fort|Child’s Art Wall|Family Movie Night|Baking With Family|Morning Routine Bedroom|After-School Snack Table|Family Game Night|Sibling Shared Room|Grandparent’s Living Room|Family Photo Studio|Bedtime Story Corner"),
 "School and Learning":list("Kindergarten Classroom|Elementary Classroom|Middle School Classroom|High School Classroom|School Computer Lab|School Art Studio|School Music Room|School Cafeteria|School Auditorium|School Gymnasium|School Courtyard|Science Lab|Reading Intervention Room|Homeschool Workspace|Tutoring Table|School Bus Interior|School Entrance|Locker Hallway|Career Day Classroom|Graduation Stage"),
 "Creative and Activity":list("Children’s Art Studio|Dance Class|Music Lesson Room|Robotics Club|Coding Club|Cooking Class|Craft Table|Photography Club|Drama Rehearsal|Young Author Workshop|Pottery Class|Sewing Project Table|Painting Easel Area|Building Blocks Station|Puzzle Activity Table"),
 "Community and Faith":list("Children’s Church Room|Sunday School Classroom|Youth Group Room|Community Library Program|Children’s Museum|Community Garden|Volunteer Packing Table|Neighborhood Block Party|Youth Choir Rehearsal|Vacation Bible School Classroom"),
 "Outdoor and Recreation":list("Neighborhood Sidewalk|Bicycle Path|Picnic Area|Splash Pad|Soccer Field|Basketball Court|Baseball Field|Running Track|Skate Park|Nature Trail|Butterfly Garden|Pumpkin Patch|Apple Orchard|Zoo Viewing Area|Aquarium Exhibit|Botanical Garden|Camping Site|Beach Picnic|Snow Day Backyard|Playground Climbing Area"),
 "Celebrations and Milestones":list("First Day of School Entrance|Birthday Party Table|Graduation Celebration|School Award Ceremony|Holiday Classroom Party|Family Reunion|Baby’s First Birthday|Tween Sleepover|Teen Study Party|Church Youth Celebration|Sports Trophy Ceremony|Dance Recital Stage|Music Recital Stage|Book Fair|Science Fair"),
 Travel:list("Airport With Family|Train Station|Road Trip Rest Stop|Hotel Family Suite|Theme Park Entrance|Museum Trip|Beach Resort|Mountain Cabin|City Sightseeing Tour|National Park Visitor Center")};

export const characterPoses={
 Standing:list("Relaxed Standing Pose|One Hand in Pocket|Both Hands in Pockets|Arms Folded|One Hand on Hip|Both Hands on Hips|Weight Shifted to One Leg|Crossed-Ankle Standing Pose|Looking Over Shoulder|Adjusting Jacket|Holding Handbag at Side|Holding Bag in Front|Leaning Against Wall|Standing Beside Chair|Standing at Counter"),
 Sitting:list("Seated With Crossed Legs|Seated With Ankles Crossed|Seated Leaning Forward|Seated Reading|Seated Using Laptop|Seated Holding Coffee Mug|Seated at Desk|Seated on Sofa|Seated on Bar Stool|Seated on Floor With Legs to Side|Seated With Hands Folded|Seated Turning Toward Camera"),
 "Walking and Movement":list("Confident Walking Pose|Mid-Step Street Style Pose|Walking While Holding Bag|Walking Down Stairs|Entering a Building|Leaving a Vehicle|Turning While Walking|Casual Stroll|Runway Walk|Walking With Coat Movement"),
 "Professional and Activity":list("Presenting at a Screen|Speaking at Podium|Typing at Desk|Writing in Notebook|Reviewing Documents|Holding Tablet|Taking a Photograph|Styling Clothing Rack|Applying Makeup|Arranging Flowers|Cooking at Counter|Reading to an Audience|Recording a Podcast|Holding a Product for Display|Greeting a Client"),
 "Editorial and Fashion":list("Editorial Hand-to-Face Pose|Chin Resting on Hand|Hand Adjusting Sunglasses|Coat Draped Over Shoulder|Hand Holding Lapel|Side Profile Fashion Pose|Seated Editorial Pose|Dramatic Turn Pose|Symmetrical Front-Facing Pose|Low-Angle Power Pose|Shoulder-Forward Portrait Pose|Hand Near Earrings|Bag Showcase Pose|Shoe Showcase Pose|Jewelry Showcase Pose"),
 "Couple and Group":list("Standing Side by Side|Back-to-Back Pose|Walking Together|Seated Conversation|Coordinated Fashion Lineup|Group Laughing Naturally|Professional Team Pose|Family Portrait Arrangement|Friends Brunch Pose|Event Photo Pose")};
export const kidsPoses={
 "Baby and Toddler":list("Baby Tummy-Time Pose|Baby Reaching for Toy|Baby Clapping|Baby Crawling|Baby Supported Sitting|Toddler Holding Parent’s Hand|Toddler Carrying Stuffed Animal|Toddler Building Blocks|Toddler Looking at Picture Book|Toddler Dancing|Toddler Waving|Toddler Sitting Cross-Legged"),
 "School and Learning":list("Raising Hand|Writing at Desk|Reading at Desk|Holding School Project|Carrying Backpack|Using Classroom Tablet|Presenting Science Project|Drawing at Easel|Playing Instrument|Looking Through Microscope|Holding Report Card|Studying With Flashcards|Working on Group Project|Reading With Teacher"),
 "Play and Activity":list("Jumping Rope|Kicking Soccer Ball|Dribbling Basketball|Throwing Baseball|Riding Bicycle|Skating|Running Across Playground|Swinging|Climbing Playground Steps|Blowing Bubbles|Flying a Kite|Gardening|Building Sandcastle|Playing Board Game|Doing a Puzzle"),
 "Portrait and Lifestyle":list("Hands Behind Back|Holding Favorite Book|Hugging Stuffed Animal|Sitting on Bedroom Rug|Standing With Backpack|Leaning on Desk|Holding Art Supplies|Waving at Camera|Peace-Sign Pose|Hands Folded in Front|Looking Over Shoulder|Sitting on Bench|Sibling Side-by-Side Pose|Graduation Cap Pose"),
 Teen:list("Casual Locker Pose|Studying at Café Table|Holding Laptop|Standing With Books|Seated on School Steps|Creative Portfolio Pose|Sports Team Portrait|Musician Portrait|Young Entrepreneur Product Pose|Graduation Portrait|Volunteer Event Pose|Club Meeting Pose")};

export const characterExpressions={
 Positive:list("Radiant Smile|Warm Smile|Soft Smile|Proud Smile|Laughing Naturally|Quiet Joy|Hopeful|Inspired|Content|Grateful|Welcoming|Encouraging|Celebratory|Peaceful|Self-Assured"),
 "Professional and Editorial":list("Polished Confidence|Focused Professional|Calm Authority|Thoughtful Leadership|Refined Neutral Expression|Editorial Intensity|Composed|Observant|Visionary|Poised|Determined Focus|Quiet Strength|Strategic|Commanding|Graceful Confidence"),
 "Soft and Reflective":list("Dreamy|Reflective|Prayerful|Gentle Concern|Peaceful Reflection|Sentimental|Quietly Hopeful|Serene|Tender|Compassionate|Patient|Reassuring"),
 "Playful and Social":list("Playful Smirk|Knowing Smile|Friendly Wink|Excited Surprise|Amused|Flirty but Tasteful|Lighthearted|Curious Delight|Confident Grin|Sassy but Polished")};
export const kidsExpressions={
 Positive:list("Big Happy Smile|Gentle Smile|Proud Smile|Excited Grin|Laughing|Delighted|Friendly|Hopeful|Kind|Brave|Encouraged|Grateful|Peaceful|Loving"),
 "Learning and Focus":list("Concentrating|Curious Focus|Proud of My Work|Thinking Carefully|Listening Closely|Ready to Learn|Determined|Problem-Solving|Reading With Interest|Creative Focus"),
 "Soft and Emotional":list("Sleepy Contentment|Shy Smile|Comforted|Reassured|Wonder|Gentle Curiosity|Quietly Proud|Caring"),
 Playful:list("Silly Smile|Playful Wink|Excited Surprise|Giggle|Mischievous but Sweet|Ready for Adventure|Birthday Excitement|Game-Time Focus|Dance Joy|Sports Celebration")};

export const characterHairstyles={
 "Natural and Curly":list("Rounded Afro|Stretched Afro|Side-Part Afro|Sculpted Afro|Curly Bob|Curly Lob|Curly Pixie|Wash-and-Go Curls|Defined Coil-Out|Twist-Out|Braid-Out|Pineapple Updo|Curly High Bun|Curly Low Bun|Side-Swept Curls|Voluminous Natural Curls|Tapered Natural Cut|Finger Coils|Frohawk|Curly Half-Up Style"),
 "Braids and Twists":list("Jumbo Box Braids|Medium Box Braids|Micro Braids|Bohemian Box Braids|Goddess Braids|Fulani Braids|Lemonade Braids|Feed-In Braids|Stitch Braids|Braided Ponytail|Braided Bun|Braided Bob|Senegalese Twists|Marley Twists|Passion Twists|Havana Twists|Flat-Twist Updo|Two-Strand Twist Bob|Rope-Twist Ponytail|Half-Up Braided Style"),
 Locs:list("Short Starter Locs|Shoulder-Length Locs|Long Locs|Freeform Locs|Sisterlocks|Microlocs|Loc Bob|Loc Ponytail|Loc High Bun|Loc Petal Updo|Barrel-Twist Locs|Side-Swept Locs|Half-Up Loc Style|Loc Mohawk|Curly-End Locs"),
 "Straight and Wavy":list("Sleek Center-Part Bob|Sleek Side-Part Bob|Blunt Bob|Angled Bob|Shoulder-Length Silk Press|Long Silk Press|Layered Blowout|Feathered Layers|Hollywood Waves|Loose Body Waves|Beach Waves|Sleek Low Ponytail|High Wrapped Ponytail|French Twist|Chignon|Side-Part Pixie|Finger Waves|Bixie Cut|Shag Cut|Curtain-Bang Layers"),
 "Short and Masculine":list("Bald Fade|Low Taper Fade|High Fade|Burst Fade|Temple Fade|Caesar Cut|Textured Crop|Short Curls With Fade|Sponge Twists|Waves With Taper|Short Loc Fade|Braided Top Fade|Line-Up Cut|Salt-and-Pepper Low Cut|Classic Side Part")};
export const kidsHairstyles={
 "Baby and Toddler":list("Single Baby Puff|Double Baby Puffs|Mini Puff Row|Tiny Coil Fro|Beaded Toddler Braids|Toddler Cornrow Pigtails|Curly Toddler Bob|Mini Twist Puffs|Side-Part Toddler Curls|Bow Headband Curls|Short Toddler Fade"),
 "Girls and Feminine Styles":list("Bubble Ponytails|Braided Pigtails|Cornrow Ponytail|Beaded Cornrow Bob|Half-Up Puff Style|Heart-Part Braids|Crisscross Braids|Braided Space Buns|Curly Space Buns|Natural Hair Buns|School-Day Ponytail|Side Ponytail With Bow|Medium Knotless Braids|Shoulder-Length Twists|Tween Silk Press|Teen Layered Curls|Teen Braided Ponytail|Teen Loc Bob|Teen Half-Up Curls|Graduation Style With Cap Compatibility"),
 "Boys and Masculine Styles":list("Low Taper Curls|Mini Afro|Rounded Afro|Short Sponge Twists|Cornrow Rows|Two-Strand Twists|Short Starter Locs|Curly Top Fade|Low Cut With Line-Up|Braided Top|Teen Taper Fade|Teen Locs|Teen Twists|Teen Textured Crop"),
 "Neutral Styles":list("Chin-Length Curly Bob|Shoulder-Length Braids|Medium Natural Curls|Short Coily Cut|Half-Up Twists|Beaded Side Braids|Protective School Style|Sports-Friendly Braids|Swim-Friendly Cornrows|Hat-Compatible Low Braids")};

export const characterClothing={
 Casual:list("Ribbed Knit Top|Wrap Blouse|Denim Shirt|Utility Jacket|Cropped Cardigan|Longline Cardigan|Knit Midi Dress|Shirt Dress|Sweater Dress|Wide-Leg Jeans|Straight-Leg Jeans|Cargo Pants|Paperbag-Waist Pants|Midi Skirt|Pleated Skirt|Denim Skirt|Casual Co-Ord Set|Knit Lounge Set|Casual Jumpsuit|Trench Coat Outfit"),
 Professional:list("Double-Breasted Suit|Single-Breasted Suit|Vest and Trouser Set|Pencil-Skirt Suit|Wrap Dress for Work|Tailored Midi Dress|Blazer With Wide-Leg Pants|Blazer With Straight-Leg Pants|Structured Sheath Dress|Turtleneck and Trousers|Professional Cardigan Set|Belted Shirt Dress|Longline Vest Outfit|Executive Monochrome Look|Creative Director Workwear"),
 "Formal and Event":list("One-Shoulder Evening Dress|Off-Shoulder Evening Dress|Long-Sleeve Formal Gown|Tea-Length Formal Dress|Satin Slip Dress With Modest Layering|Tuxedo-Inspired Jumpsuit|Velvet Pantsuit|Formal Cape-Sleeve Dress|Embellished Midi Dress|Pleated Chiffon Dress|Formal Wrap Dress|Tailored Tuxedo|Dinner Jacket Ensemble|Three-Piece Formal Suit|Formal Skirt-and-Blouse Set"),
 "Church and Faith":list("Modest Midi Church Dress|Peplum Church Suit|Coordinated Skirt Suit|Cape-Sleeve Church Dress|Pleated Church Dress|Tailored Church Jumpsuit|Longline Blazer Church Outfit|Elegant Hat-and-Dress Ensemble|Modest Wide-Leg Suit|Embroidered Sunday Outfit"),
 Seasonal:list("Wool Coat Ensemble|Quilted Winter Jacket Outfit|Raincoat and Boots Outfit|Linen Summer Set|Resort Maxi Dress|Autumn Layered Outfit|Spring Trench Outfit|Holiday Velvet Dress|Cozy Turtleneck Set|Faux-Fur-Trim Coat Outfit"),
 "Streetwear and Contemporary":list("Oversized Blazer Streetwear|Varsity Jacket Outfit|Monochrome Tracksuit|Leather Moto Jacket Outfit|Denim-on-Denim Look|Elevated Hoodie Set|Graphic Tee and Tailored Pants|Utility Jumpsuit|Bomber Jacket Ensemble|Fashion Sneaker Look")};
export const kidsClothing={
 "Baby and Toddler":list("Cotton Romper|Knit Baby Set|Footed Pajamas|Overall Set|Soft Sweater Set|Tutu-Free Birthday Dress|Polo and Shorts Set|Baby Cardigan Outfit|Toddler Jogger Set|Raincoat and Boots Set|Winter Puffer Set|Holiday Knit Outfit|Church Romper|Family Photo Set|Soft Denim Overalls"),
 School:list("Polo and Khaki Uniform|Cardigan School Uniform|Sweater-Vest Uniform|Pleated-Skirt Uniform|Button-Down and Trousers|School Jumper Dress|Casual School Layers|School Spirit Outfit|Art-Class Smock|Science-Club Outfit|Field-Trip Outfit|Picture-Day Outfit|Book-Fair Outfit|School Concert Outfit|Graduation Outfit"),
 Casual:list("Graphic-Free Tee and Jeans|Hoodie and Joggers|Denim Jacket Outfit|Knit Dress and Leggings|Casual Overalls|Shorts and Polo|Relaxed Jumpsuit|Cardigan and Skirt|Sweater and Chinos|Casual Co-Ord Set|Summer Sundress|Athletic Short Set|Long-Sleeve Play Set|Cozy Lounge Set|Weekend Brunch Outfit"),
 "Church and Formal":list("Modest Church Dress|Cardigan and Dress Set|Blazer and Trousers|Button-Down Formal Outfit|Bow-Tie Suit|Vest-and-Trouser Set|Formal Jumpsuit|Wedding Guest Dress|Family Ceremony Outfit|Choir Performance Outfit"),
 "Tween and Teen":list("Wide-Leg Jeans and Knit Top|Varsity Jacket Look|Midi Skirt and Sweater|Blazer and Sneakers Outfit|Tailored Cargo Pants Look|Denim Midi Dress|Layered School Outfit|Modest Party Dress|Teen Pantsuit|Contemporary Church Outfit|Study Café Outfit|Creative Club Outfit|Teen Travel Set|Graduation Dress|Graduation Suit"),
 Seasonal:list("Spring Rain Outfit|Summer Linen Set|Autumn Layered Look|Winter Puffer Outfit|Holiday Sweater Set|Snow-Day Outfit|Beach Cover-Up Set|Pumpkin-Patch Outfit|Valentine School Outfit|First-Day-of-School Outfit")};

export const characterLuxury={
 "Luxury Daywear":list("Cashmere Travel Set|Silk-Twill Blouse and Trousers|Monochrome Luxury Knit Set|Tailored Denim Ensemble|Premium Linen Suit|Luxury Leather-Trim Trench|Structured Day Dress|Belted Cashmere Coat|Silk Shirt Dress|Elevated Resort Set"),
 "Luxury Workwear":list("Sculpted Blazer Suit|Contrast-Piping Pantsuit|Satin-Lapel Business Suit|Luxury Vest Suit|Architectural Peplum Suit|High-Waisted Tailored Suit|Draped Executive Dress|Couture-Inspired Work Jumpsuit|Premium Tweed Suit|Statement-Collar Office Dress"),
 "Luxury Evening":list("Sculptural Satin Gown|Velvet Column Gown|Draped One-Shoulder Gown|Beaded Cape Gown|Tuxedo Gown|Metallic Pleated Evening Dress|Feather-Trim Evening Ensemble|Crystal-Embellished Pantsuit|Silk Opera Coat Ensemble|Structured Cocktail Dress"),
 "Luxury Church and Occasion":list("Couture-Inspired Church Suit|Embroidered Silk Sunday Dress|Statement-Hat Formal Ensemble|Luxury Cape Dress|Brocade Skirt Suit|Pearl-Trim Modest Dress|Sculpted Peplum Occasion Suit|Satin and Lace Church Ensemble|Tailored Ceremony Jumpsuit|Formal Monochrome Sunday Look"),
 "Luxury Outerwear":list("Floor-Length Tailored Coat|Cape-Back Wool Coat|Belted Leather Trench|Crystal-Button Peacoat|Faux-Fur-Collar Wool Coat|Sculpted Shoulder Coat|Cashmere Wrap Coat|Brocade Evening Coat|Satin-Lined Statement Coat|Cropped Luxury Jacket"),
 "Luxury Accessories":list("Structured Top-Handle Bag|Quilted Chain Bag|Minimalist Leather Tote|Crystal Evening Clutch|Sculptural Handbag|Premium Travel Case|Silk Scarf|Statement Sunglasses|Luxury Watch|Layered Fine Jewelry Set")};
export const kidsLuxury={
 "Baby and Toddler Luxury":list("Premium Knit Romper|Cashmere-Blend Baby Set|Velvet Holiday Romper|Embroidered Church Set|Luxury Family Photo Outfit|Satin-Bow Dress|Tailored Toddler Blazer Set|Premium Quilted Coat|Fine-Knit Cardigan Set|Elegant Birthday Ensemble"),
 "School Luxury":list("Tailored School Blazer|Premium Sweater-Vest Uniform|Designer-Inspired Backpack Outfit|Luxury Picture-Day Look|Polished School Loafers Outfit|Fine-Knit School Set|Tailored Pleated Uniform|Premium School Coat|Elegant Academic Competition Outfit|Luxury Graduation Outfit"),
 "Occasion Luxury":list("Velvet Celebration Dress|Tailored Youth Suit|Satin-Lapel Teen Suit|Embroidered Ceremony Dress|Luxury Church Ensemble|Premium Wedding Guest Outfit|Pearl-Detail Modest Dress|Brocade Youth Jacket|Elegant Family Portrait Look|Sophisticated Teen Jumpsuit"),
 "Tween and Teen Luxury":list("Tailored Teen Pantsuit|Premium Knit Midi Dress|Structured Blazer and Trousers|Luxury Varsity-Inspired Jacket|Silk-Blend Blouse and Skirt|Monochrome Teen Fashion Set|Premium Travel Ensemble|Elegant Graduation Dress|Tailored Graduation Suit|High-End Contemporary Church Look"),
 "Luxury Outerwear and Accessories":list("Premium Wool Coat|Quilted Luxury Jacket|Tailored Trench Coat|Fine-Knit Scarf Set|Premium Mini Backpack|Age-Appropriate Pearl Jewelry|Satin Hair Accessory Set")};

export const contentLibraries={character:{environment:characterScenes,pose:characterPoses,expression:characterExpressions,hairStyle:characterHairstyles,outfit:characterClothing,luxuryOutfit:characterLuxury},kids:{environment:kidsScenes,pose:kidsPoses,expression:kidsExpressions,hairStyle:kidsHairstyles,outfit:kidsClothing,luxuryOutfit:kidsLuxury}};
