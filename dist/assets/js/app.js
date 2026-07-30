/**
 * Vyrelix Phase 1A entry point: initializes shell, routing, forms, and local data.
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
import { initializeBottomSheets } from "./components/bottomSheet.js";
import { initializeTabs } from "./components/tabs.js";
import { initializeLoading, setButtonLoading } from "./components/loading.js";
import { initializeGestures } from "./components/gestures.js";

const state = { step: 1, intensity: 3, filter: "all", query: "" };
const form = document.querySelector("#character-form");
const savedList = document.querySelector("#saved-list");
let navigation;

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
    data: { ...data, intensity: state.intensity }, createdAt: Date.now()
  };
}

function saveCharacter() {
  const characters = storage.getCharacters();
  characters.unshift(serializeCharacter());
  storage.saveCharacters(characters);
  storage.saveRecentActivity(characters.slice(0, 8));
  form.reset();
  state.step = 1;
  state.intensity = 3;
  document.querySelector("#intensity-output").textContent = "3";
  updateBuilder();
  refreshSaved();
  showToast("Character saved on this device");
  navigation.navigate("saved");
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
  return [...storage.getCharacters(), ...storage.getPrompts()]
    .filter((item) => state.filter === "all" || item.kind === state.filter)
    .filter((item) => item.title.toLowerCase().includes(state.query))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function refreshSaved() {
  const all = [...storage.getCharacters(), ...storage.getPrompts()];
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
      ? "Vyrelix is a focused workspace for developing original characters and visual ideas. AI features are intentionally not included in Phase 1A."
      : "Your Phase 1A data stays in this browser's local storage. Vyrelix does not send it to a server.");
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
    const button = event.target.closest("[data-delete-id]");
    if (!button) return;
    const method = button.dataset.deleteKind === "character" ? "Characters" : "Prompts";
    const getter = storage[`get${method}`];
    const setter = storage[`save${method}`];
    setter(getter().filter((item) => item.id !== button.dataset.deleteId));
    refreshSaved();
    showToast("Item removed");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { closeDialog(); closeSheet(); }
  });
}

navigation = createNavigation({ onRouteChange: (route) => { if (route === "saved") refreshSaved(); } });
const settings = initializeSettings(() => openDialog("Clear local storage?", "This removes all saved characters, prompts, history, and preferences from this device.", { destructive: true }));
document.querySelector("#confirm-clear").addEventListener("click", () => {
  const action = document.querySelector("#dialog").dataset.action;
  if (action === "clear-storage") {
    storage.clear(); refreshSaved(); settings.reset(); closeDialog(); showToast("Local storage cleared", "deleted");
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
  getItems: () => [...storage.getCharacters(), ...storage.getPrompts()],
  onQuery: debounce((query) => { state.query = query; refreshSaved(); }, 100)
});
initializeGestures({ showToast, onPullRefresh: refreshSaved });
updateBuilder();
refreshSaved();
launch();
