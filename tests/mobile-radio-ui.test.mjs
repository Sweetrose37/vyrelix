import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url);

test("the app keeps exactly one persistent audio element",async()=>{
  const html=await readFile(new URL("index.html",root),"utf8");
  assert.equal((html.match(/<audio\b/g)||[]).length,1);
  assert.match(html,/id="nyvera-radio-audio"\s+preload="none"/);
});

test("the persistent radio bar is hidden without removing the header radio access",async()=>{
  const html=await readFile(new URL("index.html",root),"utf8");
  const css=await readFile(new URL("css/radio.css",root),"utf8");
  assert.match(html,/class="icon-button radio-launch"/);
  assert.match(html,/radio\.css\?v=1\.16\.0/);
  assert.match(css,/\.radio-mini\{display:none!important/);
  assert.match(css,/\.radio-is-enabled \.app-shell\{padding-bottom:calc\(88px \+ var\(--safe-bottom\)\)\}/);
});

test("direct Play stays inside the click-triggered path without a delayed call",async()=>{
  const source=await readFile(new URL("js/radio.js",root),"utf8");
  const start=source.slice(source.indexOf("function startPlayback"),source.indexOf("function play("));
  assert.match(start,/audio\.play\(\)/);
  assert.doesNotMatch(start,/await\s+resolveStream|setTimeout\([^)]*audio\.play/);
  assert.match(source,/root\.addEventListener\("click"/);
  assert.doesNotMatch(source,/touchstart|touchend/);
});

test("mobile welcome wording uses a safe inset without changing the hero card",async()=>{
  const css=await readFile(new URL("css/nyvera.css",root),"utf8");
  const html=await readFile(new URL("index.html",root),"utf8");
  assert.match(css,/@media\(max-width:600px\)\{\.hero\.studio-welcome>\.eyebrow,\.hero\.studio-welcome>\.display-title\{[^}]*width:calc\(100% - 3rem\)[^}]*max-width:calc\(100% - 3rem\)[^}]*margin-inline:1\.5rem[^}]*padding-inline:0/);
  assert.match(css,/@media\(max-width:760px\)\{section\.hero\.studio-welcome>h1\.display-title\{[^}]*margin-left:2\.5rem!important[^}]*margin-right:1\.25rem!important/);
  assert.match(css,/@media\(max-width:760px\)\{section\.hero\.studio-welcome>p\.eyebrow\{[^}]*width:calc\(100% - 2rem\)!important[^}]*text-align:left!important[^}]*transform:translateX\(2rem\)!important/);
  assert.match(html,/nyvera\.css\?v=1\.14\.0/);
  assert.match(html,/js\/app\.js\?v=1\.18\.0/);
  assert.match(html,/js\/radio\.js\?v=1\.16\.0/);
  assert.match(css,/@media\(max-width:360px\)\{\.hero\.studio-welcome>\.eyebrow\{letter-spacing:\.07em/);
});

test("service worker bypasses external audio and uses the mobile-radio cache",async()=>{
  const source=await readFile(new URL("service-worker.js",root),"utf8");
  assert.match(source,/nyvera-app-shell-v1\.18\.0-install-iheart/);
  assert.match(source,/\["style","script"\]\.includes\(event\.request\.destination\)/);
  assert.match(source,/new URL\(event\.request\.url\)\.origin!==self\.location\.origin/);
});

test("iHeartRadio uses the official responsive web widget with mobile-safe controls",async()=>{
  const source=await readFile(new URL("js/radio.js",root),"utf8"),css=await readFile(new URL("css/radio.css",root),"utf8");
  for(const text of ["iHeartRadio","data-iheart-directory","data-iheart-form","iheartEmbedUrl","iheartStationPageUrl","data-iheart-open-station","allow=\"autoplay; encrypted-media\""])assert.match(source,new RegExp(text));
  assert.match(css,/\.iheart-radio__player\{[^}]*width:100%[^}]*height:200px/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/\.iheart-radio__intro\{align-items:flex-start;flex-direction:column\}/);
});

test("mobile radio launcher remains actionable and re-enables the browser",async()=>{
  const source=await readFile(new URL("js/radio.js",root),"utf8"),css=await readFile(new URL("css/radio.css",root),"utf8");
  assert.match(source,/function openBrowser\(\)\{if\(!settings\.enabled\)saveSettings\(\{enabled:true\}\)/);
  assert.match(source,/if\(el\.matches\("\[data-radio-open\]"\)\)openBrowser\(\)/);
  assert.match(css,/@media\(max-width:760px\)\{\.radio-launch\{display:grid!important;visibility:visible!important;pointer-events:auto!important\}/);
  assert.match(css,/\.radio-browser\{z-index:1000/);
});
