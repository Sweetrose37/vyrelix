import test from "node:test";
import assert from "node:assert/strict";
import { studios,defaults,fieldsFor } from "../js/nyvera-data.js";
import { generate,validate,autoBalance } from "../js/nyvera-prompts.js";

test("Nyvera exposes exactly three unique studios",()=>{
  assert.deepEqual(Object.keys(studios),["character","kids","sticker"]);
  assert.equal(new Set(Object.values(studios).map(x=>x.name)).size,3);
});

test("Character Studio age options are adult-only",()=>{
  const age=fieldsFor("character","Full Character Builder").find(x=>x.id==="age");
  assert.ok(age.options.every(value=>!/(baby|toddler|child|tween|teen)/i.test(value)));
  const result=generate(studios.character,"Full Character Builder",defaults.character);
  assert.match(result.prompt,/normal human Adult/i);
  assert.match(result.negative,/children, teenagers, fantasy species/i);
  assert.doesNotMatch(result.prompt,/undefined|null|NaN|\[object Object\]/);
});

test("Kids Studio generation protects age-appropriate human subjects",()=>{
  const result=generate(studios.kids,"Kids Character Builder",defaults.kids);
  assert.match(result.prompt,/wholesome, age-appropriate human young child/i);
  assert.match(result.prompt,/age-appropriate/i);
  assert.match(result.negative,/fantasy elements/i);
  assert.doesNotMatch(result.prompt,/undefined|null|NaN|\[object Object\]/);
});

test("Sticker inventory auto-balances to exact count",()=>{
  const data={...defaults.sticker,count:"24",phraseCount:"6",iconCount:"8",objectCount:"6",decorativeCount:"4",humanCount:"0"};
  assert.deepEqual(validate(studios.sticker,data),[]);
  data.decorativeCount="2";
  assert.match(validate(studios.sticker,data)[0],/must equal/);
  autoBalance(data);
  const total=["phraseCount","iconCount","objectCount","decorativeCount","humanCount"].reduce((n,k)=>n+Number(data[k]),0);
  assert.equal(total,24);
});

test("Sticker prompt preserves exact count and text",()=>{
  const data={...defaults.sticker,count:"12",exactText:"Create. Believe!",phraseCount:"6",decorativeCount:"6"};
  const result=generate(studios.sticker,"Sticker Sheet Builder",data);
  assert.match(result.prompt,/exact 12-piece/);
  assert.match(result.prompt,/Create\. Believe!/);
  assert.match(result.negative,/incorrect sticker count/);
});

test("Every dashboard builder has an id and fields",()=>{
  for(const studio of Object.values(studios))for(const builder of studio.builders){
    assert.ok(builder.id,`${builder.name} lacks an id`);
    assert.ok(fieldsFor(studio.id,builder.name).length>0,`${builder.name} lacks fields`);
  }
});
