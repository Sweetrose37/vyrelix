import test from "node:test";
import assert from "node:assert/strict";

const values=new Map();
globalThis.localStorage={getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
globalThis.location={protocol:"https:"};
const storage=(await import("../js/radio-storage.js")).radioStorage;
const service=await import("../js/radio-service.js");

test("normalizes location metadata without inventing cities",()=>{
  const stations=[
    service.normalizeStation({stationuuid:"1",name:"One",url_resolved:"https://one.test/live",country:"United States",countrycode:"us",state:" Georgia ",language:"English, Spanish",tags:"Jazz, Soul",city:"Atlanta",codec:"MP3",bitrate:128,lastcheckok:1}),
    service.normalizeStation({stationuuid:"2",name:"Two",url_resolved:"https://two.test/live",country:"United States",countrycode:"US",state:"georgia",language:"english",tags:"jazz",codec:"AAC",bitrate:96,lastcheckok:1})
  ];
  assert.equal(service.regionsFromStations(stations).length,1);
  assert.equal(service.regionsFromStations(stations)[0].count,2);
  assert.deepEqual(service.citiesFromStations(stations).map(x=>x.name),["Atlanta"]);
  assert.deepEqual(service.languagesFromStations(stations).map(x=>x.name),["English","Spanish"]);
  assert.deepEqual(service.tagsFromStations(stations).map(x=>x.name),["Jazz","Soul"]);
});
test("persists hierarchical filters independently from current station",()=>{
  storage.reset();storage.saveLocation({country:"United States",countryCode:"US",state:"Georgia",city:"Atlanta",languages:["English"],genre:"Jazz",filters:{verified:true,httpsOnly:true,minBitrate:96,sort:"votes"}});
  const saved=storage.location();assert.equal(saved.countryCode,"US");assert.equal(saved.state,"Georgia");assert.equal(saved.city,"Atlanta");assert.deepEqual(saved.languages,["English"]);assert.equal(saved.filters.minBitrate,96);
});
test("saved searches support rename, open data, delete, and clear",()=>{
  storage.reset();const item=storage.saveLocationSearch({country:"Jamaica",countryCode:"JM",state:"",city:"",languages:["English"],genre:"Reggae",filters:{}},"Jamaica Reggae");
  assert.equal(storage.savedLocations()[0].name,"Jamaica Reggae");storage.renameLocation(item.id,"Island Radio");assert.equal(storage.savedLocations()[0].name,"Island Radio");storage.deleteLocation(item.id);assert.equal(storage.savedLocations().length,0);storage.saveLocationSearch({country:"France"},"France");storage.clearSavedLocations();assert.equal(storage.savedLocations().length,0);
});
test("recent locations are deduplicated and bounded to 25",()=>{
  storage.reset();for(let i=0;i<30;i++)storage.addRecentLocation({country:`Country ${i}`,countryCode:String(i),state:"",city:""});assert.equal(storage.recentLocations().length,25);storage.addRecentLocation({country:"Country 29",countryCode:"29",state:"",city:""});assert.equal(storage.recentLocations().length,25);assert.equal(storage.recentLocations()[0].country,"Country 29");storage.removeRecentLocation(0);assert.equal(storage.recentLocations().length,24);storage.clearRecentLocations();assert.equal(storage.recentLocations().length,0);
});
test("iHeart live station pages become official responsive dark-theme embeds",()=>{
  assert.equal(service.iheartEmbedUrl("https://www.iheart.com/live/jingle-ball-radio-9165/"),"https://www.iheart.com/live/jingle-ball-radio-9165/?embed=true&theme=dark");
  assert.equal(service.iheartEmbedUrl("https://evil.example/live/fake-1234/"),"");
  assert.equal(service.iheartEmbedUrl("https://www.iheart.com/podcast/example-1234/"),"");
});
