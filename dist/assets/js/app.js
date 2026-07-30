/**
 * Vyrelix application entry point: composes the existing shell with the Universal Creation Engine.
 */
import { createNavigation } from "./navigation.js";
import { storage } from "./storage.js";
import { copyText } from "./clipboard.js";
import { initializeSettings } from "./settings.js";
import { initializeRipples } from "./animations.js";
import { showToast, openDialog, closeDialog, openSheet, closeSheet, renderSaved } from "./ui.js";
import { validateRequired } from "../utilities/validators.js";
import { createId, debounce } from "../utilities/helpers.js";
import { clamp } from "../utilities/random.js";
import { initializeButtons } from "./components/buttons.js";
import { initializeCards } from "./components/cards.js";
import { initializeForms, createSearchController } from "./components/forms.js";
import { initializeModals, openModal } from "./components/modals.js";
import { initializeDrawers } from "./components/drawer.js";
import { initializeBottomSheets, openBottomSheet, closeBottomSheet } from "./components/bottomSheet.js";
import { initializeTabs } from "./components/tabs.js";
import { initializeLoading, setButtonLoading } from "./components/loading.js";
import { initializeGestures } from "./components/gestures.js";
import { creationEngine } from "./core/creationEngine.js";
import { initializeDashboard } from "./core/dashboard.js";

const state = { step: 1, intensity: 3, filter: "all", query: "", visual: null, visualMeta: null };
const form = document.querySelector("#character-form");
const savedList = document.querySelector("#saved-list");
let navigation;
let visualStudioPromise = null;
let promptStudioPromise = null;
let aiStudioPromise = null;

function launch() {
  const splash = document.querySelector("#splash");
  const loading = document.querySelector("#loading");
  const shell = document.querySelector("#app-shell");
  const progress = document.querySelector("#launch-progress");
  const seen = sessionStorage.getItem("vyrelix.seen");
  const splashDelay = seen ? 80 : 950;
  window.setTimeout(() => {
    splash.classList.add("is-hidden");
    loading.classList.remove("is-hidden");
    requestAnimationFrame(() => { progress.style.width = "100%"; });
    window.setTimeout(() => {
      loading.classList.add("is-hidden");
      shell.classList.remove("is-hidden");
      sessionStorage.setItem("vyrelix.seen", "true");
    }, seen ? 160 : 700);
  }, splashDelay);
}

function updateBuilder() {
  document.querySelectorAll(".builder-step").forEach((step) => step.classList.toggle("is-active", Number(step.dataset.step) === state.step));
  document.querySelector("#step-number").textContent = String(state.step).padStart(2, "0");
  document.querySelector("#builder-progress").style.width = `${state.step / 3 * 100}%`;
  document.querySelector(".progress--steps").setAttribute("aria-valuenow", String(state.step));
  document.querySelector("#builder-back").disabled = state.step === 1;
  document.querySelector("#builder-next").textContent = state.step === 3 ? "Save character" : "Continue";
}

function serializeCharacter() {
  const data = Object.fromEntries(new FormData(form));
  return {
    id: createId("character"), kind: "character",
    title: data.name?.trim() || "Untitled character",
    subtitle: `${data.archetype || "Original concept"} · just now`,
    data: { ...data, intensity: state.intensity, visual: state.visual }, createdAt: Date.now()
  };
}

function saveCharacter() {
  const character = serializeCharacter();
  let project;
  try {
    project = creationEngine.projects.create({
      name: character.title,
      type: "Character",
      category: character.data.archetype || "Original",
      description: character.data.concept || "",
      tags: [],
      theme: state.visualMeta?.mood || character.data.presence || "Original",
      artStyle: state.visualMeta?.artStyle || "Character concept",
      colorPalette: state.visual ? Object.values(state.visual.colors) : character.data.color ? [character.data.color] : [],
      data: { ...character.data, legacyCharacterId: character.id }
    });
  } catch (error) {
    showToast(error.message, "error");
    return;
  }
  const characters = storage.getCharacters();
  characters.unshift({ ...character, projectId: project.id });
  storage.saveCharacters(characters);
  storage.saveRecentActivity(characters.slice(0, 8));
  form.reset();
  state.step = 1;
  state.intensity = 3;
  state.visual = null;
  state.visualMeta = null;
  document.querySelector("#intensity-output").textContent = "3";
  updateBuilder();
  refreshSaved();
  document.dispatchEvent(new CustomEvent("vyrelix:projects-changed"));
  showToast("Character saved on this device");
  navigation.navigate("prompt");
}

async function ensureVisualStudio() {
  if (visualStudioPromise) return visualStudioPromise;
  visualStudioPromise = import("./visual/visualUI.js").then(({ initializeVisualStudio }) =>
    initializeVisualStudio({
      root: document.querySelector('[data-screen="visual"]'),
      initial: state.visual,
      showToast,
      onApply: (visual, engine) => {
        state.visual = visual;
        state.visualMeta = {
          primary: engine.getAsset("color", visual.colors.primaryId)?.name,
          artStyle: engine.getAsset("artStyle", visual.artStyleId)?.name,
          mood: engine.getAsset("mood", visual.moodId)?.name
        };
        const colorOption = [...form.elements.color.options].find((option) => option.textContent.toLocaleLowerCase() === state.visualMeta.primary?.toLocaleLowerCase());
        if (colorOption) form.elements.color.value = colorOption.value;
        navigation.navigate("builder");
      }
    })
  ).catch((error) => {
    visualStudioPromise = null;
    showToast("Visual Engine could not be loaded", "error");
    throw error;
  });
  return visualStudioPromise;
}

/**
 * Lazily opens the complete local prompt-generation workspace.
 */
async function ensurePromptStudio() {
  if (promptStudioPromise) return promptStudioPromise;
  promptStudioPromise = import("./prompt/promptUI.js").then(({ initializePromptStudio }) =>
    initializePromptStudio({
      engine: creationEngine,
      navigate: navigation.navigate,
      showToast,
      onPromptsChanged: () => {
        refreshSaved();
        document.dispatchEvent(new CustomEvent("vyrelix:prompts-changed"));
      }
    })
  ).catch((error) => {
    promptStudioPromise = null;
    showToast("Prompt Studio could not be loaded", "error");
    throw error;
  });
  return promptStudioPromise;
}

/**
 * Lazily opens the offline-first AI Provider Engine.
 */
async function ensureAIStudio() {
  if (aiStudioPromise) return aiStudioPromise;
  aiStudioPromise = import("./ai/aiUI.js").then(({ initializeAIStudio }) =>
    initializeAIStudio({
      creationEngine,
      navigate: navigation.navigate,
      showToast,
      openModal
    })
  ).catch((error) => {
    aiStudioPromise = null;
    showToast("AI Provider Engine could not be loaded", "error");
    throw error;
  });
  return aiStudioPromise;
}

function handleNext() {
  if (state.step === 1) {
    const field = form.elements.name;
    const error = validateRequired(field.value, "Add a character name to continue.");
    document.querySelector('[data-error-for="name"]').textContent = error;
    field.closest(".field").classList.toggle("has-error", Boolean(error));
    if (error) { field.focus(); return; }
  }
  if (state.step < 3) { state.step += 1; updateBuilder(); }
  else saveCharacter();
}

function getSavedItems() {
  const projects = creationEngine.projects.list({ includeArchived: true }).map((project) => ({
    ...project,
    kind: "project",
    title: project.name,
    subtitle: `${project.type} · ${project.status} · ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(project.modifiedAt))}`,
    createdAt: new Date(project.createdAt).getTime()
  }));
  return [...projects, ...storage.getPrompts()]
    .filter((item) => state.filter === "all" || (state.filter === "archived" ? item.status === "archived" : item.kind === state.filter && item.status !== "archived"))
    .filter((item) => item.title.toLowerCase().includes(state.query))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function refreshSaved() {
  const all = [...creationEngine.projects.list({ includeArchived: true }), ...storage.getPrompts()];
  document.querySelector("#saved-count").textContent = `${all.length} item${all.length === 1 ? "" : "s"}`;
  renderSaved(getSavedItems(), savedList);
}

function bindEvents() {
  document.querySelector("#builder-next").addEventListener("click", handleNext);
  document.querySelector("#builder-back").addEventListener("click", () => { state.step = Math.max(1, state.step - 1); updateBuilder(); });
  document.querySelector("#save-draft").addEventListener("click", () => { saveCharacter(); });
  form.elements.concept.addEventListener("input", (event) => { document.querySelector("#concept-count").textContent = event.target.value.length; });
  form.elements.detail.addEventListener("input", (event) => {
    document.querySelector("#detail-output").textContent = ["Minimal", "Balanced", "Intricate"][Number(event.target.value) - 1];
  });
  document.querySelectorAll("[data-number-action]").forEach((button) => button.addEventListener("click", () => {
    state.intensity = clamp(state.intensity + Number(button.dataset.numberAction), 1, 5);
    document.querySelector("#intensity-output").textContent = String(state.intensity);
  }));
  document.querySelectorAll("[data-prompt-token]").forEach((button) => button.addEventListener("click", () => {
    const area = document.querySelector("#prompt-draft");
    area.value = `${area.value}${area.value.trim() ? ", " : ""}${button.dataset.promptToken}`;
    button.classList.add("is-active");
  }));
  document.querySelector("#copy-prompt").addEventListener("click", async () => {
    showToast(await copyText(document.querySelector("#prompt-draft").value) ? "Prompt draft copied" : "Add a prompt draft first");
  });
  document.querySelector("#save-prompt").addEventListener("click", () => {
    const text = document.querySelector("#prompt-draft").value.trim();
    if (!text) { showToast("Add a prompt draft first"); return; }
    const prompts = storage.getPrompts();
    prompts.unshift({ id: createId("prompt"), kind: "prompt", title: text.slice(0, 42), subtitle: "Prompt draft · just now", text, createdAt: Date.now() });
    storage.savePrompts(prompts);
    refreshSaved();
    showToast("Prompt draft saved");
  });
  document.querySelector("#open-sheet").addEventListener("click", openSheet);
  document.querySelectorAll("[data-close-sheet]").forEach((button) => button.addEventListener("click", closeSheet));
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeDialog));
  document.querySelectorAll("[data-dialog]").forEach((button) => button.addEventListener("click", () => {
    const isAbout = button.dataset.dialog === "about";
    openDialog(isAbout ? "About Vyrelix" : "Privacy", isAbout
      ? "Vyrelix is a focused workspace for developing original characters, visual systems, professional prompts, and clearly labeled demo artwork through an offline Mock Provider."
      : "Your projects, prompts, provider settings, and demo images stay in this browser. Mock Provider uses no network connection.");
  }));
  document.querySelector("#notifications-button").addEventListener("click", () => showToast("You’re all caught up"));
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    refreshSaved();
  }));
  savedList.addEventListener("click", (event) => {
    const projectAction = event.target.closest("[data-project-action]");
    if (projectAction) {
      handleProjectAction(projectAction.dataset.projectAction, projectAction.dataset.projectId);
      return;
    }
    const button = event.target.closest("[data-delete-id]");
    if (!button) return;
    const method = button.dataset.deleteKind === "character" ? "Characters" : "Prompts";
    const getter = storage[`get${method}`];
    if (method === "Prompts") storage.removePrompt(button.dataset.deleteId);
    else storage[`save${method}`](getter().filter((item) => item.id !== button.dataset.deleteId));
    refreshSaved();
    showToast("Item removed");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { closeDialog(); closeSheet(); }
  });
}

function migrateLegacyCharacters() {
  const projects = creationEngine.projects.list();
  storage.getCharacters().forEach((character) => {
    if (projects.some((project) => project.id === character.projectId || project.data?.legacyCharacterId === character.id)) return;
    try {
      creationEngine.projects.create({
        name: character.title,
        type: "Character",
        category: character.data?.archetype || "Original",
        description: character.data?.concept || "",
        theme: character.data?.presence || "Original",
        artStyle: "Character concept",
        colorPalette: character.data?.color ? [character.data.color] : [],
        data: { ...character.data, legacyCharacterId: character.id }
      });
    } catch {
      /* Duplicate legacy names remain safely stored in the Phase 1 collection. */
    }
  });
}

function handleProjectAction(action, id) {
  const project = creationEngine.projects.get(id);
  if (!project) return;
  try {
    if (action === "favorite") creationEngine.projects.favorite(id);
    if (action === "menu") {
      const labels = project.status === "archived" ? ["Restore", "Delete"] : ["Rename", "Duplicate", "Archive", "Delete"];
      const content = labels.map((label) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `button button--wide ${label === "Delete" ? "button--danger" : "button--outlined"}`;
        button.dataset.projectMenuAction = label.toLocaleLowerCase();
        button.dataset.projectId = id;
        button.textContent = label;
        return button;
      });
      openBottomSheet({ heading: project.name, content });
      return;
    }
    refreshSaved();
    document.dispatchEvent(new CustomEvent("vyrelix:projects-changed"));
  } catch (error) {
    showToast(error.message, "error");
  }
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project-menu-action]");
  if (!button) return;
  const action = button.dataset.projectMenuAction;
  const id = button.dataset.projectId;
  const project = creationEngine.projects.get(id);
  try {
    if (action === "rename") {
      const name = window.prompt("Rename project", project.name);
      if (name?.trim()) creationEngine.projects.rename(id, name);
    }
    if (action === "duplicate") creationEngine.projects.duplicate(id);
    if (action === "archive") creationEngine.projects.archive(id);
    if (action === "restore") creationEngine.projects.restore(id);
    if (action === "delete" && window.confirm(`Delete ${project.name}? This cannot be undone.`)) creationEngine.projects.delete(id);
    closeBottomSheet();
    refreshSaved();
    document.dispatchEvent(new CustomEvent("vyrelix:projects-changed"));
    const messages = { rename: "Project renamed", duplicate: "Project duplicated", archive: "Project archived", restore: "Project restored", delete: "Project deleted" };
    showToast(messages[action] || "Project updated", action === "delete" ? "deleted" : "success");
  } catch (error) {
    showToast(error.message, "error");
  }
});

navigation = createNavigation({ onRouteChange: (route) => {
  if (route === "saved") refreshSaved();
  if (route === "visual") ensureVisualStudio();
  if (["prompt", "prompt-preview", "prompt-history", "ai-image", "image-gallery", "provider-settings", "test-mode"].includes(route)) {
    ensurePromptStudio().then((controller) => {
      if (route === "prompt-history") controller.renderHistory();
    });
  }
  if (["ai-image", "image-gallery", "provider-settings", "test-mode"].includes(route)) {
    ensureAIStudio().then((controller) => {
      if (route === "ai-image") controller.renderGenerator();
      if (route === "image-gallery") controller.renderGallery();
      if (route === "provider-settings") controller.renderProviders();
    });
  }
} });
migrateLegacyCharacters();
initializeDashboard({ engine: creationEngine, navigate: navigation.navigate, showToast });
const settings = initializeSettings(() => openDialog("Clear local storage?", "This removes all saved characters, prompts, history, and preferences from this device.", { destructive: true }));
document.querySelector("#confirm-clear").addEventListener("click", () => {
  const action = document.querySelector("#dialog").dataset.action;
  if (action === "clear-storage") {
    storage.clear(); refreshSaved(); settings.reset(); closeDialog(); document.dispatchEvent(new CustomEvent("vyrelix:projects-changed")); showToast("Local storage cleared", "deleted");
  } else {
    closeDialog();
    showToast(action === "demo-delete" ? "Delete pattern confirmed" : "Action confirmed", action === "demo-delete" ? "deleted" : "success");
  }
});
initializeRipples();
bindEvents();
initializeModals();
initializeBottomSheets();
initializeDrawers();
initializeTabs();
initializeForms();
initializeLoading();
initializeButtons({ showToast, openModal, setLoading: setButtonLoading });
initializeCards({ openModal });
createSearchController({
  input: document.querySelector("#saved-search"),
  suggestions: document.querySelector("#search-suggestions"),
  clearButton: document.querySelector("[data-search-clear]"),
  getItems: () => getSavedItems(),
  onQuery: debounce((query) => { state.query = query; refreshSaved(); }, 100)
});
initializeGestures({ showToast, onPullRefresh: refreshSaved });
updateBuilder();
refreshSaved();
launch();
