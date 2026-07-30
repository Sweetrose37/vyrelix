/**
 * Immutable application constants and versioned storage namespaces.
 */
export const APP_VERSION = "5.0.0";
export const STORAGE_KEYS = Object.freeze({
  settings: "vyrelix.v1.settings",
  favorites: "vyrelix.v1.favorites",
  characters: "vyrelix.v1.characters",
  prompts: "vyrelix.v1.prompts",
  promptRecords: "vyrelix.v4.prompts",
  promptDrafts: "vyrelix.v4.prompt-drafts",
  promptRecent: "vyrelix.v4.prompt-recent",
  negativePresets: "vyrelix.v4.negative-presets",
  providerSettings: "vyrelix.v5.provider-settings",
  images: "vyrelix.v5.images",
  activity: "vyrelix.v1.activity",
  history: "vyrelix.v1.history",
  theme: "vyrelix.v1.theme",
  projects: "vyrelix.v2.projects",
  creatures: "vyrelix.v2.creatures",
  worlds: "vyrelix.v2.worlds",
  scenes: "vyrelix.v2.scenes",
  objects: "vyrelix.v2.objects",
  logos: "vyrelix.v2.logos",
  templates: "vyrelix.v2.templates",
  recent: "vyrelix.v2.recent",
  uceHistory: "vyrelix.v2.history",
  uceSettings: "vyrelix.v2.settings",
  favoriteTags: "vyrelix.v2.favorite-tags",
  archive: "vyrelix.v2.archive"
});
export const DEFAULT_SETTINGS = Object.freeze({ darkMode: true, animations: true });
