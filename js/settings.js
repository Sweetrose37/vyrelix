/**
 * Settings controller applies persisted theme and reduced-motion preferences.
 */
import { storage } from "./storage.js";

export function initializeSettings(onClearRequest) {
  const darkToggle = document.querySelector("#dark-mode-toggle");
  const animationToggle = document.querySelector("#animation-toggle");
  let settings = storage.getSettings();

  function apply() {
    document.documentElement.dataset.theme = settings.darkMode ? "dark" : "soft";
    document.documentElement.classList.toggle("reduce-motion", !settings.animations);
    darkToggle.checked = settings.darkMode;
    animationToggle.checked = settings.animations;
  }

  darkToggle.addEventListener("change", () => {
    settings.darkMode = darkToggle.checked;
    storage.saveTheme(settings.darkMode ? "dark" : "soft");
    storage.saveSettings(settings);
    apply();
  });
  animationToggle.addEventListener("change", () => {
    settings.animations = animationToggle.checked;
    storage.saveSettings(settings);
    apply();
  });
  document.querySelector("#clear-storage").addEventListener("click", onClearRequest);
  apply();
  return { reset: () => { settings = storage.getSettings(); apply(); } };
}
