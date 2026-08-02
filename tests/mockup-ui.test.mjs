import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url),app=await readFile(new URL("js/app.js",root),"utf8"),css=await readFile(new URL("css/nyvera.css",root),"utf8");

test("Sticker result includes a functional optional mockup card and skip path",()=>{
  for(const text of ["Create a Product Mockup","Turn this finished sticker project into a professional product presentation.","Create Product Mockup","Skip Mockup"])assert.ok(app.includes(text),text);
  assert.match(app,/data-action="create-mockup"/);assert.match(app,/data-action="skip-mockup"/);
});

test("mockup result exposes every required action",()=>{
  for(const action of ["save-mockup","favorite-mockup","download-mockup","export-mockup","edit-mockup","regenerate-mockup","duplicate-mockup","another-mockup","return-sticker-result","back-dashboard"])assert.match(app,new RegExp(`data-action=\\"${action}\\"`),action);
  for(const copy of ["product-mockup","product-mockup-negative"])assert.match(app,new RegExp(`data-copy=\\"${copy}\\"`),copy);
});

test("mockup routes are separate from the original Sticker result",()=>{
  assert.match(app,/route==="mockup-builder"/);assert.match(app,/route==="mockup-result"/);assert.match(app,/Return to Sticker Result/);
});

test("mockup controls have narrow mobile layouts and radio clearance",()=>{
  assert.match(css,/@media\(max-width:430px\)[^{]*\{[^}]*\.mockup-offer/);
  assert.match(css,/\.radio-is-enabled \.mockup-sticky-actions\{bottom:10\.5rem\}/);
  assert.match(css,/\.mockup-result \.prompt-box\{[^}]*overflow-wrap:anywhere/);
});
