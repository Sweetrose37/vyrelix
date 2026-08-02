import test from "node:test";
import assert from "node:assert/strict";
import {studios,defaults,fieldsFor} from "../js/nyvera-data.js";
import {generate,styledSuggestion} from "../js/nyvera-prompts.js";
import {kidsWorkflow,flatWorkflowFields,workflowFor} from "../js/nyvera-workflows.js";
import {kidsSensitiveOutputPattern,kidsSafeNegative,normalizeKidsSource} from "../js/nyvera-kids-safety.js";
import {productByName,inheritKidsProductForm,generateKidsProduct,generateKidsProductV2} from "../js/nyvera-kids-products.js";

const forbidden=/sexualized child|revealing clothing|adult glamour|fitted for age|adult body proportions|full lips|cheekbone emphasis|sculpted jawline|fashion-model|soft glam|full glam|long acrylic/i;

test("all seven Kids ages generate wholesome age-specific foundations",()=>{
 for(const age of ["Baby","Toddler","Preschool Child","Young Child","Older Child","Tween","Teen"]){
  for(const presentation of ["Girl","Boy","Nonbinary Child"]){
   const result=generate(studios.kids,"Kids Character Builder",{...defaults.kids,age,presentation});
   assert.match(result.prompt,new RegExp(age,"i"),age);
   assert.match(result.prompt,/wholesome|cheerful/i);
   assert.doesNotMatch(result.prompt,kidsSensitiveOutputPattern);
   assert.doesNotMatch(result.negative,forbidden);
  }
 }
});

test("legacy Kids values remain readable but are hidden and normalized",()=>{
 const old={...defaults.kids,build:"Curvy",cheeks:"Cheekbone Emphasis",lips:"Full Lips",teenMakeup:"Soft Glam",nails:"Long Acrylic Nails",fit:"Fitted for Age",pose:"Fashion Pose",clothing:"Nyvera Kids Luxury Clothing Line",negative:["adult body proportions","adult glamour","revealing clothing"]};
 const snapshot=structuredClone(old),normalized=normalizeKidsSource(old),result=generate(studios.kids,"Kids Character Builder",old);
 assert.deepEqual(old,snapshot);
 assert.equal(normalized.cheeks,undefined);assert.equal(normalized.lips,undefined);
 assert.doesNotMatch(`${result.prompt} ${result.negative}`,forbidden);
 assert.doesNotMatch(result.prompt,/nyvera/i);
 assert.match(result.prompt,/natural age-appropriate proportions/i);
});

test("Kids UI exposes no retired body, beauty, glamour, or modeling choices",()=>{
 const fields=flatWorkflowFields(kidsWorkflow),ids=new Set(fields.map(field=>field.id)),visible=fields.flatMap(field=>[field.label,...(field.options||[])]).join(" | ");
 for(const id of ["body","bodyType","cheeks","cheekbones","jawline","lips","lipShape","lipFullness","lipFinish"])assert.equal(ids.has(id),false,id);
 assert.doesNotMatch(visible,/soft glam|full glam|adult glamour|long acrylic|fitted for age|fashion pose|red carpet pose|editorial body pose|full lips|cheekbone emphasis|sculpted jawline/i);
});

test("every Kids builder hides legacy adult-style definition controls",()=>{
 const retired=["height","build","body","bodyType","undertone","cheeks","cheekbones","jawline","lips","lipShape","lipFullness","lipFinish","nose","lashes","brows","facialFeatures"];
 for(const builder of studios.kids.builders){const ids=new Set(flatWorkflowFields(workflowFor("kids",fieldsFor("kids",builder.name))).map(field=>field.id));for(const id of retired)assert.equal(ids.has(id),false,`${builder.name}: ${id}`)}
});

test("every Kids builder normalizes legacy adult-style data before prompt output",()=>{
 const unsafe={...defaults.kids,build:"Curvy",undertone:"Warm",cheeks:"Defined",jawline:"Sculpted Jawline",lips:"Full Lips",lashes:"Dramatic",teenMakeup:"Soft Glam",nails:"Long Acrylic Nails",fit:"Fitted for Age",pose:"Fashion Pose"};
 for(const builder of studios.kids.builders){const result=generate(studios.kids,builder.name,unsafe);assert.doesNotMatch(`${result.prompt} ${result.negative}`,forbidden,builder.name);assert.doesNotMatch(result.prompt,/undertone|jawline|lashes|body type|curvy|slim|petite|stocky/i,builder.name)}
});

test("Kids templates and Style suggestions generate safe unbranded prompts",()=>{
 for(const concept of studios.kids.templates){const data={...defaults.kids,...styledSuggestion(studios.kids,concept)},result=generate(studios.kids,"Kids Character Builder",data);assert.doesNotMatch(`${result.prompt} ${result.negative}`,forbidden,concept);assert.doesNotMatch(result.prompt,/nyvera/i,concept)}
});

test("Kids linked products rebuild safe context without repeating an unsafe source prompt",()=>{
 const source={...defaults.kids,title:"Safe School Project",age:"Tween",build:"Curvy",teenMakeup:"Soft Glam",fit:"Fitted for Age",pose:"Fashion Pose",customDetails:"Nyvera logo"},product=productByName("Character Trading Card"),form=inheritKidsProductForm(source,product),raw="RAW SOURCE SENTINEL sexualized child revealing clothing adult glamour";
 const result=generateKidsProductV2({title:source.title,builderType:"Kids Character Builder"},source,{prompt:raw,negative:"adult body proportions, revealing clothing"},product,form);
 assert.deepEqual(result.errors,[]);assert.match(result.prompt,/Maintain the selected Tween age group exactly/);assert.doesNotMatch(result.prompt,/RAW SOURCE SENTINEL|nyvera/i);assert.doesNotMatch(`${result.prompt} ${result.negative}`,forbidden);assert.match(result.negative,/incorrect age group/);
});

test("the legacy Kids product export is routed through the same safety layer",()=>{
 const source={...defaults.kids,title:"Old Project",build:"Curvy",teenMakeup:"Soft Glam"},product=productByName("Kids Wall Art"),form=inheritKidsProductForm(source,product),result=generateKidsProduct({title:source.title,builderType:"Kids Character Builder"},source,{prompt:"RAW LEGACY PROMPT adult glamour",negative:"revealing clothing"},product,form);
 assert.doesNotMatch(`${result.prompt} ${result.negative}`,/RAW LEGACY PROMPT|adult glamour|revealing clothing|nyvera/i);
});

test("Kids technical negative prompt is concise, unique, and uses safe terms",()=>{
 const negative=kidsSafeNegative("adult body proportions, adult glamour, revealing clothing, weapons, weapons"),parts=negative.split(",").map(value=>value.trim().toLowerCase());
 assert.equal(parts.length,new Set(parts).size);assert.doesNotMatch(negative,forbidden);for(const term of ["incorrect age group","mature styling","weapons","logos","incorrect item count"])assert.ok(parts.includes(term),term);
});
