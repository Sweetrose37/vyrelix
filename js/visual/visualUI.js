/**
 * Event-delegated mobile visual interface for the Universal Creation Engine.
 */
import { VisualEngine, VISUAL_SELECTOR_CONFIG } from "./visualEngine.js";
import { createVisualPreview, updateVisualPreview } from "./visualPreview.js";
import { createAssetPreview } from "./assetPreview.js";

const GROUP_LABELS = Object.freeze({ color: "Colors", surface: "Surface", scene: "Direction", character: "Character", features: "Features" });

export function initializeVisualStudio({ root, initial = null, projectType = "Object", showToast, onApply }) {
  const engine = new VisualEngine({ initial: initial || undefined });
  const previewRoot = root.querySelector("#visual-preview-root");
  const groupRoot = root.querySelector("#visual-groups");
  const categoryRoot = root.querySelector("#visual-categories");
  const assetRoot = root.querySelector("#visual-assets");
  const search = root.querySelector("#visual-search");
  const categoryFilter = root.querySelector("#visual-category-filter");
  const resultCount = root.querySelector("#visual-result-count");
  const templateSelect = root.querySelector("#visual-template");
  const preview = createVisualPreview();
  let activeGroup = "color";
  let activeConfig = VISUAL_SELECTOR_CONFIG[0];
  let view = "all";
  let pageSize = 60;
  let activeProjectType = projectType;
  let studioId = String(projectType).toLocaleLowerCase().replace(/\s+/g, "-");
  let allowedGroups = new Set(["color", "surface", "scene", ...(new Set(["Character", "Creature", "Mascot"]).has(projectType) ? ["character", "features"] : [])]);
  engine.builder.set("studioId", studioId);

  previewRoot.replaceChildren(preview);
  templateSelect.replaceChildren(...engine.templates.list().map((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.name;
    return option;
  }));

  function createChip(label, dataset, value, active) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset[dataset] = value;
    button.className = active ? "is-active" : "";
    button.setAttribute("aria-pressed", String(active));
    button.textContent = label;
    return button;
  }

  function renderGroups() {
    groupRoot.replaceChildren(...Object.entries(GROUP_LABELS).filter(([key]) => allowedGroups.has(key)).map(([key, label]) => createChip(label, "visualGroup", key, key === activeGroup)));
  }

  function renderCategories() {
    const configs = VISUAL_SELECTOR_CONFIG.filter((config) => config.group === activeGroup);
    categoryRoot.replaceChildren(...configs.map((config) => createChip(config.label, "visualCategory", config.key, config.key === activeConfig.key)));
  }

  function renderCategoryFilter() {
    const categories = [...new Set(engine.getDataset(activeConfig.dataset).map((item) => item.category))].sort();
    categoryFilter.replaceChildren(...["all", ...categories].map((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category === "all" ? "All categories" : category;
      return option;
    }));
  }

  function selectedIds() {
    const value = engine.getValue(activeConfig.path);
    return new Set(Array.isArray(value) ? value : [value]);
  }

  function renderAssets() {
    const items = engine.query(activeConfig, {
      query: search.value,
      category: categoryFilter.value,
      favorites: view === "favorites",
      recent: view === "recent",
      studio: studioId
    });
    const favorites = new Set(engine.storage.read("favorites"));
    const selected = selectedIds();
    const visible = items.slice(0, pageSize);
    const fragment = document.createDocumentFragment();
    visible.forEach((item) => fragment.append(createAssetPreview(item, {
      selected: selected.has(item.id),
      favorite: favorites.has(item.id),
      multi: activeConfig.multi
    })));
    if (items.length > visible.length) {
      const more = document.createElement("button");
      more.type = "button";
      more.className = "button button--outlined button--wide";
      more.dataset.visualMore = "";
      more.textContent = `Load ${Math.min(60, items.length - visible.length)} more`;
      fragment.append(more);
    }
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "visual-empty";
      empty.innerHTML = "<strong>No visual assets found</strong><small>Try another search or filter.</small>";
      fragment.append(empty);
    }
    assetRoot.replaceChildren(fragment);
    resultCount.textContent = `${items.length.toLocaleString()} option${items.length === 1 ? "" : "s"}`;
  }

  function renderPreview() {
    updateVisualPreview(preview, engine.builder.build(), engine);
  }

  function selectGroup(group) {
    activeGroup = group;
    activeConfig = VISUAL_SELECTOR_CONFIG.find((config) => config.group === group);
    search.value = "";
    pageSize = 60;
    renderGroups();
    renderCategories();
    renderCategoryFilter();
    renderAssets();
  }

  function selectCategory(key) {
    activeConfig = VISUAL_SELECTOR_CONFIG.find((config) => config.key === key) || activeConfig;
    search.value = "";
    categoryFilter.value = "all";
    pageSize = 60;
    renderCategories();
    renderCategoryFilter();
    renderAssets();
  }

  root.addEventListener("click", (event) => {
    const group = event.target.closest("[data-visual-group]");
    const category = event.target.closest("[data-visual-category]");
    const asset = event.target.closest("[data-visual-asset]");
    const favorite = event.target.closest("[data-visual-favorite]");
    const viewButton = event.target.closest("[data-visual-view]");
    if (group) selectGroup(group.dataset.visualGroup);
    if (category) selectCategory(category.dataset.visualCategory);
    if (asset) {
      try {
        engine.select(activeConfig, asset.dataset.visualAsset);
        renderPreview();
        renderAssets();
      } catch (error) {
        showToast(error.message, "error");
      }
    }
    if (favorite) {
      engine.storage.toggleFavorite(favorite.dataset.visualFavorite);
      renderAssets();
    }
    if (viewButton) {
      view = viewButton.dataset.visualView;
      root.querySelectorAll("[data-visual-view]").forEach((button) => {
        const active = button === viewButton;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      renderAssets();
    }
    if (event.target.closest("[data-visual-more]")) {
      pageSize += 60;
      renderAssets();
    }
    if (event.target.closest("[data-random-current]")) {
      const context = activeConfig.dataset === "texture" ? { material: engine.getAsset("material", engine.builder.value.materialId) } : {};
      const item = engine.randomizer.randomCategory(activeConfig.dataset, { studioId, context });
      if (item) engine.select(activeConfig, item.id);
      renderPreview();
      renderAssets();
      showToast(`Random ${activeConfig.label.toLocaleLowerCase()} selected`, "success");
    }
    if (event.target.closest("[data-random-visual]")) {
      engine.randomAll(Date.now());
      renderPreview();
      renderAssets();
      showToast("Compatible visual direction randomized", "success");
    }
    if (event.target.closest("[data-save-visual]")) {
      const name = `${activeProjectType} direction ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date())}`;
      try {
        engine.savePreset(name);
        showToast("Visual preset saved on this device", "saved");
      } catch (error) {
        showToast(error.message, "error");
      }
    }
    if (event.target.closest("[data-apply-visual]")) {
      const visual = engine.builder.build();
      const result = engine.validator.validate(visual, studioId);
      if (!result.valid) {
        showToast(result.errors[0], "error");
        return;
      }
      onApply(visual, engine);
      showToast("Visual direction applied to your creation", "success");
    }
  });

  search.addEventListener("input", () => {
    pageSize = 60;
    renderAssets();
  });
  categoryFilter.addEventListener("change", () => {
    pageSize = 60;
    renderAssets();
  });
  templateSelect.addEventListener("change", () => {
    const visual = engine.templates.apply(templateSelect.value, engine.builder);
    engine.builder.merge(visual);
    renderPreview();
    renderAssets();
  });

  renderGroups();
  renderCategories();
  renderCategoryFilter();
  renderPreview();
  renderAssets();

  function load({ initial: nextInitial = null, projectType: nextProjectType = "Object" } = {}) {
    activeProjectType = nextProjectType;
    studioId = String(nextProjectType).toLocaleLowerCase().replace(/\s+/g, "-");
    allowedGroups = new Set(["color", "surface", "scene", ...(new Set(["Character", "Creature", "Mascot"]).has(nextProjectType) ? ["character", "features"] : [])]);
    engine.builder.replace(nextInitial || undefined);
    engine.builder.set("studioId", studioId);
    activeGroup = allowedGroups.has(activeGroup) ? activeGroup : "color";
    activeConfig = VISUAL_SELECTOR_CONFIG.find((config) => config.group === activeGroup) || VISUAL_SELECTOR_CONFIG[0];
    search.value = "";
    view = "all";
    pageSize = 60;
    root.querySelectorAll("[data-visual-view]").forEach((button) => {
      const active = button.dataset.visualView === "all";
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderGroups();
    renderCategories();
    renderCategoryFilter();
    renderPreview();
    renderAssets();
    return engine.builder.build();
  }

  return { engine, load, getVisual: () => engine.builder.build() };
}
