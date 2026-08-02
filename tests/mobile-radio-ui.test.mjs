import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url);

test("the app keeps exactly one persistent audio element",async()=>{
  const html=await readFile(new URL("index.html",root),"utf8");
  assert.equal((html.match(/<audio\b/g)||[]).length,1);
  assert.match(html,/id="nyvera-radio-audio"\s+preload="none"/);
});

test("direct Play stays inside the click-triggered path without a delayed call",async()=>{
  const source=await readFile(new URL("js/radio.js",root),"utf8");
  const start=source.slice(source.indexOf("function startPlayback"),source.indexOf("function play("));
  assert.match(start,/audio\.play\(\)/);
  assert.doesNotMatch(start,/await\s+resolveStream|setTimeout\([^)]*audio\.play/);
  assert.match(source,/root\.addEventListener\("click"/);
  assert.doesNotMatch(source,/touchstart|touchend/);
});

test("mobile eyebrow uses a safe inset without changing the hero card",async()=>{
  const css=await readFile(new URL("css/nyvera.css",root),"utf8");
  assert.match(css,/@media\(max-width:430px\)\{\.hero\.studio-welcome>\.eyebrow\{[^}]*max-width:100%[^}]*padding-inline:\.25rem/);
  assert.match(css,/@media\(max-width:360px\)\{\.hero\.studio-welcome>\.eyebrow\{letter-spacing:\.1em/);
});

test("service worker bypasses external audio and uses the mobile-radio cache",async()=>{
  const source=await readFile(new URL("service-worker.js",root),"utf8");
  assert.match(source,/nyvera-app-shell-v1\.9\.0-kids-products/);
  assert.match(source,/new URL\(event\.request\.url\)\.origin!==self\.location\.origin/);
});
