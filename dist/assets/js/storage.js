/**
 * Versioned local persistence for settings, characters, prompts, and activity.
 */
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "../utilities/constants.js";

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export const storage = {
  getSettings: () => ({ ...DEFAULT_SETTINGS, ...read(STORAGE_KEYS.settings, {}) }),
  saveSettings: (value) => write(STORAGE_KEYS.settings, value),
  getCharacters: () => read(STORAGE_KEYS.characters, []),
  saveCharacters: (value) => write(STORAGE_KEYS.characters, value),
  getPrompts: () => read(STORAGE_KEYS.prompts, []),
  savePrompts: (value) => write(STORAGE_KEYS.prompts, value),
  getFavorites: () => read(STORAGE_KEYS.favorites, []),
  saveFavorites: (value) => write(STORAGE_KEYS.favorites, value),
  getRecentActivity: () => read(STORAGE_KEYS.activity, []),
  saveRecentActivity: (value) => write(STORAGE_KEYS.activity, value),
  getHistory: () => read(STORAGE_KEYS.history, []),
  saveHistory: (value) => write(STORAGE_KEYS.history, value),
  getTheme: () => read(STORAGE_KEYS.theme, "dark"),
  saveTheme: (value) => write(STORAGE_KEYS.theme, value),
  clear: () => Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
};
