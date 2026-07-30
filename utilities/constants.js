/**
 * Immutable application constants and versioned storage namespaces.
 */
export const APP_VERSION = "1.1.0";
export const STORAGE_KEYS = Object.freeze({
  settings: "vyrelix.v1.settings",
  favorites: "vyrelix.v1.favorites",
  characters: "vyrelix.v1.characters",
  prompts: "vyrelix.v1.prompts",
  activity: "vyrelix.v1.activity",
  history: "vyrelix.v1.history",
  theme: "vyrelix.v1.theme"
});
export const DEFAULT_SETTINGS = Object.freeze({ darkMode: true, animations: true });
