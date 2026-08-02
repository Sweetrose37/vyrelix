import { radioStorage } from "./radio-storage.js";

const DISCOVERY="https://all.api.radio-browser.info/json/servers";
const FALLBACK_SERVERS=["https://de1.api.radio-browser.info","https://nl1.api.radio-browser.info","https://at1.api.radio-browser.info"];
const SUPPORTED_CODECS=new Set(["MP3","AAC","AAC+","OGG","OPUS"]);
const PLAYLIST_URL=/\.m3u(?:\?|$)|\.pls(?:\?|$)/i;
const HLS_URL=/\.m3u8(?:\?|$)/i;
let servers=[];

export const IHEART_DIRECTORY="https://www.iheart.com/live/";
export function iheartEmbedUrl(value){
  try{
    const url=new URL(String(value||"").trim());
    if(url.protocol!=="https:"||!/(^|\.)iheart\.com$/i.test(url.hostname)||!/^\/live\/[^/]+-\d+\/?$/i.test(url.pathname))return "";
    url.hostname="www.iheart.com";url.search="?embed=true&theme=dark";url.hash="";return url.href;
  }catch{return ""}
}

const clean=value=>String(value??"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,500);
const validUrl=(value,{httpsOnly=false}={})=>{try{const url=new URL(value);if(!["http:","https:"].includes(url.protocol))return "";if(httpsOnly&&url.protocol!=="https:")return "";return url.href}catch{return ""}};
const timeoutSignal=ms=>{const controller=new AbortController();setTimeout(()=>controller.abort(),ms);return controller.signal};
const unique=list=>[...new Set(list)];

export function normalizeStation(raw){
  const stream=validUrl(raw?.url_resolved||raw?.url),favicon=validUrl(raw?.favicon,{httpsOnly:true}),homepage=validUrl(raw?.homepage,{httpsOnly:location.protocol==="https:"});
  return {stationuuid:clean(raw?.stationuuid),name:clean(raw?.name)||"Unknown station",url_resolved:stream,homepage,favicon,country:clean(raw?.country),countrycode:clean(raw?.countrycode).toUpperCase(),state:clean(raw?.state),city:clean(raw?.city||raw?.locality),language:clean(raw?.language),tags:clean(raw?.tags),codec:clean(raw?.codec).toUpperCase(),bitrate:Number(raw?.bitrate)||0,votes:Number(raw?.votes)||0,clickcount:Number(raw?.clickcount)||0,lastcheckok:Number(raw?.lastcheckok)||0,lastchecktime_iso8601:clean(raw?.lastchecktime_iso8601)};
}
export function stationUsable(station,filters={}){
  if(!station.stationuuid||!station.url_resolved)return false;
  if(filters.httpsOnly&&station.url_resolved.startsWith("http:"))return false;
  if(location.protocol==="https:"&&station.url_resolved.startsWith("http:"))return false;
  if(filters.verified&&station.lastcheckok!==1)return false;
  if(Number(filters.minBitrate)&&station.bitrate<Number(filters.minBitrate))return false;
  if(filters.codec&&station.codec!==filters.codec)return false;
  if(station.codec&&!SUPPORTED_CODECS.has(station.codec)&&!station.url_resolved.match(/\.m3u8?(\?|$)|\.pls(\?|$)/i))return false;
  if(filters.familyFriendly&&!/(children|kids|family|educational|classical|instrumental|calm)/i.test(station.tags))return false;
  return true;
}

export async function discoverServers(force=false){
  if(servers.length&&!force)return servers;
  try{const response=await fetch(DISCOVERY,{signal:timeoutSignal(8000),headers:{Accept:"application/json"}});if(!response.ok)throw new Error(`Discovery ${response.status}`);const data=await response.json();servers=unique(data.map(item=>item?.name&&`https://${clean(item.name)}`).filter(Boolean).concat(FALLBACK_SERVERS));}
  catch(error){console.warn("Nyvera Radio server discovery failed; using fallbacks",error);servers=[...FALLBACK_SERVERS]}
  return servers;
}
async function request(path,params={},cacheKey=""){
  const cached=cacheKey&&radioStorage.getCache(cacheKey),pool=await discoverServers();let lastError;
  for(const server of pool){try{const url=new URL(`/json/${path}`,server);Object.entries(params).forEach(([key,value])=>{if(value!==""&&value!==null&&value!==undefined)url.searchParams.set(key,String(value))});const response=await fetch(url,{signal:timeoutSignal(10000),headers:{Accept:"application/json"}});if(!response.ok)throw new Error(`${response.status} from ${server}`);const data=await response.json();if(cacheKey)radioStorage.setCache(cacheKey,data);return data}catch(error){lastError=error;console.warn(`Nyvera Radio API fallback from ${server}`,error)}}
  if(cached)return cached;throw lastError||new Error("Radio directory unavailable");
}

const orderMap={popular:"clickcount",votes:"votes",bitrate:"bitrate",name:"name",verified:"lastchecktime"};
export async function searchStations(query={},filters={}){
  const params={name:clean(query.name),tag:clean(query.tag),country:clean(query.country),state:clean(query.state),language:clean(query.language),hidebroken:true,limit:60,order:orderMap[filters.sort]||"clickcount",reverse:filters.sort==="name"?false:true};
  const cacheKey=`stations:${JSON.stringify(params)}`,data=await request("stations/search",params,cacheKey);
  return data.map(normalizeStation).filter(station=>stationUsable(station,filters));
}
export async function popularStations(filters={}){return searchStations({},filters)}
export async function stationById(id){const data=await request(`stations/byuuid/${encodeURIComponent(id)}`,{},`station:${id}`);return data[0]?normalizeStation(data[0]):null}
export async function listCountries(){const data=await request("countries",{hidebroken:true,order:"stationcount",reverse:true},"countries");return data.map(x=>({name:clean(x.name),code:clean(x.iso_3166_1),count:Number(x.stationcount)||0})).filter(x=>x.name)}
export async function listLanguages(){const data=await request("languages",{hidebroken:true,order:"stationcount",reverse:true},"languages");return data.map(x=>({name:clean(x.name),code:clean(x.iso_639),count:Number(x.stationcount)||0})).filter(x=>x.name)}
export async function listCountryCodes(){const data=await request("countrycodes",{hidebroken:true,order:"stationcount",reverse:true},"countrycodes");return data.map(x=>({code:clean(x.name).toUpperCase(),count:Number(x.stationcount)||0})).filter(x=>x.code)}
export async function listTags(){const data=await request("tags",{hidebroken:true,order:"stationcount",reverse:true,limit:500},"tags");return data.map(x=>({name:clean(x.name),count:Number(x.stationcount)||0})).filter(x=>x.name)}
export async function searchLocationStations(query={},filters={},limit=750){
  const selectedLanguages=(Array.isArray(query.languages)?query.languages:[query.language||query.languages]).map(clean).filter(Boolean),params={name:clean(query.name),country:clean(query.country),countrycode:clean(query.countryCode).toUpperCase(),state:clean(query.state),language:selectedLanguages.length===1?selectedLanguages[0]:"",tag:clean(query.genre||query.tag),hidebroken:true,limit:Math.min(1000,Math.max(1,Number(limit)||750)),order:orderMap[filters.sort]||"clickcount",reverse:filters.sort==="name"?false:true};
  const data=await request("stations/search",params,`location:${JSON.stringify(params)}`),city=clean(query.city).toLocaleLowerCase();
  return data.map(normalizeStation).filter(station=>stationUsable(station,filters)).filter(station=>!selectedLanguages.length||station.language.split(",").some(value=>selectedLanguages.some(selected=>value.trim().localeCompare(selected,undefined,{sensitivity:"base"})===0))).filter(station=>!city||[station.city,station.name,station.state,station.tags,station.homepage].some(value=>String(value).toLocaleLowerCase().includes(city)));
}
const normalizedValues=(stations,key)=>{const found=new Map();stations.forEach(station=>String(station[key]||"").split(",").map(value=>clean(value)).filter(value=>value&&!/^unknown$/i.test(value)).forEach(value=>{const normalized=value.toLocaleLowerCase();if(!found.has(normalized))found.set(normalized,{name:value,source:value,count:0});found.get(normalized).count++}));return [...found.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:"base"}))};
export const regionsFromStations=stations=>normalizedValues(stations,"state");
export const citiesFromStations=stations=>normalizedValues(stations,"city");
export const languagesFromStations=stations=>normalizedValues(stations,"language");
export const tagsFromStations=stations=>normalizedValues(stations,"tags");
export async function listStates(countryOrCode,filters={verified:true,httpsOnly:true,minBitrate:0}){const query=String(countryOrCode||"").length===2?{countryCode:countryOrCode}:{country:countryOrCode};return regionsFromStations(await searchLocationStations(query,filters))}
export async function listCities(query,filters={verified:true,httpsOnly:true,minBitrate:0}){return citiesFromStations(await searchLocationStations(query,filters))}
export async function registerClick(id){try{await request(`url/${encodeURIComponent(id)}`)}catch(error){console.warn("Station click registration failed",error)}}

const codecTypes={MP3:["audio/mpeg"],AAC:["audio/aac","audio/mp4","audio/mpeg"],"AAC+":["audio/aac","audio/mp4","audio/mpeg"],OGG:["audio/ogg"],OPUS:['audio/ogg; codecs="opus"',"audio/ogg"]};
export function directStream(station,audio){
  const url=validUrl(station?.url_resolved||station?.url);
  if(!url)throw new Error("Station unavailable: no usable stream URL was provided.");
  if(location.protocol==="https:"&&url.startsWith("http:"))throw new Error("This station uses an insecure stream that your mobile browser cannot play.");
  if(PLAYLIST_URL.test(url))return "";
  if(HLS_URL.test(url)){if(audio.canPlayType("application/vnd.apple.mpegurl")||audio.canPlayType("application/x-mpegURL"))return url;throw new Error("This HLS stream is not supported by this browser.")}
  const codec=clean(station?.codec).toUpperCase(),types=codecTypes[codec];
  if(codec&&!SUPPORTED_CODECS.has(codec))throw new Error(`The ${codec} stream format is not supported by Nyvera.`);
  if(types&&typeof audio.canPlayType==="function"&&!types.some(type=>audio.canPlayType(type)))throw new Error(`The ${codec} stream format is not supported by this browser.`);
  return url;
}

export async function resolveStream(station,audio){
  const direct=directStream(station,audio);if(direct)return direct;const url=station.url_resolved;
  try{const response=await fetch(url,{signal:timeoutSignal(7000),headers:{Accept:"audio/x-mpegurl,audio/mpegurl,audio/x-scpls,text/plain"}});if(!response.ok)throw new Error("Playlist unavailable");const text=await response.text();const candidates=/\.pls(?:\?|$)/i.test(url)?[...text.matchAll(/^File\d+=(.+)$/gmi)].map(x=>x[1].trim()):text.split(/\r?\n/).map(x=>x.trim()).filter(x=>/^https?:\/\//i.test(x));const stream=candidates.map(x=>validUrl(x)).find(Boolean);if(stream)return directStream({...station,url_resolved:stream},audio)}catch(error){console.warn("Playlist resolution failed",{station:station?.name,url,error});if(/insecure|not supported/i.test(error.message))throw error;throw new Error("This station playlist could not be resolved on this browser.")}
  throw new Error("This station playlist did not contain a usable stream.");
}

export const genres=["R&B","Gospel","Jazz","Neo-Soul","Hip-Hop","Pop","Country","Classical","Lo-Fi","Rock","Old School","Reggae","Dance","Electronic","News","Talk","Sports","Christian","Children","International"];
export const recommendations={main:["jazz","soul","gospel","r&b","lo-fi","classical","lounge","chillout"],character:["r&b","soul","neo-soul","smooth jazz","jazz","lo-fi","lounge","gospel","classical","chillout"],kids:["children","kids","family","educational","classical","instrumental","calm"],sticker:["pop","dance","electronic","lo-fi","indie","funk","disco","upbeat","chillout"]};
