const KEYS=Object.freeze({
  favorites:"nyvera_radio_favorites",recent:"nyvera_radio_recent",volume:"nyvera_radio_volume",muted:"nyvera_radio_muted",
  current:"nyvera_radio_current_station",collapsed:"nyvera_radio_collapsed",filters:"nyvera_radio_filters",lastSearch:"nyvera_radio_last_search",
  settings:"nyvera_radio_settings",cache:"nyvera_radio_cache",selectedCountry:"nyvera_radio_selected_country",selectedCountryCode:"nyvera_radio_selected_country_code",selectedState:"nyvera_radio_selected_state",selectedCity:"nyvera_radio_selected_city",selectedLanguage:"nyvera_radio_selected_language",selectedGenre:"nyvera_radio_selected_genre",savedLocations:"nyvera_radio_saved_locations",recentLocations:"nyvera_radio_recent_locations",locationFilters:"nyvera_radio_location_filters"
});
const defaults=Object.freeze({enabled:true,volume:.65,muted:false,rememberStation:true,showLogos:true,httpsOnly:true,minBitrate:64,familyFriendly:false,collapsed:true});
const parse=(key,fallback)=>{try{const value=localStorage.getItem(key);return value===null?fallback:JSON.parse(value)}catch(error){console.error(`Nyvera Radio could not read ${key}`,error);return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(error){console.error(`Nyvera Radio could not save ${key}`,error);return false}};
const safeStation=s=>s?{stationuuid:s.stationuuid||"",name:s.name||"Unknown station",url_resolved:s.url_resolved||s.url||"",homepage:s.homepage||"",favicon:s.favicon||"",country:s.country||"",countrycode:s.countrycode||"",state:s.state||"",city:s.city||"",language:s.language||"",tags:s.tags||"",codec:s.codec||"",bitrate:Number(s.bitrate)||0,votes:Number(s.votes)||0,clickcount:Number(s.clickcount)||0,lastcheckok:Number(s.lastcheckok)||0}:null;

export const radioStorage={
  keys:KEYS,
  settings(){return {...defaults,...parse(KEYS.settings,{})}},
  saveSettings(next){const settings={...this.settings(),...next};write(KEYS.settings,settings);write(KEYS.volume,settings.volume);write(KEYS.muted,Boolean(settings.muted));write(KEYS.collapsed,Boolean(settings.collapsed));return settings},
  favorites(){return parse(KEYS.favorites,[])},
  isFavorite(id){return this.favorites().some(s=>s.stationuuid===id)},
  toggleFavorite(station){const item=safeStation(station),items=this.favorites(),index=items.findIndex(s=>s.stationuuid===item.stationuuid);if(index>=0)items.splice(index,1);else items.unshift({...item,savedAt:new Date().toISOString()});write(KEYS.favorites,items.slice(0,100));return index<0},
  clearFavorites(){write(KEYS.favorites,[])},
  recent(){return parse(KEYS.recent,[])},
  addRecent(station,studio="main"){const item=safeStation(station),items=this.recent().filter(s=>s.stationuuid!==item.stationuuid);items.unshift({...item,lastPlayedAt:new Date().toISOString(),studio});write(KEYS.recent,items.slice(0,40))},
  clearRecent(){write(KEYS.recent,[])},
  current(){return parse(KEYS.current,null)},
  saveCurrent(station){const settings=this.settings();if(settings.rememberStation&&station)write(KEYS.current,safeStation(station));else if(!settings.rememberStation)localStorage.removeItem(KEYS.current)},
  filters(){return {httpsOnly:true,verified:true,minBitrate:64,codec:"",familyFriendly:false,sort:"popular",...parse(KEYS.filters,{})}},
  saveFilters(filters){write(KEYS.filters,filters)},
  lastSearch(){return parse(KEYS.lastSearch,{name:"",tag:"",country:"",state:"",language:""})},
  saveLastSearch(search){write(KEYS.lastSearch,search)},
  getCache(key,maxAge=30*60*1000){const cache=parse(KEYS.cache,{}),entry=cache[key];return entry&&Date.now()-entry.savedAt<maxAge?entry.value:null},
  setCache(key,value){const cache=parse(KEYS.cache,{}),entries=Object.entries(cache).sort((a,b)=>b[1].savedAt-a[1].savedAt).slice(0,19);write(KEYS.cache,{...Object.fromEntries(entries),[key]:{savedAt:Date.now(),value}})},
  location(){return {country:parse(KEYS.selectedCountry,""),countryCode:parse(KEYS.selectedCountryCode,""),state:parse(KEYS.selectedState,""),city:parse(KEYS.selectedCity,""),languages:parse(KEYS.selectedLanguage,[]),genre:parse(KEYS.selectedGenre,""),filters:{verified:true,httpsOnly:true,minBitrate:64,codec:"",familyFriendly:false,name:"",sort:"popular",...parse(KEYS.locationFilters,{})}}},
  saveLocation(next){const location={...this.location(),...next};write(KEYS.selectedCountry,location.country||"");write(KEYS.selectedCountryCode,location.countryCode||"");write(KEYS.selectedState,location.state||"");write(KEYS.selectedCity,location.city||"");write(KEYS.selectedLanguage,Array.isArray(location.languages)?location.languages:location.languages?[location.languages]:[]);write(KEYS.selectedGenre,location.genre||"");write(KEYS.locationFilters,location.filters||{});return location},
  savedLocations(){return parse(KEYS.savedLocations,[])},
  saveLocationSearch(location,name=""){const item={...location,id:`loc_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,name:String(name||[location.city,location.state,location.country,location.genre].filter(Boolean).join(" · ")||"World Radio Search").trim().slice(0,80),savedAt:new Date().toISOString()};const items=this.savedLocations();items.unshift(item);write(KEYS.savedLocations,items.slice(0,50));return item},
  renameLocation(id,name){const items=this.savedLocations(),item=items.find(x=>x.id===id);if(item)item.name=String(name||item.name).trim().slice(0,80);write(KEYS.savedLocations,items)},
  deleteLocation(id){write(KEYS.savedLocations,this.savedLocations().filter(x=>x.id!==id))},
  clearSavedLocations(){write(KEYS.savedLocations,[])},
  recentLocations(){return parse(KEYS.recentLocations,[])},
  addRecentLocation(location){if(!location.country&&!location.state&&!location.city)return;const signature=[location.countryCode,location.state,location.city].join("|").toLowerCase(),items=this.recentLocations().filter(x=>[x.countryCode,x.state,x.city].join("|").toLowerCase()!==signature);items.unshift({...location,lastOpenedAt:new Date().toISOString()});write(KEYS.recentLocations,items.slice(0,25))},
  removeRecentLocation(index){const items=this.recentLocations();items.splice(Number(index),1);write(KEYS.recentLocations,items)},
  clearRecentLocations(){write(KEYS.recentLocations,[])},
  reset(){Object.values(KEYS).forEach(key=>localStorage.removeItem(key))}
};
