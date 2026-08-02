import test from "node:test";
import assert from "node:assert/strict";

const values=new Map();
globalThis.localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
const {store}=await import("../js/nyvera-storage.js");

test("old Kids projects without product fields remain readable until saved",()=>{
  const old={id:"old-kids-1",studio:"kids",builderType:"Kids Character Builder",title:"Old Kids Project",formData:{title:"Old Kids Project",age:"Young Child"},generatedPrompt:"old prompt",negativePrompt:"old negative"};localStorage.setItem("nyvera_kids_projects",JSON.stringify([old]));assert.deepEqual(store.getProject("kids","old-kids-1"),old);assert.equal(store.getProject("kids","old-kids-1").products,undefined);
});

test("saving embeds multiple linked product variants without duplicating the source project",()=>{
  const old=store.getProject("kids","old-kids-1"),products=[{productId:"p-1",productTitle:"Maya Card",productType:"Character Trading Card",formData:{},prompt:"card prompt",negativePrompt:"card negative",favorite:false},{productId:"p-2",productTitle:"Maya Book",productType:"Children’s Book Cover",formData:{},prompt:"book prompt",negativePrompt:"book negative",favorite:true}],saved=store.saveProject({...old,productEnabled:true,productStatus:"completed",productType:products[1].productType,productFormData:products[1].formData,productPrompt:products[1].prompt,productNegativePrompt:products[1].negativePrompt,linkedProductIds:products.map(item=>item.productId),products});assert.equal(store.projects("kids").length,1);assert.equal(saved.products.length,2);assert.deepEqual(saved.linkedProductIds,["p-1","p-2"]);assert.equal(saved.productPrompt,"book prompt");
});

test("project export data contains the source and linked products together",()=>{
  const saved=store.getProject("kids","old-kids-1"),json=JSON.parse(JSON.stringify({...saved,type:"nyvera-project"}));assert.equal(json.generatedPrompt,"old prompt");assert.equal(json.products[0].prompt,"card prompt");assert.equal(json.type,"nyvera-project");
});
