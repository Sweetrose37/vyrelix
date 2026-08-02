import test from "node:test";
import assert from "node:assert/strict";
import {mockupTypes,productStatuses,mockupGroups,inheritedMockupForm,stickerCount,inventorySummary,validateMockup,generateMockup,styleMockup,surpriseMockup} from "../js/nyvera-mockups.js";
import {generate,validate} from "../js/nyvera-prompts.js";
import {studios,defaults} from "../js/nyvera-data.js";

const base={...defaults.sticker,title:"Cozy Faith Collection",theme:"cozy faith encouragement",style:"Holographic",finish:"Holographic",count:"12",phraseCount:"4",iconCount:"2",objectCount:"2",decorativeCount:"4",humanCount:"0",customDetails:"Use a respectful book prop"};
const source={prompt:"Create the completed exact sticker artwork with consistent styling.",negative:"duplicate stickers, incorrect sticker count"};

test("mockup library contains the exact unique requested formats and statuses",()=>{
  assert.equal(mockupTypes.length,22);
  assert.equal(new Set(mockupTypes.map(value=>value.toLowerCase().replace(/[^a-z0-9]/g,""))).size,22);
  assert.deepEqual(productStatuses,["Digital Sticker Pack","Printable Sticker Sheet","Physical Sticker Pack","Physical Sticker Sheet","Mockup Presentation Only"]);
  assert.deepEqual(mockupGroups.map(group=>group.title),["Presentation Format","Package and Display","Scene","Branding and Text Areas"]);
});

test("all requested exact totals, including Custom, survive generation",()=>{
  for(const total of [6,12,20,22,24,25,28,29,31,32]){
    const data={...base,count:String(total),phraseCount:String(total),iconCount:"0",objectCount:"0",decorativeCount:"0",humanCount:"0"},form=inheritedMockupForm(data);
    form.arrangement="Show Full Sticker Collection";form.visibleProducts=String(total);
    const result=generateMockup(data,source,form);
    assert.deepEqual(result.errors,[],String(total));
    assert.match(result.prompt,new RegExp(`exact ${total}-piece sticker collection`));
    assert.equal(result.summary.exactCount,total);
  }
  const custom={...base,count:"Custom",phraseCount:"11",iconCount:"7",objectCount:"5",decorativeCount:"4",humanCount:"2"},form=inheritedMockupForm(custom);
  form.arrangement="Show Selected Sample Stickers";form.visibleProducts="6";
  const result=generateMockup(custom,source,form);
  assert.equal(stickerCount(custom),29);assert.match(result.prompt,/exact total of 29 stickers/);
  assert.deepEqual(validate(studios.sticker,custom),[]);
  assert.match(generate(studios.sticker,"Sticker Pack Builder",custom).prompt,/exact 29-piece/);
});

test("every Sticker builder family transfers its finished data into a mockup",()=>{
  const families=["Single Sticker","Sticker Sheet","Sticker Pack","Phrase Sticker Collection","Icon Collection","Object Collection","Digital Planner Stickers","Faith Stickers","Seasonal Stickers","Business Stickers","School Stickers","Lifestyle Stickers","Self-Care Stickers"];
  for(const [index,family] of families.entries()){
    const data={...base,title:family,theme:family,productType:index===0?"Single Sticker":index%2?"Sticker Sheet":"Sticker Pack"},form=inheritedMockupForm(data),result=generateMockup(data,source,form);
    assert.deepEqual(result.errors,[],family);assert.match(result.prompt,new RegExp(family.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i"));assert.match(result.prompt,/completed sticker-art direction/);
  }
});

test("digital, printable, physical, and presentation statuses never conflict",()=>{
  for(const status of productStatuses){const form={...inheritedMockupForm(base),productStatus:status},result=generateMockup(base,source,form);assert.deepEqual(result.errors,[],status);if(/Digital|Printable/.test(status)){assert.match(result.prompt,/no (shipping|delivery)|do not imply pre-cut/i);assert.doesNotMatch(result.prompt,/physical package is included/i)}else if(status==="Mockup Presentation Only")assert.match(result.prompt,/visual presentation concept only/i)}
});

test("sample arrangements distinguish visible samples from the exact total",()=>{
  const form={...inheritedMockupForm({...base,count:"22",phraseCount:"22",decorativeCount:"0"}),arrangement:"Show Selected Sample Stickers",visibleProducts:"5"},result=generateMockup({...base,count:"22",phraseCount:"22",decorativeCount:"0"},source,form);
  assert.match(result.prompt,/exactly 5 sample stickers/);assert.match(result.prompt,/exact total of 22 stickers/);assert.match(result.prompt,/visible samples are not the total/);
});

test("branding is opt-in and Nyvera marks are always absent",()=>{
  const form={...inheritedMockupForm(base),mockupTitle:"Nyvera Product",brandName:"Nyvera",customText:"Nyvera Shop"};
  const unbranded=generateMockup({...base,title:"Nyvera Sticker Pack"},{...source,prompt:"Nyvera source art"},form);
  assert.doesNotMatch(unbranded.prompt,/nyvera/i);assert.match(unbranded.prompt,/completely unbranded/i);
  form.brandingAreas=["Product Title","Brand Name","Custom Text Area"];form.brandName="My Shop";form.customText="Digital Download";
  const branded=generateMockup(base,source,form);assert.match(branded.prompt,/supplied brand name “My Shop”/);assert.match(branded.prompt,/supplied custom text “Digital Download”/);
});

test("mockup negative prompt is deduplicated and protects branding and digital claims",()=>{
  const data={...base,negative:["duplicate stickers","Avoid Logos","logos"],useType:"Digital Download"},form={...inheritedMockupForm(data),productStatus:"Digital Sticker Pack"},result=generateMockup(data,{...source,negative:"incorrect sticker count, duplicate stickers"},form),parts=result.negative.split(",").map(value=>value.trim().toLowerCase());
  assert.equal(new Set(parts).size,parts.length);for(const term of ["incorrect sticker count","missing stickers","warped packaging","fake shipping claims","standalone letter n symbols"])assert.ok(parts.includes(term),term);
});

test("validation blocks missing fields and invalid visible counts",()=>{
  const form={...inheritedMockupForm(base),mockupType:"",productStatus:"",visibleProducts:"99"},errors=validateMockup(base,form);
  assert.ok(errors.length>=3);assert.match(errors.join(" "),/mockup type|product status|cannot exceed/i);
});

test("Style and Surprise preserve status, exact count, theme data, and avoid automatic branding",()=>{
  const form=inheritedMockupForm(base),styled=styleMockup(base,form),first=surpriseMockup(base,form,0),second=surpriseMockup(base,form,1);
  for(const proposal of [styled,first,second]){assert.equal(proposal.productStatus,form.productStatus);assert.equal(proposal.visibleProducts,form.visibleProducts);assert.deepEqual(proposal.brandingAreas,[]);assert.equal(proposal.brandName,"")}
  assert.notEqual(first.mockupType,second.mockupType);
});

test("inventory summary preserves every inherited category",()=>{
  assert.equal(inventorySummary({...base,phraseCount:"6",iconCount:"4",objectCount:"3",decorativeCount:"2",humanCount:"1"}),"6 phrases, 4 icons, 3 objects, 2 decorative designs, 1 human figures");
});
