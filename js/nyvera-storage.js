import { APP_VERSION } from "./nyvera-data.js";

const PREFIX="nyvera_";
export const keys={settings:`${PREFIX}settings`,version:`${PREFIX}app_version`};
for(const studio of ["character","kids","sticker"]){
  keys[`${studio}Projects`]=`${PREFIX}${studio}_projects`;
  keys[`${studio}Draft`]=`${PREFIX}${studio}_draft`;
  keys[`${studio}History`]=`${PREFIX}${studio}_history`;
  keys[`${studio}Favorites`]=`${PREFIX}${studio}_favorites`;
}

const baseSettings={sound:false,ambience:false,animations:true,reducedMotion:false,textSize:"normal",highContrast:false,autosave:true,confirmDelete:true,defaultStudio:"character",rememberLastStudio:true,historyLimit:100};
const listeners=new Set();

function notify(detail){listeners.forEach(fn=>fn(detail));}
function parse(key,fallback){
  try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);}
  catch(error){console.error(`Nyvera could not parse ${key}`,error);notify({type:"corrupt",key});return fallback;}
}
function write(key,value){
  try{localStorage.setItem(key,JSON.stringify(value));notify({type:"write",key});return true;}
  catch(error){console.error(`Nyvera could not save ${key}`,error);notify({type:"quota",key});return false;}
}
function id(){return globalThis.crypto?.randomUUID?.()||`nyv-${Date.now()}-${Math.random().toString(16).slice(2)}`;}
function iso(){return new Date().toISOString();}
function listKey(studio,type="Projects"){return keys[`${studio}${type}`];}

export const store={
  on(fn){listeners.add(fn);return()=>listeners.delete(fn);},
  settings(){return {...baseSettings,...parse(keys.settings,{})};},
  saveSettings(next){const value={...this.settings(),...next};write(keys.settings,value);return value;},
  projects(studio){return parse(listKey(studio),[]);},
  allProjects(){return ["character","kids","sticker"].flatMap(studio=>this.projects(studio));},
  getProject(studio,projectId){return this.projects(studio).find(p=>p.id===projectId)||null;},
  saveProject(input){
    const now=iso(),project={id:input.id||id(),studio:input.studio,builderType:input.builderType||"Builder",title:(input.title||"Untitled Nyvera Project").trim(),createdAt:input.createdAt||now,updatedAt:now,favorite:Boolean(input.favorite),status:input.status||"completed",formData:input.formData||{},generatedPrompt:input.generatedPrompt||"",negativePrompt:input.negativePrompt||"",mockupPrompt:input.mockupPrompt||"",selectionSummary:input.selectionSummary||{},templateId:input.templateId||null,appVersion:APP_VERSION};
    const items=this.projects(project.studio),index=items.findIndex(p=>p.id===project.id);
    if(index>=0)items[index]=project;else items.unshift(project);
    if(!write(listKey(project.studio),items))throw new Error("Storage is full. Export older projects, then remove files you no longer need.");
    this.addHistory(project);this.syncFavorites(project.studio);return project;
  },
  deleteProject(studio,projectId){write(listKey(studio),this.projects(studio).filter(p=>p.id!==projectId));this.syncFavorites(studio);},
  duplicateProject(project){const copy={...project,id:id(),title:`${project.title} Copy`,createdAt:iso(),updatedAt:iso()};return this.saveProject(copy);},
  toggleFavorite(studio,projectId){const items=this.projects(studio),project=items.find(p=>p.id===projectId);if(!project)return null;project.favorite=!project.favorite;project.updatedAt=iso();write(listKey(studio),items);this.syncFavorites(studio);return project;},
  syncFavorites(studio){write(listKey(studio,"Favorites"),this.projects(studio).filter(p=>p.favorite).map(p=>p.id));},
  draft(studio){return parse(listKey(studio,"Draft"),null);},
  saveDraft(studio,draft){return write(listKey(studio,"Draft"),{...draft,studio,updatedAt:iso(),appVersion:APP_VERSION});},
  clearDraft(studio){localStorage.removeItem(listKey(studio,"Draft"));},
  history(studio){return parse(listKey(studio,"History"),[]);},
  addHistory(project){const limit=Number(this.settings().historyLimit)||100;const item={id:id(),projectId:project.id,title:project.title,studio:project.studio,builderType:project.builderType,generatedAt:iso(),generatedPrompt:project.generatedPrompt};write(listKey(project.studio,"History"),[item,...this.history(project.studio)].slice(0,limit));},
  deleteHistory(studio,historyId){write(listKey(studio,"History"),this.history(studio).filter(x=>x.id!==historyId));},
  clearHistory(studio){write(listKey(studio,"History"),[]);},
  resetStudio(studio){["Projects","Draft","History","Favorites"].forEach(type=>localStorage.removeItem(listKey(studio,type)));},
  resetAll(){Object.values(keys).forEach(key=>localStorage.removeItem(key));localStorage.setItem(keys.version,APP_VERSION);},
  exportAll(){return {type:"nyvera-backup",appVersion:APP_VERSION,exportedAt:iso(),settings:this.settings(),studios:Object.fromEntries(["character","kids","sticker"].map(s=>[s,{projects:this.projects(s),draft:this.draft(s),history:this.history(s),favorites:parse(listKey(s,"Favorites"),[])}]))};},
  importAll(data,mode="merge"){
    if(!data||data.type!=="nyvera-backup"||!data.studios)throw new Error("This is not a valid Nyvera backup.");
    for(const studio of ["character","kids","sticker"]){const incoming=data.studios[studio]||{};if(mode==="replace")this.resetStudio(studio);const current=this.projects(studio),byId=new Map(current.map(p=>[p.id,p]));(incoming.projects||[]).forEach(p=>{if(p?.studio===studio)byId.set(p.id,p)});write(listKey(studio),[...byId.values()]);if(incoming.draft)write(listKey(studio,"Draft"),incoming.draft);const history=mode==="merge"?[...(incoming.history||[]),...this.history(studio)]:incoming.history||[];write(listKey(studio,"History"),history.slice(0,Number(this.settings().historyLimit)||100));this.syncFavorites(studio);}if(data.settings)write(keys.settings,{...this.settings(),...data.settings});
  }
};

localStorage.setItem(keys.version,APP_VERSION);
