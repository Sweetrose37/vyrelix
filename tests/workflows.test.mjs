import test from "node:test";
import assert from "node:assert/strict";
import {characterWorkflow,kidsWorkflow,workflowFor,flatWorkflowFields,migrateWorkflowData} from "../js/nyvera-workflows.js";
import {studios,defaults,fieldsFor} from "../js/nyvera-data.js";
import {generate,validate,styledSuggestion} from "../js/nyvera-prompts.js";

const characterTitles=["Foundation","Appearance","Hair and Grooming","Fashion","Accessories and Finishing Touches","Personality and Pose","Scene and Lighting","Creative Direction","Review and Final Details","Generate and Save"];
const kidsTitles=["Child Foundation","Appearance","Hair and Grooming","Clothing","Accessories and Supporting People","Expression, Pose, and Activity","Scene and Lighting","Creative Direction","Review and Final Details","Generate and Save"];

test("Character and Kids expose exactly the required ten steps",()=>{
  assert.deepEqual(characterWorkflow.map(x=>x.title),characterTitles);
  assert.deepEqual(kidsWorkflow.map(x=>x.title),kidsTitles);
  assert.equal(characterWorkflow.length,10);assert.equal(kidsWorkflow.length,10);
});
test("every workflow field has a stable unique id and usable label",()=>{
  for(const workflow of [characterWorkflow,kidsWorkflow]){const fields=flatWorkflowFields(workflow);assert.equal(new Set(fields.map(f=>f.id)).size,fields.length);assert.ok(fields.every(f=>f.id&&f.label));}
});
test("specialized legacy builder fields are preserved in the closest grouped workflow",()=>{
  const old=fieldsFor("kids","Coloring Page Builder"),grouped=workflowFor("kids",old),ids=new Set(flatWorkflowFields(grouped).map(f=>f.id));
  old.forEach(field=>assert.ok(ids.has(field.id),`${field.id} was not mapped`));assert.equal(grouped.length,10);
});
test("old project values migrate without deletion",()=>{
  const old={age:"Adult",grooming:"Soft Glam",unknownLegacyField:"keep me",title:"Saved title"},next=migrateWorkflowData("character",old);
  assert.equal(next.makeup,"Soft Glam");assert.equal(next.unknownLegacyField,"keep me");assert.equal(next.title,"Saved title");
});
test("all grouped selections reach prompt generation cleanly",()=>{
  const character={...defaults.character,title:"Editorial Adult",undertone:"Golden",cheekbones:"High",pattern:"Plaid",activity:"Working",outputFormat:"Portrait"};
  const kids={...defaults.kids,title:"Young Artist",undertone:"Warm",cheeks:"Rosy",pattern:"Stars",activity:"Creating Art",outputFormat:"Square"};
  for(const [studio,data,needles] of [[studios.character,character,["undertone: Golden","pattern: Plaid","activity: Working"]],[studios.kids,kids,["pattern: Stars","activity: Creating Art"]]]){const result=generate(studio,studio.builders[0].name,data);needles.forEach(value=>assert.match(result.prompt,new RegExp(value,"i")));assert.doesNotMatch(`${result.prompt} ${result.negative}`,/undefined|null|NaN|\[object Object\]/);}
});
test("age, hair, safety, and teen-only validation remains enforced",()=>{
  assert.ok(validate(studios.character,{age:"Teen",customDetails:"armor"}).length>=2);
  assert.ok(validate(studios.character,{age:"Adult",hairTexture:"Bald",hairLength:"Waist Length"}).length);
  assert.equal(validate(studios.kids,{age:"Young Child",teenMakeup:"Subtle Mascara"}).length,0);
  assert.equal(validate(studios.kids,{age:"Baby",build:"Tall and Lean"}).length,0);
});
test("Style Me and Surprise-compatible suggestions populate matching workflow fields",()=>{
  const character=styledSuggestion(studios.character,"senior church elegance"),kids=styledSuggestion(studios.kids,"bedtime toddler");
  assert.equal(character.age,"Senior Adult");assert.equal(character.environment,"Church");assert.equal(kids.age,"Toddler");assert.equal(kids.environment,"Bedroom");
});
