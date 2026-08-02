import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../js/app.js",import.meta.url),"utf8"),css=fs.readFileSync(new URL("../css/nyvera.css",import.meta.url),"utf8"),sw=fs.readFileSync(new URL("../service-worker.js",import.meta.url),"utf8"),build=fs.readFileSync(new URL("../scripts/build.ps1",import.meta.url),"utf8");

test("Kids result exposes the optional product card and linked variants",()=>{for(const text of ["Create a Product From This Project","Create a Product","Skip Product","Linked Products","data-open-kids-product"])assert.match(app,new RegExp(text));});
test("catalog, three-stage builder, proposals, result actions, and exact-text warning are wired",()=>{for(const text of ["renderKidsProductCatalog","data-kids-product-search","data-kids-product-category","data-kids-product-classification","renderKidsProductBuilder","Style My Product","Surprise My Product","Exact text warning","renderKidsProductResult","Duplicate Only This Product","Create Another Product","Return to Kids Result"])assert.match(app,new RegExp(text));});
test("Kids product UI is responsive and clears the persistent radio",()=>{assert.match(css,/\.product-stage-grid/);assert.match(css,/\.radio-is-enabled \.product-actions\{bottom:10\.5rem\}/);assert.match(css,/@media\(max-width:430px\).*\.product-actions/s);assert.match(css,/overflow-wrap:anywhere/);});
test("production build and app shell include the Kids product module",()=>{assert.match(build,/nyvera-kids-products\.js/g);assert.match(sw,/nyvera-kids-products\.js/);assert.match(sw,/v1\.9\.1-mobile-welcome/);});
