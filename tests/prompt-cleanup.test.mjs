import test from "node:test";
import assert from "node:assert/strict";
import {studios,defaults} from "../js/nyvera-data.js";
import {generate} from "../js/nyvera-prompts.js";

const assertUniqueNegative=result=>{
  const terms=result.negative.split(",").map(value=>value.trim().toLowerCase()).filter(Boolean);
  assert.equal(new Set(terms).size,terms.length,`Duplicate negative terms: ${result.negative}`);
};
const assertUnbranded=result=>{
  assert.doesNotMatch(`${result.prompt} ${result.mockupPrompt||""}`,/nyvera/i);
  assert.match(result.prompt,/completely unbranded/i);
  assert.match(result.prompt,/no logos/i);
  assert.match(result.prompt,/no standalone letter N symbols/i);
};

test("Character prompt removes product branding and deduplicates negative guidance",()=>{
  const result=generate(studios.character,"Full Character Builder",{...defaults.character,clothing:"Nyvera Luxury Clothing Line",luxuryOutfit:"Luxury Business Suit",negative:["Avoid Weapons","weapons","Avoid Distorted Hands","distorted hands"]});
  assertUnbranded(result);assertUniqueNegative(result);assert.doesNotMatch(result.prompt,/Luxury Clothing Line/i);
});
test("Kids prompt removes product branding and deduplicates built-in safety negatives",()=>{
  const result=generate(studios.kids,"Kids Character Builder",{...defaults.kids,clothing:"Nyvera Kids Luxury Clothing Line",negative:["Avoid Adult Body Proportions","adult body proportions","Avoid Unsafe Objects","unsafe objects"]});
  assertUnbranded(result);assertUniqueNegative(result);assert.doesNotMatch(result.prompt,/Kids Luxury Clothing Line/i);
});
test("Sticker and mockup prompts are unbranded and contain unique negative terms",()=>{
  const result=generate(studios.sticker,"Product Packaging Prompt Builder",{...defaults.sticker,title:"Nyvera Sticker Box",theme:"Nyvera celebration",productType:"Product Packaging",negative:["Avoid Incorrect Sticker Count","incorrect sticker count","overlapping stickers","Avoid Overlapping Stickers"]});
  assertUnbranded(result);assertUniqueNegative(result);assert.doesNotMatch(result.mockupPrompt,/clear branding/i);assert.match(result.mockupPrompt,/blank, unbranded label area/i);
});
