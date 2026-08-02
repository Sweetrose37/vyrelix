import test from "node:test";
import assert from "node:assert/strict";
import {kidsProductCategories,kidsProducts,productDuplicateReport,productClassifications,productByName,productAgeCompatibility,kidsProductStages,tradingCardFields,inheritKidsProductForm,validateKidsProductV2 as validateKidsProduct,generateKidsProductV2 as generateKidsProduct,styleKidsProductV2 as styleKidsProduct,surpriseKidsProductV2 as surpriseKidsProduct} from "../js/nyvera-kids-products.js";

const source={title:"Maya's Big Day",age:"Young Child",presentation:"Girl",role:"Young Reader",skin:"Warm Brown",face:"Round",eyes:"Almond",eyeColor:"Dark Brown",hairStyle:"Two Puffs",hairColor:"Black",outfit:"Yellow cardigan and blue skirt",shoes:"Blue Sneakers",accessories:["Backpack"],supportingPeople:["Teacher"],pose:"School Portrait Pose",activity:"Reading",environment:"Cheerful Classroom",lighting:"Soft Daylight",composition:"Full Body",quality:"Commercial quality",outputFormat:"Portrait PNG",theme:"learning adventure",artStyle:"Polished storybook illustration",build:"Child Proportions",expression:"Curious",palette:"Berry Pink, Lilac, Sky Blue, and Lemon",customDetails:"Keep her freckles and yellow hair bows"};
const project={id:"kids-1",title:"Maya's Big Day",builderType:"Kids Character Builder"};
const result={prompt:"A finished human child character in a cheerful classroom.",negative:"duplicate characters, weapons"};
const formFor=name=>{const product=productByName(name),form=inheritKidsProductForm(source,product);if(form.sides==="Front and Back")form.backText="You can do wonderful things!";return {product,form}};

test("catalog contains all 126 unique requested products in eight categories",()=>{
  assert.equal(Object.keys(kidsProductCategories).length,8);
  assert.equal(kidsProducts.length,126);
  assert.equal(productDuplicateReport.length,0);
  assert.equal(new Set(kidsProducts.map(item=>item.name.toLowerCase().replace(/[^a-z0-9]/g,""))).size,126);
  for(const name of ["Character Trading Card","Double-Sided Character Trading Card","Children’s Book Cover","Composition Notebook Cover","Coloring Page","Birthday Invitation","Kids Wall Art","Phone Wallpaper","Doll Box Mockup","Etsy Listing Mockup"])assert.ok(productByName(name),name);
});

test("product builder remains a maximum of three stages with conditional trading controls",()=>{
  assert.deepEqual(kidsProductStages.map(stage=>stage.title),["Stage 1 — Product Format","Stage 2 — Design and Content","Stage 3 — Visual Presentation"]);
  assert.ok(tradingCardFields.some(field=>field.id==="frontContent"));
  assert.ok(tradingCardFields.some(field=>field.id==="backContent"));
  assert.ok(tradingCardFields.some(field=>field.id==="positiveTraits"));
});

test("every completed Kids builder family can become a linked product",()=>{
  const builders=["Kids Character Builder","Baby Character Builder","Toddler Character Builder","School Character Builder","Teen Character Builder","Family Scene Builder","Classroom Scene Builder","Children’s Book Builder","Story Scene Builder","Coloring Page Builder","Activity Sheet Builder","Educational Printable Builder","School Supply Design Builder","Kids Wallpaper Builder","Affirmation Card Builder","Bookmark Builder","Kids Product Mockup Builder"];
  for(const [index,builderType] of builders.entries()){
    const name=index%3===0?"Character Trading Card":index%3===1?"Children’s Book Cover":"Educational Flashcards",{product,form}=formFor(name),generated=generateKidsProduct({...project,builderType},source,result,product,form);
    assert.deepEqual(generated.errors,[],builderType);assert.match(generated.prompt,/Preserve the child’s identity/);assert.match(generated.prompt,/completed Kids project/i);
  }
});

test("trading cards generate coordinated front and back without combat mechanics",()=>{
  const {product,form}=formFor("Double-Sided Character Trading Card");form.positiveTraits=["Creativity","Kindness","Problem Solving"];form.frontContent=["Character Name","Character Portrait","Card Number"];form.backContent=["Short Character Bio","Strengths","Encouraging Message"];const generated=generateKidsProduct(project,source,result,product,form);
  assert.deepEqual(generated.errors,[]);assert.match(generated.prompt,/coordinated front and back/i);assert.match(generated.prompt,/character name, character portrait, card number/i);assert.match(generated.prompt,/short character bio, strengths, encouraging message/i);assert.match(generated.prompt,/Creativity, Kindness, Problem Solving/);assert.match(generated.prompt,/Never use battle stats, weapons, attack power, combat ratings/i);assert.doesNotMatch(generated.negative,/battle stats|attack power/);
});

test("product prompt explicitly carries all available source-project direction",()=>{
  const {product,form}=formFor("Character Trading Card"),generated=generateKidsProduct(project,source,result,product,form);
  for(const detail of ["Girl","Young Reader","Almond","Blue Sneakers","Teacher","school picture","Reading","Cheerful Classroom","Soft Daylight","Full Body","Commercial quality","Portrait PNG","learning adventure"])assert.match(generated.prompt,new RegExp(detail,"i"),detail);
});

test("trading-card No Visible Text conflicts only with selected front text sections",()=>{
  const {product,form}=formFor("Character Trading Card");form.frontContent=["Character Portrait","No Visible Text"];assert.deepEqual(validateKidsProduct(source,product,form),[]);form.frontContent.push("Character Name");assert.match(validateKidsProduct(source,product,form).join(" "),/card front conflicts/i);
});

test("front-only no-text cards suppress inherited placeholder text",()=>{
  const {product,form}=formFor("Character Trading Card");form.frontContent=["Character Portrait","No Visible Text"];const generated=generateKidsProduct(project,source,result,product,form);assert.deepEqual(generated.errors,[]);assert.match(generated.prompt,/Place no visible text anywhere/);assert.doesNotMatch(generated.prompt,/\[CHILD NAME\]|\[SCHOOL NAME\]/);
});

test("card number and collection name render only when their sections are selected",()=>{
  const {product,form}=formFor("Character Trading Card");form.cardNumber="007";form.collectionName="Young Readers";let errors=validateKidsProduct(source,product,form).join(" ");assert.match(errors,/Select Card Number/);assert.match(errors,/Select Collection Name/);form.frontContent.push("Card Number","Collection Name");const generated=generateKidsProduct(project,source,result,product,form);assert.deepEqual(generated.errors,[]);assert.match(generated.prompt,/card number: .*007/i);assert.match(generated.prompt,/collection name: .*Young Readers/i);
});

test("exact user text is preserved while Nyvera branding remains excluded",()=>{
  const {product,form}=formFor("Character Achievement Card");form.exactPhrase="Maya's A+ Day — Keep Shining!";form.educationalText="2 + 2 = 4; Read, Think, Grow.";form.brandingArea="Nyvera Family Learning";const generated=generateKidsProduct(project,source,result,product,form);
  assert.match(generated.prompt,/Maya's A\+ Day — Keep Shining!/);assert.match(generated.prompt,/2 \+ 2 = 4; Read, Think, Grow\./);assert.doesNotMatch(generated.prompt,/Nyvera/i);
  const unbranded=generateKidsProduct({...project,title:"Nyvera Kids Studio Project"},{...source,title:"Nyvera Child"},{prompt:"Nyvera source",negative:""},product,{...form,exactPhrase:"",educationalText:"",brandingArea:"",logoPlaceholder:""});assert.doesNotMatch(unbranded.prompt,/Nyvera/i);assert.match(unbranded.prompt,/completely unbranded/i);
});

test("No Visible Text is honored and conflicting entered text is blocked",()=>{
  const {product,form}=formFor("Kids Wall Art");form.textMode="No Visible Text";form.childName="";form.schoolName="";const generated=generateKidsProduct(project,source,result,product,form);assert.match(generated.prompt,/Place no visible text anywhere/);
  form.exactPhrase="Hello";assert.match(validateKidsProduct(source,product,form).join(" "),/conflicts/i);
});

test("all four classifications produce accurate fulfillment language",()=>{
  assert.deepEqual(productClassifications,["Digital Download","Printable Product","Physical Product Design","Product Mockup Only"]);
  const {product,form}=formFor("Custom Product Mockup");
  for(const classification of productClassifications){const generated=generateKidsProduct(project,source,result,product,{...form,classification});assert.deepEqual(generated.errors,[]);if(classification==="Digital Download")assert.match(generated.prompt,/digital download/i);if(classification==="Printable Product")assert.match(generated.prompt,/printable file/i);if(classification==="Physical Product Design")assert.match(generated.prompt,/without fulfillment or shipping promises/i);if(classification==="Product Mockup Only")assert.match(generated.prompt,/presentation mockup only/i)}
});

test("age compatibility warns but does not remove formats",()=>{
  const product=productByName("Graduation Keepsake Card"),status=productAgeCompatibility(product,"Baby");assert.equal(status.level,"warning");assert.match(status.message,/available/i);assert.ok(kidsProducts.includes(product));
});

test("Style and Surprise keep source identity and return complete, non-repeating compatible proposals",()=>{
  const {product,form}=formFor("Character Trading Card"),styled=styleKidsProduct(source,product,form),first=surpriseKidsProduct(source,product,form,0),second=surpriseKidsProduct(source,product,form,1);
  assert.equal(styled.productId,form.productId);assert.equal(styled.quantityMode,"Single Product");assert.ok(styled.frontContent.length);assert.ok(styled.positiveTraits.length);assert.ok(styled.customVisualDetails);assert.equal(first.form.productId,form.productId);assert.equal(second.form.productId,form.productId);assert.ok(first.product.ages.includes(source.age));assert.ok(second.product.ages.includes(source.age));assert.notEqual(first.product.name,second.product.name);
});

test("negative prompt is deduplicated and protects child safety and branding",()=>{
  const {product,form}=formFor("Character Trading Card"),generated=generateKidsProduct(project,{...source,negative:["weapons","adult body proportions"]},{...result,negative:"weapons, logos"},product,form),parts=generated.negative.split(",").map(item=>item.trim().toLowerCase());assert.equal(new Set(parts).size,parts.length);for(const term of ["incorrect age group","weapons","logos","standalone letter n symbols","duplicate characters","incorrect item count"])assert.ok(parts.includes(term),term);assert.doesNotMatch(generated.negative,/adult body proportions|adult glamour|revealing clothing|sexualized child/i);
});
