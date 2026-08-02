import test from "node:test";
import assert from "node:assert/strict";

const values=new Map();
globalThis.localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
globalThis.location={protocol:"https:"};
const storage=(await import("../js/radio-storage.js")).radioStorage;
const service=await import("../js/radio-service.js");

test("normalizes station metadata and removes markup",()=>{
  const station=service.normalizeStation({stationuuid:"abc",name:"<b>Jazz</b>",url_resolved:"https://radio.example/live",favicon:"http://bad.example/logo.png",codec:"mp3",bitrate:"128",lastcheckok:1});
  assert.equal(station.name,"bJazz/b");assert.equal(station.favicon,"");assert.equal(station.codec,"MP3");assert.equal(station.bitrate,128);
});
test("rejects broken, insecure, low-bitrate, and unsupported stations",()=>{
  const base={stationuuid:"1",url_resolved:"https://example.com/live",lastcheckok:1,bitrate:128,codec:"MP3",tags:"jazz"};
  assert.equal(service.stationUsable(base,{httpsOnly:true,verified:true,minBitrate:64}),true);
  assert.equal(service.stationUsable({...base,url_resolved:"http://example.com/live"},{httpsOnly:true}),false);
  assert.equal(service.stationUsable({...base,lastcheckok:0},{verified:true}),false);
  assert.equal(service.stationUsable({...base,bitrate:32},{minBitrate:64}),false);
  assert.equal(service.stationUsable({...base,codec:"WMA"},{}),false);
});
test("persists favorites, recent station, settings, and current selection",()=>{
  storage.reset();const station={stationuuid:"one",name:"One",url_resolved:"https://example.com/live"};
  assert.equal(storage.toggleFavorite(station),true);assert.equal(storage.isFavorite("one"),true);assert.equal(storage.toggleFavorite(station),false);
  storage.addRecent(station,"kids");assert.equal(storage.recent()[0].studio,"kids");
  storage.saveSettings({volume:.4,muted:true});assert.equal(storage.settings().volume,.4);assert.equal(storage.settings().muted,true);
  storage.saveCurrent(station);assert.equal(storage.current().stationuuid,"one");
});
test("falls back when API discovery fails",async()=>{
  const original=globalThis.fetch;globalThis.fetch=async()=>{throw new Error("offline")};
  const servers=await service.discoverServers(true);globalThis.fetch=original;
  assert.ok(servers.length>=3);assert.ok(servers.every(url=>url.startsWith("https://")));
});
test("rejects unsupported direct stream codec",async()=>{
  await assert.rejects(()=>service.resolveStream({url_resolved:"https://example.com/live",codec:"WMA"},{canPlayType:()=>""}),/not supported/);
});
