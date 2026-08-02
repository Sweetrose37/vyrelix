import test from "node:test";
import assert from "node:assert/strict";

const values=new Map();
globalThis.localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
const {store}=await import("../js/nyvera-storage.js");

test("old Sticker projects without mockups remain unchanged until saved",()=>{
  const old={id:"old-1",studio:"sticker",builderType:"Sticker Pack Builder",title:"Old Sticker Pack",formData:{title:"Old Sticker Pack",count:"12"},generatedPrompt:"old prompt",negativePrompt:"old negative"};
  localStorage.setItem("nyvera_sticker_projects",JSON.stringify([old]));
  assert.deepEqual(store.getProject("sticker","old-1"),old);
  assert.equal(store.getProject("sticker","old-1").mockups,undefined);
});

test("saving embeds linked mockup variants without duplicating the sticker project",()=>{
  const old=store.getProject("sticker","old-1"),variant={mockupId:"mock-1",mockupTitle:"Retail Display",formData:{mockupType:"Backing Card Display"},prompt:"mockup prompt",negativePrompt:"mockup negative",favorite:false};
  const saved=store.saveProject({...old,mockupEnabled:true,mockupStatus:"completed",mockups:[variant],mockupFormData:variant.formData,mockupPrompt:variant.prompt,mockupNegativePrompt:variant.negativePrompt});
  assert.equal(store.projects("sticker").length,1);
  assert.equal(saved.mockups.length,1);assert.equal(saved.mockups[0].mockupId,"mock-1");assert.equal(saved.mockupPrompt,"mockup prompt");
});

test("project export data naturally contains sticker and linked mockups together",()=>{
  const saved=store.getProject("sticker","old-1"),json=JSON.parse(JSON.stringify({...saved,type:"nyvera-project"}));
  assert.equal(json.generatedPrompt,"old prompt");assert.equal(json.mockups[0].prompt,"mockup prompt");assert.equal(json.type,"nyvera-project");
});
