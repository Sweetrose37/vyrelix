/**
 * Lazily loaded mobile interface for generation, preview, history, export, and test mode.
 */
import { PromptStorage } from "./promptStorage.js";
import { PromptHistory } from "./promptHistory.js";
import { PromptSearch } from "./promptSearch.js";
import { listPromptTemplates } from "./promptTemplates.js";
import { renderPromptPreview } from "./promptPreview.js";
import { GeneratorManager } from "../generator/generatorManager.js";
import { RandomGenerator } from "../generator/randomGenerator.js";
import { updateLivePreview } from "../generator/livePreview.js";
import { setGenerateState, updateGenerateAvailability } from "../generator/generateButton.js";
import { copyPromptPart } from "../export/copyManager.js";
import { exportPrompt } from "./promptExporter.js";
import { saveNegativePreset, DEFAULT_NEGATIVE_TERMS } from "./negativePromptEngine.js";

/** Escapes dynamic text before history-card interpolation. */
function escape(value) {
  const node = document.createElement("span");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

/** Reads generation settings from the prompt form. */
function readSettings(form) {
  const values = Object.fromEntries(new FormData(form));
  return {
    ...values,
    negativeEnabled: form.elements.negativeEnabled.checked,
    seed: Number(values.seed) || undefined
  };
}

/** Creates the prompt studio and returns its public controller. */
export function initializePromptStudio({ engine, navigate, showToast, onPromptsChanged = () => {} }) {
  const form = document.querySelector("#prompt-form");
  const projectSelect = form.elements.projectId;
  const generateButton = document.querySelector("#generate-prompt");
  const liveRoot = document.querySelector("#prompt-live-preview");
  const previewRoot = document.querySelector('[data-screen="prompt-preview"]');
  const historyRoot = document.querySelector("#prompt-history-list");
  const storage = new PromptStorage();
  const history = new PromptHistory(storage);
  const search = new PromptSearch();
  let manager;
  let random;
  let currentRecord = storage.list()[0] || null;
  let liveTimer = 0;

  /** Populates future-registerable prompt types. */
  function renderTypes() {
    form.elements.promptType.replaceChildren(...listPromptTemplates().map((template) => {
      const option = document.createElement("option");
      option.value = template.id;
      option.textContent = template.name;
      return option;
    }));
  }

  /** Populates active universal projects without duplicating project state. */
  function renderProjects(preferredId = projectSelect.value) {
    const projects = engine.projects.list();
    const options = [new Option("Choose a saved project", "")];
    projects.forEach((project) => options.push(new Option(`${project.name} · ${project.studio}`, project.id)));
    projectSelect.replaceChildren(...options);
    projectSelect.value = projects.some((project) => project.id === preferredId) ? preferredId : projects[0]?.id || "";
    updateGenerateAvailability(generateButton, Boolean(projectSelect.value));
  }

  /** Applies a stored project draft to matching form controls. */
  function loadDraft() {
    const draft = storage.getDraft(projectSelect.value);
    if (!draft) return;
    Object.entries(draft).forEach(([name, value]) => {
      const control = form.elements[name];
      if (!control) return;
      if (control.type === "checkbox") control.checked = Boolean(value);
      else control.value = value ?? "";
    });
  }

  /** Persists current draft inputs and refreshes only preview nodes. */
  function refreshLive() {
    window.clearTimeout(liveTimer);
    liveTimer = window.setTimeout(() => {
      const projectId = projectSelect.value;
      const settings = readSettings(form);
      if (projectId) storage.saveDraft(projectId, settings);
      currentRecord = updateLivePreview(manager, projectId, settings, liveRoot) || currentRecord;
      updateGenerateAvailability(generateButton, Boolean(projectId));
    }, 80);
  }

  /** Renders the dedicated prompt preview. */
  function renderCurrent() {
    renderPromptPreview(currentRecord, previewRoot);
    previewRoot.querySelector("[data-preview-title]").textContent = currentRecord?.title || "Prompt preview";
    previewRoot.querySelector("[data-preview-type]").textContent = currentRecord?.promptType?.replace(/-/g, " ") || "Ready";
    previewRoot.querySelector("[data-favorite-prompt]").setAttribute("aria-pressed", String(Boolean(currentRecord?.favorite)));
  }

  /** Renders searchable history with metadata and actions. */
  function renderHistory(query = "") {
    const items = search.query(history.search(query), query, 120);
    document.querySelector("#prompt-history-count").textContent = `${items.length} prompt${items.length === 1 ? "" : "s"}`;
    if (!items.length) {
      historyRoot.innerHTML = '<div class="prompt-empty"><strong>No prompts found</strong><small>Generate a prompt or try another search.</small></div>';
      return;
    }
    historyRoot.innerHTML = items.map((item) => `
      <article class="prompt-history-card" data-prompt-id="${escape(item.id)}">
        <button class="prompt-history-card__main" type="button" data-prompt-action="open" aria-label="Open ${escape(item.title)}">
          <span class="prompt-history-card__date">${escape(new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(item.createdAt)))}</span>
          <strong>${escape(item.title)}</strong>
          <small>${escape(item.studio)} · ${escape(item.promptType.replace(/-/g, " "))}</small>
        </button>
        <div class="prompt-history-card__actions">
          <button type="button" data-prompt-action="favorite" aria-label="${item.favorite ? "Remove from" : "Add to"} favorites" aria-pressed="${Boolean(item.favorite)}">${item.favorite ? "♥" : "♡"}</button>
          <button type="button" data-prompt-action="duplicate" aria-label="Duplicate prompt">⧉</button>
          <button type="button" data-prompt-action="rename" aria-label="Rename prompt">✎</button>
          <button type="button" data-prompt-action="delete" aria-label="Delete prompt">×</button>
        </div>
      </article>`).join("");
  }

  /** Generates, stores, previews, and announces a professional prompt. */
  async function generate() {
    setGenerateState(generateButton, "loading");
    generateButton.disabled = true;
    await new Promise((resolve) => window.setTimeout(resolve, 260));
    try {
      currentRecord = manager.generate(projectSelect.value, readSettings(form));
      renderCurrent();
      renderHistory();
      onPromptsChanged();
      setGenerateState(generateButton, "success");
      navigate("prompt-preview");
      window.setTimeout(() => setGenerateState(generateButton, "idle"), 1100);
    } catch (error) {
      setGenerateState(generateButton, "idle");
      showToast(error.message, "error");
    } finally {
      updateGenerateAvailability(generateButton, Boolean(projectSelect.value));
    }
  }

  /** Handles copy and export actions on the active prompt. */
  async function handlePreviewAction(button) {
    if (!currentRecord) {
      showToast("Generate a prompt first", "error");
      return;
    }
    const copyPart = button.dataset.copyPart;
    if (copyPart) {
      showToast(await copyPromptPart(currentRecord, copyPart) ? "Copied to clipboard" : "Nothing to copy");
      return;
    }
    if (button.dataset.exportFormat) {
      exportPrompt(currentRecord, button.dataset.exportFormat);
      showToast(`${button.dataset.exportFormat.toUpperCase()} export prepared`);
    }
  }

  /** Handles history open, favorite, duplicate, rename, and delete actions. */
  function handleHistoryAction(button) {
    const id = button.closest("[data-prompt-id]")?.dataset.promptId;
    if (!id) return;
    const action = button.dataset.promptAction;
    try {
      if (action === "open") {
        currentRecord = storage.get(id);
        renderCurrent();
        navigate("prompt-preview");
        return;
      }
      if (action === "favorite") storage.toggleFavorite(id);
      if (action === "duplicate") history.duplicate(id);
      if (action === "rename") {
        const name = window.prompt("Rename prompt", storage.get(id)?.title || "");
        if (name?.trim()) history.rename(id, name);
      }
      if (action === "delete" && window.confirm("Delete this generated prompt?")) history.remove(id);
      renderHistory(document.querySelector("#prompt-history-search").value);
      onPromptsChanged();
      showToast(action === "delete" ? "Prompt deleted" : "Prompt updated");
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  /** Runs developer-only demo and stress-test commands locally. */
  function handleTestAction(action) {
    try {
      if (action === "sample-character" || action === "demo-project") {
        const sample = random.completeProject();
        const suffix = Date.now().toString(36).slice(-4);
        const project = engine.projects.create({ ...sample, name: `${sample.name || "Demo Character"} ${suffix}` });
        renderProjects(project.id);
        refreshLive();
        showToast("Demo character project loaded");
      }
      if (action === "sample-prompt") generate();
      if (action === "stress") {
        const projectId = projectSelect.value;
        if (!projectId) throw new Error("Load a demo project first.");
        const start = performance.now();
        for (let index = 0; index < 250; index += 1) manager.generate(projectId, { ...random.prompt(), seed: index + 1 }, { save: false });
        document.querySelector("#test-mode-status").textContent = `250 prompts validated in ${Math.round(performance.now() - start)} ms.`;
      }
      if (action === "reset") {
        storage.reset();
        currentRecord = null;
        renderHistory();
        renderCurrent();
        onPromptsChanged();
        document.querySelector("#test-mode-status").textContent = "Demo prompt data reset.";
        showToast("Demo prompt data reset", "deleted");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  renderTypes();
  return engine.modules.load("visual-engine").then(({ VisualEngine }) => {
    const visualEngine = new VisualEngine();
    manager = new GeneratorManager({ projects: engine.projects, visualEngine, storage });
    random = new RandomGenerator({ engine, visualEngine });
    renderProjects();
    form.elements.negativePrompt.value = DEFAULT_NEGATIVE_TERMS.join(", ");
    loadDraft();
    refreshLive();
    renderCurrent();

    form.addEventListener("input", refreshLive);
    form.addEventListener("change", () => {
      if (document.activeElement === projectSelect) loadDraft();
      refreshLive();
    });
    generateButton.addEventListener("click", generate);
    document.querySelector("[data-random-prompt]").addEventListener("click", () => {
      Object.entries(random.prompt()).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; });
      refreshLive();
      showToast("Compatible prompt direction randomized");
    });
    document.querySelector("[data-save-negative]").addEventListener("click", () => {
      const name = window.prompt("Name this negative prompt preset", "Quality Guard");
      if (name?.trim()) {
        saveNegativePreset(storage, name, form.elements.negativePrompt.value);
        showToast("Negative prompt preset saved");
      }
    });
    document.querySelectorAll("[data-copy-part], [data-export-format]").forEach((button) => button.addEventListener("click", () => handlePreviewAction(button)));
    document.querySelector("[data-favorite-prompt]").addEventListener("click", () => {
      if (!currentRecord) return;
      currentRecord = storage.toggleFavorite(currentRecord.id);
      renderCurrent();
      renderHistory();
      onPromptsChanged();
      showToast(currentRecord.favorite ? "Added to favorites" : "Removed from favorites");
    });
    document.querySelector("#prompt-history-search").addEventListener("input", (event) => renderHistory(event.target.value));
    historyRoot.addEventListener("click", (event) => {
      const button = event.target.closest("[data-prompt-action]");
      if (button) handleHistoryAction(button);
    });
    document.querySelectorAll("[data-test-action]").forEach((button) => button.addEventListener("click", () => handleTestAction(button.dataset.testAction)));
    document.querySelector("[data-open-ai-panel]").addEventListener("click", () => navigate("ai-image"));
    document.addEventListener("vyrelix:projects-changed", () => renderProjects());
    return { storage, manager, refreshProjects: renderProjects, renderHistory };
  });
}
