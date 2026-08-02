const clean=value=>String(value??"").trim();
const list=value=>Array.isArray(value)?value:clean(value)?[value]:[];
const key=value=>clean(value).toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const retiredKeys=new Set(["body","bodyType","undertone","cheeks","cheekbones","jawline","lips","lipShape","lipFullness","lipFinish","nose","lashes","brows","facialFeatures"]);
const unsafePositive=/\b(sexualized child|seductive|flirty|sultry|smoldering|alluring|romantic gaze|nightclub|casino|adult lounge|luxury nightlife|adult fashion runway|mature hotel room|adult clubwear|plunging neckline|sheer clothing|body[- ]hugging|form[- ]fitting|body arch|hip emphasis|adult modeling pose|fashion-model gaze)\b/gi;

const replacements=[
 [/Nyvera Kids Luxury Clothing Line/gi,"polished age-appropriate premium clothing"],[/\bNyvera\b/gi,""],[/Custom Age-Appropriate Build/gi,"natural age-appropriate build"],[/Custom Realistic Role/gi,"positive everyday interest"],[/Fitted for Age/gi,"comfortable age-appropriate fit"],[/Adult Body Proportions/gi,"natural age-appropriate proportions"],[/Adult Proportions/gi,"natural age-appropriate proportions"],[/Fashion-Model Proportions/gi,"natural age-appropriate proportions"],[/\b(Petite|Slim|Curvy|Athletic Body|Soft Build|Stocky|Tall and Lean)\b/gi,"natural age-appropriate build"],[/\b(Full Lips|Soft Full Lips|Cheekbone Emphasis|Sculpted Jawline|Glamorous Facial Features)\b/gi,""],[/\b(Soft Glam|Full Glam|Glam Makeup|Editorial Makeup|Luxury Makeup|Light Age-Appropriate Makeup|Natural Makeup)\b/gi,"natural age-appropriate grooming"],[/\b(Long Acrylic Nails|Embellished Nails)\b/gi,"clean natural nails"],[/\b(adult glamour|glamorous styling)\b/gi,"wholesome styling"],[/\brevealing clothing\b/gi,"modest age-appropriate clothing"],[/\b(mini dress|crop top)\b/gi,"school-friendly outfit"],[/\b(Fashion Pose|Red Carpet Pose|Editorial Body Pose|Glamour Pose|Runway Pose|Adult Modeling Pose)\b/gi,"natural activity pose"],[/\bAge-Appropriate Jewelry\b/gi,"simple child-safe jewelry"],[/\b(luxury jewelry|diamond jewelry|body jewelry|high-fashion accessories|adult handbags?)\b/gi,"simple age-appropriate accessory"],[/\bsexualized child\b/gi,""],[/\bpose\s+pose\b/gi,"pose"]
];

export function sanitizeKidsText(value){let result=clean(value);for(const [pattern,replacement] of replacements)result=result.replace(pattern,replacement);return result.replace(unsafePositive,"").replace(/\s{2,}/g," ").replace(/\s+([,.;:])/g,"$1").trim()}

const buildMap=value=>{const selected=key(value);if(!selected)return "";if(selected.includes("baby"))return "natural baby proportions";if(selected.includes("toddler"))return "natural toddler proportions";if(selected.includes("chibi"))return "classic chibi proportions";if(selected.includes("storybook"))return "soft storybook proportions";if(selected.includes("realistic"))return "realistic child proportions";return "natural age-appropriate proportions"};
const groomingMap=(value,age)=>{const selected=key(value);if(!selected||selected==="none"||selected==="no makeup")return "simple, natural presentation";if(age==="Teen"&&/stage|performance/.test(selected))return "age-appropriate stage grooming for a supervised performance";return age==="Teen"?"neat, school-appropriate grooming":"simple, natural presentation"};
const nailMap=value=>{const selected=key(value);if(!selected||selected==="none")return "";if(/polish|color|art/.test(selected))return "simple child-safe nail color";return "clean natural nails"};
const expressionMap=value=>{const selected=sanitizeKidsText(value).replace(/\s+expression$/i,"");if(!selected)return "cheerful, friendly";if(/sassy|smirk/i.test(selected))return "playful smile with cheerful confidence";if(/mysterious|powerful|editorial/i.test(selected))return "calm and confident";return selected};
const unsafeScene=/\b(nightclub|bar|adult lounge|romantic restaurant|luxury nightlife|casino|adult fashion runway|mature hotel room|red carpet event)\b/i;
const sceneMap=value=>{const selected=sanitizeKidsText(value);return !selected||unsafeScene.test(selected)?"bright family-friendly creative setting":selected};
const clothingMap=value=>sanitizeKidsText(value).replace(/Everyday Casual/gi,"comfortable everyday playwear").replace(/Contemporary Kids Fashion/gi,"age-appropriate contemporary clothing").replace(/Tween Fashion/gi,"casual school-friendly tween clothing").replace(/Teen Fashion/gi,"modest teen school fashion").replace(/Luxury/gi,"premium").replace(/Sophisticated Teen/gi,"polished teen").replace(/premium age-appropriate premium clothing/gi,"polished age-appropriate premium clothing");
const accessoryMap=value=>sanitizeKidsText(value).replace(/\bToy\b/gi,"safe toy").replace(/Stuffed Animal/gi,"plush toy");

export function normalizeKidsSource(data={}){
 const next={};
 for(const [name,value] of Object.entries(data)){
  if(retiredKeys.has(name)||name==="negative")continue;
  if(name==="build"||name==="proportions"){next.proportions=buildMap(value);continue}
  if(name==="complexion"){next.complexion=list(value).map(item=>sanitizeKidsText(item).replace(/Beauty Marks/gi,"birthmark")).filter(item=>item&&!/Rosy Cheeks|Clear Complexion/i.test(item));continue}
  if(name==="grooming"||name==="teenMakeup"||name==="makeup"){if(!next.grooming)next.grooming=groomingMap(value,data.age);continue}
  if(name==="nails"){next.nails=nailMap(value);continue}
  if(name==="fit"){next.fit=/tailor|school/i.test(clean(value))?"school-appropriate fit":/sport|active|movement/i.test(clean(value))?"movement-friendly fit":"comfortable fit";continue}
  if(name==="clothing"||name==="outfit"||name==="luxuryOutfit"||name==="top"||name==="bottom"){next[name]=clothingMap(value);continue}
  if(name==="accessories"){next.accessories=list(value).map(accessoryMap).filter(Boolean);continue}
  if(name==="expression"){next.expression=expressionMap(value);continue}
  if(name==="pose"){next.pose=kidsPosePhrase(value);continue}
  if(name==="environment"||name==="scene"){next[name]=sceneMap(value);continue}
  if(name==="activity"){const safe=sanitizeKidsText(value);next.activity=/nightlife|dating|cocktail|adult party/i.test(safe)?"positive age-appropriate activity":safe;continue}
  if(Array.isArray(value))next[name]=value.map(sanitizeKidsText).filter(Boolean);else next[name]=sanitizeKidsText(value);
 }
 if(!next.proportions)next.proportions=buildMap(data.proportions||data.build||data.age);
 if(next.age==="Baby"){
  if(!/birthday|bedtime|little sibling/i.test(next.role||""))next.role="";
  next.proportions="natural baby proportions";
  if(!/baby|romper|pajama|family photo/i.test(`${next.clothing||""} ${next.outfit||""}`)){next.clothing="comfortable baby clothing";next.outfit=""}
  if(next.shoes&&!/baby|soft|barefoot/i.test(next.shoes))next.shoes="soft baby shoes";
  if(next.hairStyle&&!/baby|infant|curl/i.test(next.hairStyle))next.hairStyle="Baby Curls";
  next.accessories=(next.accessories||[]).filter(item=>/plush|soft toy|book|bow|headband|baby/i.test(item));
  if(next.pose&&!/baby|supported|sitting|crawling|reaching|clapping/i.test(next.pose))next.pose="Baby Sitting";
  if(next.activity&&!/gentle|play|discovery|family|story/i.test(next.activity))next.activity="gentle play and early discovery";
  if(next.environment&&!/family|nursery|bedroom|home|studio/i.test(next.environment))next.environment="safe family setting";
  next.nails="";next.grooming="simple, natural presentation";
 }
 if(next.age==="Toddler"){
  next.proportions="natural toddler proportions";
  if(!/toddler|play|pajama|school|church|birthday|seasonal|family/i.test(`${next.clothing||""} ${next.outfit||""}`)){next.clothing="comfortable toddler play clothing";next.outfit=""}
  if(next.pose&&!/toddler|walking|sitting|playing|drawing|reading|waving|dancing/i.test(next.pose))next.pose="Toddler Walking";
  next.nails="";next.grooming="simple, natural presentation";
 }
 return next;
}

const focus={
 Baby:"safe family connection, gentle play, and early discovery",
 Toddler:"play, simple learning, family routines, and cheerful discovery",
 "Preschool Child":"play, preschool learning, books, art, music, family, and imagination",
 "Young Child":"elementary learning, hobbies, reading, sports, creativity, friendship, and confidence",
 "Older Child":"school projects, clubs, sports, reading, music, science, art, and positive achievement",
 Tween:"school, creativity, hobbies, sports, reading, music, technology, friendship, and positive self-expression",
 Teen:"education, school life, graduation, clubs, sports, creative projects, leadership, volunteering, and positive goals"
};
const presentation=value=>{const selected=key(value);if(selected.includes("girl")||selected.includes("feminine"))return "girl";if(selected.includes("boy")||selected.includes("masculine"))return "boy";if(selected.includes("nonbinary"))return "nonbinary young person";if(selected.includes("androgynous")||selected.includes("neutral"))return "young person with a neutral presentation";return "child or teen"};
export function kidsAgeFoundation(data={}){
 const age=clean(data.age)||"Young Child",identity=presentation(data.presentation);
 const opening=age==="Baby"?`Create a wholesome baby with soft infant features, natural baby proportions, comfortable baby clothing, a gentle expression, and an age-appropriate pose in a safe family setting.`:age==="Toddler"?`Create a cheerful toddler with natural toddler proportions, comfortable play clothing, a simple hairstyle, and a safe playful activity in a bright family-friendly environment.`:age==="Teen"?`Create a wholesome teenage ${identity==="boy"||identity==="girl"?identity:"young person"} with a clearly youthful, natural, non-glamorous appearance and modest school-friendly clothing.`:`Create a wholesome, age-appropriate human ${age.toLowerCase()} ${identity} for a family-friendly, educational, creative, school, story, activity, or positive lifestyle project.`;
 return `${opening} Maintain the selected ${age} age group exactly. Focus on ${focus[age]||focus["Young Child"]}. Keep the character natural, cheerful, expressive, family-friendly, and appropriate for the selected age.`;
}

export function kidsPosePhrase(value){const selected=sanitizeKidsText(value).replace(/\s+pose$/i,"").trim();if(!selected)return "standing in a natural age-appropriate pose";const map={"Casual Locker":"posed casually beside a school locker","Portrait":"standing naturally for a school-friendly portrait","School Portrait":"standing naturally for a school picture","Family Photo":"posed naturally for a family photo","Baby Sitting":"sitting safely with age-appropriate support","Toddler Walking":"walking naturally in a safe setting","Studying at Café Table":"studying confidently at a café-style table"};if(map[selected])return map[selected];if(/^Holding /i.test(selected))return selected.toLowerCase();if(/^(Reading|Drawing|Writing|Studying|Playing|Running|Dancing|Waving|Standing|Sitting|Walking)/i.test(selected))return selected.toLowerCase();return `in a safe ${selected.toLowerCase()} pose`}
export function kidsHairPhrase(data={}){const parts=[sanitizeKidsText(data.hairColor),sanitizeKidsText(data.hairLength),sanitizeKidsText(data.hairStyle)],texture=sanitizeKidsText(data.hairTexture),joined=parts.filter(Boolean).join(" ");if(texture&&!new RegExp(key(texture).replace(/\s+/g,".*"),"i").test(key(joined)))parts.push(texture);const phrase=parts.filter(Boolean).join(" ").replace(/\b(Braids)\s+.*\bBraids\b/i,"$1");return phrase?`${phrase.toLowerCase()} hairstyle`:"simple age-appropriate hairstyle"}
export function kidsExpressionPhrase(value){return expressionMap(value).toLowerCase()}
export function kidsClothingPhrase(data={}){const clothing=clothingMap(data.luxuryOutfit||data.outfit||data.clothing)||"comfortable age-appropriate clothing",shoes=clothingMap(data.shoes);return `Dress the character in modest, family-friendly ${clothing.toLowerCase()}${shoes?` with ${shoes.toLowerCase()}`:""}, using a comfortable activity-appropriate fit.`}

const defaultNegative=["distorted anatomy","extra fingers","missing fingers","blurry eyes","duplicate characters","inconsistent identity","changed skin tone","changed hairstyle","incorrect age group","cropped character","cropped product","warped layout","unreadable text","misspelled text","incorrect dimensions","incorrect item count","cluttered composition","unrelated objects","unsafe objects","mature styling","fantasy elements","superhero elements","weapons","logos","brand names","wordmarks","signatures","watermarks","monograms","standalone letter N symbols"];
function safeNegativeItem(value){let item=clean(value).replace(/^avoid\s+/i,"");if(!item)return "";if(/sexualized child/i.test(item))return "";if(/adult body proportions|adult proportions/i.test(item))return "incorrect age group";if(/adult glamour|revealing clothing|mature body|seductive|fitted for age/i.test(item))return "mature styling";if(/fantasy species|magical beings|fantasy features/i.test(item))return "fantasy elements";if(/superheroes|superhero clothing/i.test(item))return "superhero elements";if(/duplicate children/i.test(item))return "duplicate characters";if(/identical faces/i.test(item))return "inconsistent identity";if(/cropped child/i.test(item))return "cropped character";if(/incorrect number of (cards|products)/i.test(item))return "incorrect item count";return sanitizeKidsText(item)}
export function kidsSafeNegative(...sources){const seen=new Set(),result=[];for(const item of [...sources.flatMap(source=>list(source).flatMap(value=>clean(value).split(","))),...defaultNegative]){const safe=safeNegativeItem(item),normalized=key(safe).replace(/\b(no|avoid)\b/g,"").split(" ").sort().join(" ");if(safe&&normalized&&!seen.has(normalized)){seen.add(normalized);result.push(safe)}}return result.join(", ")}
export const kidsSensitiveOutputPattern=/sexualized child|revealing clothing|adult glamour|fitted for age|adult body proportions|full lips|cheekbone emphasis|sculpted jawline|fashion-model|seductive|flirty|sultry|smoldering|alluring|romantic gaze/i;
