import test from "node:test";
import assert from "node:assert/strict";
import {addUniqueOptions,contentLibraries,flattenGroups,isOptionAgeCompatible,normalizeOption} from "../js/nyvera-content.js";
import {characterWorkflow,kidsWorkflow,expansionReport,flatWorkflowFields,workflowFor} from "../js/nyvera-workflows.js";
import {studios,defaults} from "../js/nyvera-data.js";
import {generate,styledSuggestion} from "../js/nyvera-prompts.js";

const libraryFields=workflow=>flatWorkflowFields(workflow).filter(field=>field.optionGroups);
const totals=report=>Object.values(report).reduce((sum,item)=>sum+item.added,0);
const rejections=report=>Object.values(report).flatMap(item=>item.rejected);

test("Adult and Kids receive the complete measured expansion while Sticker stays outside it",()=>{
  assert.equal(totals(expansionReport.character),467);
  assert.equal(totals(expansionReport.kids),396);
  assert.equal(totals(expansionReport.character)+totals(expansionReport.kids),863);
  assert.equal(rejections(expansionReport.character).length,2);
  assert.equal(rejections(expansionReport.kids).length,0);
  assert.equal(workflowFor("sticker"),null);
  assert.equal(contentLibraries.sticker,undefined);
});

test("expanded fields expose searchable category groups with no normalized duplicates",()=>{
  for(const field of [...libraryFields(characterWorkflow),...libraryFields(kidsWorkflow)]){
    assert.equal(field.searchable,true);
    assert.ok(Object.keys(field.optionGroups).length>1,field.id);
    const keys=field.options.map(normalizeOption);
    assert.equal(new Set(keys).size,keys.length,`${field.id} contains a normalized duplicate`);
    assert.equal(addUniqueOptions([],field.options,"test").rejected.length,0,`${field.id} contains a semantic duplicate`);
  }
});

test("duplicate utility handles strings, objects, punctuation, plurals, synonyms, and reversed phrases",()=>{
  const result=addUniqueOptions(
    ["Hands on Hips",{label:"Premium Linen Suit"},"Happy", "Gold Watch"],
    ["Both Hands-on-Hips",{label:"Linen Suits"},"Cheerful!","Watch, Gold","Distinct New Choice"],
    "utility-test"
  );
  assert.deepEqual(result.rejected,["Both Hands-on-Hips","Linen Suits","Cheerful!","Watch, Gold"]);
  assert.deepEqual(result.additions,["Distinct New Choice"]);
});

test("representative requested categories are present",()=>{
  const adult=Object.fromEntries(libraryFields(characterWorkflow).map(field=>[field.id,new Set(field.options)]));
  const kids=Object.fromEntries(libraryFields(kidsWorkflow).map(field=>[field.id,new Set(field.options)]));
  for(const [field,choices] of Object.entries({environment:["Executive Boardroom","Church Sanctuary","Airport Lounge"],pose:["Runway Walk","Presenting at a Screen"],expression:["Calm Authority","Prayerful"],hairStyle:["Goddess Braids","Sisterlocks"],outfit:["Tailored Midi Dress","Monochrome Tracksuit"],luxuryOutfit:["Sculpted Blazer Suit","Pearl-Trim Modest Dress"]}))choices.forEach(choice=>assert.ok(adult[field].has(choice),choice));
  for(const [field,choices] of Object.entries({environment:["Family Reading Room","Robotics Club","Soccer Field"],pose:["Baby Tummy-Time Pose","Presenting Science Project"],expression:["Ready to Learn","Sports Celebration"],hairStyle:["Double Baby Puffs","Teen Loc Bob"],outfit:["Cotton Romper","Cardigan School Uniform"],luxuryOutfit:["Luxury Picture-Day Look","Tailored Youth Suit"]}))choices.forEach(choice=>assert.ok(kids[field].has(choice),choice));
});

test("age rules prevent Baby, Toddler, Tween, and Teen mismatches",()=>{
  assert.equal(isOptionAgeCompatible("Teen Layered Curls","Baby"),false);
  assert.equal(isOptionAgeCompatible("Kindergarten Classroom","Toddler"),false);
  assert.equal(isOptionAgeCompatible("Baby Tummy-Time Pose","Tween"),false);
  assert.equal(isOptionAgeCompatible("High School Classroom","Tween"),false);
  assert.equal(isOptionAgeCompatible("Teen Layered Curls","Teen"),true);
  assert.equal(isOptionAgeCompatible("Cotton T-Shirt","Baby"),true);
});

test("Style Me suggestions use valid expanded choices and remain age compatible",()=>{
  for(const concept of ["Cozy winter baby","Bedtime toddler","Tween creative","Teen future leader"]){
    const suggestion=styledSuggestion(studios.kids,concept);
    for(const key of ["environment","pose","expression","hairStyle","outfit","luxuryOutfit"].filter(key=>suggestion[key])){
      const all=new Set([...flattenGroups(contentLibraries.kids[key]||{}),...flatWorkflowFields(kidsWorkflow).find(field=>field.id===key).optionGroups["Current Options"]]);
      assert.ok(all.has(suggestion[key]),`${key}: ${suggestion[key]}`);
      assert.equal(isOptionAgeCompatible(suggestion[key],suggestion.age),true,`${suggestion.age}: ${suggestion[key]}`);
    }
  }
});

test("generated Adult and Kids prompts are natural, unbranded, and descriptor-safe",()=>{
  const adult=generate(studios.character,"Full Character Builder",{...defaults.character,presentation:"Woman",pose:"Portrait Pose",expression:"Calm Expression",accessories:["Watch","watch"],clothing:"Nyvera Luxury Clothing Line"});
  const kids=generate(studios.kids,"Kids Character Builder",{...defaults.kids,presentation:"Girl",pose:"School Portrait Pose",expression:"Joyful Expression",clothing:"Nyvera Kids Luxury Clothing Line"});
  for(const result of [adult,kids]){
    assert.doesNotMatch(result.prompt,/\bwith a (Woman|Girl)\b/i);
    assert.doesNotMatch(result.prompt,/\b(pose|expression)\s+\1\b/i);
    assert.doesNotMatch(result.prompt,/nyvera/i);
    assert.doesNotMatch(result.prompt,/\bCustom\./i);
  }
  assert.equal((adult.prompt.match(/\bwatch\b/gi)||[]).length,1);
});
