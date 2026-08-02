import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const values=new Map();
globalThis.localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
const unveiled=await import("../js/nyvera-unveiled.js");
const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8"),css=fs.readFileSync(new URL("../css/unveiled.css",import.meta.url),"utf8"),html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8"),sw=fs.readFileSync(new URL("../service-worker.js",import.meta.url),"utf8"),build=fs.readFileSync(new URL("../scripts/build.ps1",import.meta.url),"utf8");

test("shared engine maps exactly the four supported reveal themes",()=>{
  assert.equal(unveiled.revealThemeFor({sourceStudio:"sticker",productType:"Holographic Package"}),"sticker");
  assert.equal(unveiled.revealThemeFor({sourceStudio:"kids",productType:"Double-Sided Character Trading Card"}),"kids-card");
  assert.equal(unveiled.revealThemeFor({sourceStudio:"character",productType:"Luxury Editorial"}),"editorial");
  assert.equal(unveiled.revealThemeFor({sourceStudio:"kids",productType:"Children’s Book Cover"}),"book");
  assert.equal(unveiled.revealThemeFor({sourceStudio:"character",productType:"Business Card"}),"");
});

test("Sticker reveal preserves exact custom counts and honest preview language",()=>{for(const count of [6,12,22,24,32,47]){const config=unveiled.buildRevealConfig({sourceStudio:"sticker",productType:"Professional Sticker Pack",productTitle:"Joyful Collection",exactItemCount:count});assert.equal(config.exactItemCount,count);const card=unveiled.unveiledEntryCard(config,{enabled:true,autoOffer:true,defaultSkip:false});assert.match(card,/Nyvera Unveiled™/);assert.doesNotMatch(card,/Final Image|Finished Artwork|Generated Design|Completed Product/)}});

test("Kids card reveal removes mature and combat traits",()=>{const config=unveiled.buildRevealConfig({sourceStudio:"kids",productType:"Sports Trading Card",productTitle:"Ari’s Card",positiveTraits:["Kindness","Problem Solving","Attack Power","Adult Glamour"]});assert.deepEqual(config.positiveTraits,["Kindness","Problem Solving"]);assert.equal(config.revealMessage,"Your Character Card Has Been Unveiled")});

test("all theme messages and placeholder structures are present without fabricated artwork",()=>{for(const text of ["Your Sticker Collection Has Been Unveiled","Your Character Card Has Been Unveiled","Your Editorial Vision Has Been Unveiled","Your Story Has Been Unveiled","This interactive preview presents your selected product details. Final artwork is created from the generated prompt.","unveiled-sticker-pack","unveiled-card-pack","unveiled-editorial","unveiled-book"])assert.match(fs.readFileSync(new URL("../js/nyvera-unveiled.js",import.meta.url),"utf8"),new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")))});

test("card reveal uses a physical pack, staged portrait, material gloss, depth, and cinematic motion",()=>{const source=fs.readFileSync(new URL("../js/nyvera-unveiled.js",import.meta.url),"utf8");for(const text of ["unveiled-card-packaging","unveiled-pack-flap","unveiled-card-shadow","unveiled-card-gloss","unveiled-card-portrait","Lifting your product into the light"])assert.match(source,new RegExp(text));for(const text of ["perspective:1200px","unveiled-card-gloss","unveiled-camera-focus","drop-shadow","rotateX","translate3d"])assert.match(css,new RegExp(text))});

test("entry, skip, surprise, direct generation, and real final-prompt callback are wired",()=>{for(const text of ["revealEntry()","open-unveiled","skip-unveiled","surprise-unveiled","disable-unveiled","Create Final Prompt Without Reveal","onContinue=state.route.endsWith","finishMockupGeneration","finishKidsProductGeneration","finishAdultProductGeneration"])assert.match(app,new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")))});

test("settings store one preference system and provide reset controls",()=>{values.clear();assert.deepEqual(unveiled.unveiledPreferences(),unveiled.UNVEILED_DEFAULTS);unveiled.saveUnveiledPreferences({enabled:false,sound:true,reducedMotion:true});assert.equal(unveiled.unveiledPreferences().enabled,false);assert.equal(unveiled.unveiledPreferences().sound,true);assert.equal(unveiled.unveiledPreferences().reducedMotion,true);unveiled.resetUnveiledPreferences();assert.deepEqual(unveiled.unveiledPreferences(),unveiled.UNVEILED_DEFAULTS);for(const text of ["Enable Nyvera Unveiled","Play Reveal Sounds","Automatically Offer Reveal","Reduced Motion for Reveals","Default to Skip","Reset Reveal Preferences"])assert.match(app,new RegExp(text))});

test("overlay is accessible, reduced-motion safe, mobile-contained, and leaves radio playback untouched",()=>{const source=fs.readFileSync(new URL("../js/nyvera-unveiled.js",import.meta.url),"utf8");for(const text of ['role="dialog"','aria-modal="true"','aria-live="polite"','data-unveiled-close','event.key==="Escape"','event.key!=="Tab"','prefers-reduced-motion'])assert.match(`${source}\n${css}`,new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")));assert.match(css,/@media\(max-width:600px\)/);assert.match(css,/width:100%;height:100dvh/);assert.match(css,/overflow-wrap:anywhere/);assert.doesNotMatch(source,/radio-audio[^\n;]*\.pause\(/)});

test("production package and cache include Unveiled and permit the official iHeart frame",()=>{for(const text of ["css\\unveiled.css","js\\nyvera-unveiled.js"])assert.match(build,new RegExp(text.replace(/\\/g,"\\\\")));assert.match(html,/unveiled\.css\?v=1\.1\.0/);assert.match(html,/app\.js\?v=1\.19\.0/);assert.match(html,/frame-src https:\/\/www\.iheart\.com/);assert.match(sw,/v1\.19\.0-persistent-iheart-reveal/);assert.match(sw,/nyvera-unveiled\.js\?v=1\.1\.0/)});
