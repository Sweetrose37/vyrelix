/**
 * Single studio registry source. Future studios only add a descriptor and one import here.
 */
import { characterStudio } from "./characterStudio.js";
import { creatureStudio } from "./creatureStudio.js";
import { worldStudio } from "./worldStudio.js";
import { sceneStudio } from "./sceneStudio.js";
import { objectStudio } from "./objectStudio.js";
import { logoStudio } from "./logoStudio.js";
import { mascotStudio } from "./mascotStudio.js";
import { environmentStudio } from "./environmentStudio.js";
import { vehicleStudio } from "./vehicleStudio.js";
import { architectureStudio } from "./architectureStudio.js";
import { posterStudio } from "./posterStudio.js";
import { bookCoverStudio } from "./bookCoverStudio.js";

export const STUDIO_DEFINITIONS = Object.freeze([
  characterStudio, creatureStudio, worldStudio, sceneStudio, objectStudio, logoStudio,
  mascotStudio, environmentStudio, vehicleStudio, architectureStudio, posterStudio, bookCoverStudio,
  Object.freeze({
    id: "icon", name: "Icon Studio", projectType: "Icon", icon: "◉",
    description: "Create scalable visual symbols and interface icons.", active: false, generator: false,
    visualCapabilities: Object.freeze(["color", "pattern", "composition", "artStyle"])
  })
]);
