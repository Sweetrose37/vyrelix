/**
 * Vyrelix Universal Creation Engine composition root.
 * It connects registries, project lifecycle, shared datasets, search, filtering, history, and storage.
 */
import { ProjectEngine } from "./projectEngine.js";
import { ValidationEngine } from "./validationEngine.js";
import { StorageEngine } from "./storageEngine.js";
import { StudioManager } from "./studioManager.js";
import { ModuleLoader } from "./moduleLoader.js";
import { ProjectManager } from "./projectManager.js";
import { GeneratorEngine } from "./generatorEngine.js";
import { SearchEngine } from "./searchEngine.js";
import { FilterEngine } from "./filterEngine.js";
import { TagEngine } from "./tagEngine.js";
import { FavoritesEngine } from "./favoritesEngine.js";
import { HistoryEngine } from "./historyEngine.js";
import { RecentEngine } from "./recentEngine.js";
import { SettingsEngine } from "./settingsEngine.js";
import { CORE_DATASETS } from "../data/core/index.js";
import { STUDIO_DEFINITIONS } from "../studios/index.js";
import { ProjectTemplateManager } from "../project/projectTemplates.js";

export class CreationEngine {
  constructor({ adapter = globalThis.localStorage } = {}) {
    this.storage = new StorageEngine(adapter);
    this.studios = new StudioManager();
    STUDIO_DEFINITIONS.forEach((studio) => this.studios.register(studio));
    this.modules = new ModuleLoader();
    this.modules.register("visual-engine", () => import("../visual/visualEngine.js"));
    this.modules.register("prompt-engine", () => import("../prompt/promptEngine.js"));
    this.modules.register("ai-engine", () => import("../ai/aiEngine.js"));
    this.projectModel = new ProjectEngine();
    this.history = new HistoryEngine(this.storage);
    this.recent = new RecentEngine(this.storage);
    this.validation = new ValidationEngine({
      getProjectTypes: () => this.studios.projectTypes(),
      getProjects: () => this.projects?.list() || []
    });
    this.projects = new ProjectManager({
      storage: this.storage,
      projects: this.projectModel,
      validation: this.validation,
      history: this.history,
      recent: this.recent
    });
    this.search = new SearchEngine();
    this.filters = new FilterEngine();
    this.tags = new TagEngine(this.storage);
    this.favorites = new FavoritesEngine(this.projects);
    this.settings = new SettingsEngine(this.storage);
    this.templates = new ProjectTemplateManager(this.storage);
    this.generators = new GeneratorEngine();
    this.datasets = CORE_DATASETS;
    this.registerGenerators();
  }

  registerGenerators() {
    this.studios.list().forEach((studio) => this.generators.register(studio.projectType, () => null));
    this.generators.register("Character", ({ seed, datasets, choose }) => ({
      name: `${choose(datasets.identity.givenNames)} ${choose(datasets.identity.familyNames)}`,
      category: choose(datasets.identity.archetypes),
      theme: choose(datasets.style.themes),
      artStyle: choose(datasets.style.artStyles),
      randomSeed: seed
    }), { active: true });
  }

  registerStudio(descriptor, moduleFactory = null) {
    this.studios.register(descriptor);
    if (moduleFactory) this.modules.register(descriptor.id, moduleFactory);
    this.generators.register(descriptor.projectType, () => null);
    return this;
  }

  query({ query = "", filters = {}, sort = this.settings.get().defaultSort } = {}) {
    return this.filters.apply(this.search.search(this.projects.list(), query), filters, sort);
  }
}

export const creationEngine = new CreationEngine();
