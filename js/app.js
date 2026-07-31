/**
 * Vyrelix launch application: composes the universal creation, project,
 * visual-direction, prompt, collection, and device settings experiences.
 */
import { createNavigation } from "./navigation.js";
import { storage } from "./storage.js";
import { initializeSettings } from "./settings.js";
import { initializeRipples } from "./animations.js";
import { showToast, openDialog, closeDialog, renderSaved } from "./ui.js";
import { initializeModals } from "./components/modals.js";
import { initializeBottomSheets, openBottomSheet, closeBottomSheet } from "./components/bottomSheet.js";
import { initializeForms, createSearchController } from "./components/forms.js";
import { initializeLoading } from "./components/loading.js";
import { debounce } from "../utilities/helpers.js";
import { creationEngine } from "./core/creationEngine.js";
import { initializeDashboard } from "./core/dashboard.js";
import { downloadProject } from "./project/projectExporter.js";
import { readProjectFile } from "./project/projectImporter.js";
import { APP_VERSION } from "../utilities/constants.js";

const state = { filter: "all", query: "" };
const savedList = document.querySelector("#saved-list");
const projectScreen = document.querySelector('[data-screen="project"]');
let navigation;
let creationController;
let promptController;
let visualController;
let visualProjectId = "";
let pendingCreationOptions = null;

const modeNames = Object.freeze({
  "dual-experience": "Universal Creative Engine",
  quick: "Quick Create",
  guided: "Creative Builder",
  advanced: "Advanced Creator",
  director: "Creative Director",
  inspire: "Inspire Me",
  templates: "Templates",
  reference: "Reference Mode"
});

function activeProject() {
  const id = creationEngine.settings.get().activeProjectId;
  return creationEngine.projects.get(id) || creationEngine.projects.list()[0] || null;
}

function setActiveProject(id) {
  creationEngine.settings.set({ activeProjectId: id });
}

function readableLabel(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function answerList(project) {
  return Object.entries(project?.data?.answers || {})
    .filter(([, value]) => String(value ?? "").trim())
    .map(([key, value]) => [readableLabel(key), String(value)]);
}

function renderProject() {
  const project = activeProject();
  if (!project) {
    projectScreen.querySelector("#project-detail-title").textContent = "No project selected";
    projectScreen.querySelector("#project-detail-description").textContent = "Start a creation to build your first adaptive project.";
    projectScreen.querySelector("#project-detail-meta").replaceChildren();
    projectScreen.querySelector("#project-detail-answers").innerHTML = '<div class="empty-state empty-state--compact"><h3>Your creative work starts here</h3><p>Vyrelix will keep every answer organized on this device.</p><button class="button button--primary" type="button" data-route="create" data-create-reset>Start creating</button></div>';
    projectScreen.querySelectorAll("[data-project-detail-favorite], [data-project-edit], [data-project-continue], [data-project-export], [data-project-duplicate], [data-project-archive]").forEach((button) => {
      button.disabled = true;
    });
    return;
  }

  projectScreen.querySelectorAll("button").forEach((button) => { button.disabled = false; });
  projectScreen.querySelector("#project-detail-title").textContent = project.name;
  projectScreen.querySelector("#project-detail-type").textContent = project.category || project.type;
  projectScreen.querySelector("#project-detail-description").textContent = project.description;
  projectScreen.querySelector("#project-detail-mark").textContent = (project.category || project.type || "V").slice(0, 1).toUpperCase();
  const favorite = projectScreen.querySelector("[data-project-detail-favorite]");
  favorite.textContent = project.favorite ? "♥" : "♡";
  favorite.setAttribute("aria-pressed", String(project.favorite));
  favorite.setAttribute("aria-label", `${project.favorite ? "Remove" : "Add"} project ${project.favorite ? "from" : "to"} favorites`);
  projectScreen.querySelector("[data-project-archive]").textContent = project.status === "archived" ? "Restore" : "Archive";
  if (project.status === "archived") {
    projectScreen.querySelector("[data-project-detail-favorite]").disabled = true;
    projectScreen.querySelector("[data-project-edit]").disabled = true;
    projectScreen.querySelector('[data-project-continue="visual"]').disabled = true;
  }

  const meta = [
    ["Mode", modeNames[project.data?.creationMode] || "Adaptive"],
    ["Status", project.status],
    ["Updated", new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(project.modifiedAt))]
  ];
  projectScreen.querySelector("#project-detail-meta").replaceChildren(...meta.map(([term, value]) => {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    wrapper.append(dt, dd);
    return wrapper;
  }));

  const answers = answerList(project);
  const root = projectScreen.querySelector("#project-detail-answers");
  root.replaceChildren(...(answers.length ? answers.map(([label, value]) => {
    const item = document.createElement("article");
    const heading = document.createElement("strong");
    const copy = document.createElement("p");
    heading.textContent = label;
    copy.textContent = value;
    item.append(heading, copy);
    return item;
  }) : [Object.assign(document.createElement("p"), { className: "text-muted", textContent: "No additional answers were saved for this project." })]));
}

function uniqueCopyName(project) {
  const names = new Set(creationEngine.projects.list({ includeArchived: true }).map((item) => item.name.toLocaleLowerCase()));
  let count = 1;
  let candidate = `${project.name} Copy`;
  while (names.has(candidate.toLocaleLowerCase())) {
    count += 1;
    candidate = `${project.name} Copy ${count}`;
  }
  return candidate;
}

function announceProjectsChanged() {
  document.dispatchEvent(new CustomEvent("vyrelix:projects-changed"));
  refreshSaved();
  renderProject();
}

function getSavedItems() {
  const projects = creationEngine.projects.list({ includeArchived: true }).map((project) => ({
    ...project,
    kind: "project",
    title: project.name,
    subtitle: `${project.category || project.type} · ${project.status} · ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(project.modifiedAt))}`,
    createdAt: new Date(project.modifiedAt).getTime()
  }));
  return [...projects, ...storage.getPrompts()]
    .filter((item) => state.filter === "all" || (state.filter === "archived" ? item.status === "archived" : item.kind === state.filter && item.status !== "archived"))
    .filter((item) => item.title.toLocaleLowerCase().includes(state.query))
    .sort((left, right) => right.createdAt - left.createdAt);
}

function refreshSaved() {
  const items = getSavedItems();
  document.querySelector("#saved-count").textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
  renderSaved(items, savedList);
}

async function ensureCreationExperience() {
  if (creationController) return creationController;
  const { initializeCreationExperience } = await import("./creation/creationExperience.js");
  creationController = initializeCreationExperience({
    root: document.querySelector('[data-screen="create"]'),
    engine: creationEngine,
    navigate: navigation.navigate,
    showToast
  });
  return creationController;
}

async function ensurePromptStudio() {
  if (promptController) return promptController;
  const { initializePromptStudio } = await import("./prompt/promptUI.js");
  promptController = await initializePromptStudio({
    engine: creationEngine,
    navigate: navigation.navigate,
    showToast,
    onPromptsChanged: refreshSaved
  });
  return promptController;
}

async function ensureVisualStudio() {
  const project = activeProject();
  if (visualController) {
    if (visualProjectId !== project?.id) {
      visualController.load({ initial: project?.data?.visual, projectType: project?.type || "Object" });
      visualProjectId = project?.id || "";
    }
    return visualController;
  }
  const { initializeVisualStudio } = await import("./visual/visualUI.js");
  visualController = initializeVisualStudio({
    root: document.querySelector('[data-screen="visual"]'),
    initial: project?.data?.visual,
    projectType: project?.type || "Object",
    showToast,
    onApply: (visual, engine) => {
      const current = activeProject();
      if (!current) return;
      const primary = engine.getAsset("color", visual.colors.primaryId)?.name;
      creationEngine.projects.update(current.id, {
        data: { ...current.data, visual },
        colorPalette: primary ? [primary] : current.colorPalette,
        artStyle: engine.getAsset("artStyle", visual.artStyleId)?.name || current.artStyle,
        theme: engine.getAsset("mood", visual.moodId)?.name || current.theme
      }, "visual direction updated");
      announceProjectsChanged();
      navigation.navigate("project");
    }
  });
  visualProjectId = project?.id || "";
  return visualController;
}

function openProject(id) {
  const project = creationEngine.projects.get(id);
  if (!project) return;
  setActiveProject(id);
  renderProject();
  navigation.navigate("project");
}

function bindProjectActions() {
  projectScreen.addEventListener("click", async (event) => {
    const project = activeProject();
    if (!project) return;
    try {
      if (event.target.closest("[data-project-detail-favorite]")) {
        creationEngine.projects.favorite(project.id);
        announceProjectsChanged();
      }
      if (event.target.closest("[data-project-edit]")) {
        const controller = await ensureCreationExperience();
        controller.resumeProject(project);
        navigation.navigate("create");
      }
      if (event.target.closest('[data-project-continue="prompt"]')) {
        setActiveProject(project.id);
        const controller = await ensurePromptStudio();
        controller.selectProject?.(project.id);
        navigation.navigate("prompt");
      }
      if (event.target.closest('[data-project-continue="visual"]')) {
        setActiveProject(project.id);
        await ensureVisualStudio();
        navigation.navigate("visual");
      }
      if (event.target.closest("[data-project-export]")) {
        downloadProject(project);
        showToast("Project export prepared");
      }
      if (event.target.closest("[data-project-duplicate]")) {
        const copy = creationEngine.projects.duplicate(project.id, uniqueCopyName(project));
        setActiveProject(copy.id);
        announceProjectsChanged();
        showToast("Project duplicated");
      }
      if (event.target.closest("[data-project-archive]")) {
        if (project.status === "archived") creationEngine.projects.restore(project.id);
        else creationEngine.projects.archive(project.id);
        announceProjectsChanged();
        navigation.navigate("saved");
        showToast(project.status === "archived" ? "Project restored" : "Project archived");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  });

}

function bindSavedActions() {
  savedList.addEventListener("click", (event) => {
    const open = event.target.closest("[data-project-open]");
    if (open) {
      openProject(open.dataset.projectOpen);
      return;
    }
    const remove = event.target.closest("[data-delete-id]");
    if (remove?.dataset.deleteKind === "prompt") {
      storage.removePrompt(remove.dataset.deleteId);
      refreshSaved();
      showToast("Prompt deleted", "deleted");
      return;
    }
    const action = event.target.closest("[data-project-action]");
    if (!action) return;
    const project = creationEngine.projects.get(action.dataset.projectId);
    if (!project) return;
    try {
      if (action.dataset.projectAction === "favorite") creationEngine.projects.favorite(project.id);
      if (action.dataset.projectAction === "menu") {
        const options = project.status === "archived" ? ["Open", "Restore"] : ["Open", "Duplicate", "Archive"];
        openBottomSheet({
          heading: project.name,
          content: options.map((label) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "button button--outlined button--wide";
            button.dataset.savedMenu = label.toLocaleLowerCase();
            button.dataset.projectId = project.id;
            button.textContent = label;
            return button;
          })
        });
      }
      announceProjectsChanged();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-saved-menu]");
    if (!button) return;
    const project = creationEngine.projects.get(button.dataset.projectId);
    if (!project) return;
    try {
      if (button.dataset.savedMenu === "open") openProject(project.id);
      if (button.dataset.savedMenu === "duplicate") {
        const copy = creationEngine.projects.duplicate(project.id, uniqueCopyName(project));
        openProject(copy.id);
      }
      if (button.dataset.savedMenu === "archive") creationEngine.projects.archive(project.id);
      if (button.dataset.savedMenu === "restore") creationEngine.projects.restore(project.id);
      closeBottomSheet();
      announceProjectsChanged();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

function addDataPortability() {
  const information = document.querySelector('[data-screen="settings"] .settings-group:last-of-type');
  const section = document.createElement("section");
  section.className = "settings-group";
  section.innerHTML = '<h2 class="section-title">Your data</h2><p class="body-text text-muted">Projects stay in this browser. Export a portable project before clearing browser data or moving devices.</p><div class="button-row"><button class="button button--outlined" type="button" data-export-active>Export current</button><label class="button button--outlined" for="project-import">Import project</label><input class="sr-only" id="project-import" type="file" accept="application/json,.json"></div>';
  information.before(section);
  section.querySelector("[data-export-active]").addEventListener("click", () => {
    const project = activeProject();
    if (!project) return showToast("Create or open a project first", "error");
    downloadProject(project);
  });
  section.querySelector("#project-import").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) return showToast("Project files must be smaller than 2 MB", "error");
    try {
      const imported = await readProjectFile(file);
      delete imported.id;
      imported.name = `${imported.name} Imported`;
      const project = creationEngine.projects.create(imported);
      setActiveProject(project.id);
      announceProjectsChanged();
      openProject(project.id);
      showToast("Project imported");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      event.target.value = "";
    }
  });
}

function bindGeneralEvents() {
  document.querySelectorAll("[data-enter-vyrelix]").forEach((trigger) => trigger.addEventListener("click", () => {
    const launch = document.querySelector("#launch-screen");
    launch?.classList.add("is-leaving");
    window.setTimeout(() => launch?.remove(), 420);
  }));
  document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-project-open]");
    if (card && !savedList.contains(card)) openProject(card.dataset.projectOpen);
  });
  document.addEventListener("keydown", (event) => {
    const card = event.target.closest?.("[data-project-open]");
    if (card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openProject(card.dataset.projectOpen);
    }
  });
  document.querySelectorAll('[data-route="create"]').forEach((trigger) => trigger.addEventListener("click", () => {
    pendingCreationOptions = {
      reset: trigger.hasAttribute("data-create-reset"),
      mode: trigger.dataset.createMode || null,
      template: trigger.dataset.template || null,
      category: trigger.dataset.createCategory || null,
      collection: trigger.dataset.createCollection || null
    };
  }));
  document.querySelectorAll("[data-dialog]").forEach((button) => button.addEventListener("click", () => {
    const about = button.dataset.dialog === "about";
    openDialog(about ? "About Vyrelix" : "Privacy", about
      ? "Vyrelix is one adaptive creative platform for shaping ideas, visual direction, and production-ready creative briefs."
      : "Projects and preferences stay in this browser. Vyrelix does not display developer information or transmit your creative work.");
  }));
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    refreshSaved();
  }));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDialog();
      closeBottomSheet();
    }
  });
}

function renderSavedLooks() {
  const grid = document.querySelector("#saved-look-grid");
  if (!grid) return;
  const looks = creationEngine.settings.get().savedCharacterLooks || [];
  if (!looks.length) {
    grid.innerHTML = '<div class="empty-state empty-state--compact"><h3>Your saved looks will appear here</h3><p>Save an outfit from the Character Builder to reuse it later.</p></div>';
    return;
  }
  grid.replaceChildren();
  looks.forEach((look) => {
    const card = document.createElement("article");
    card.className = "saved-look-card";
    const mark = document.createElement("span");
    mark.className = "saved-look-card__mark";
    mark.textContent = "✦";
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = look.name || "Saved character look";
    const detail = document.createElement("small");
    detail.textContent = `${look.answers?.top || look.answers?.outfit || "Complete look"} · ${look.answers?.shoes || "Open footwear"}`;
    copy.append(title, detail);
    const use = document.createElement("button");
    use.type = "button";
    use.className = "button button--outlined";
    use.textContent = "Use look";
    use.dataset.route = "create";
    use.addEventListener("click", () => {
      pendingCreationOptions = { reset: true, lookId: look.id };
    });
    card.append(mark, copy, use);
    grid.append(card);
  });
}

navigation = createNavigation({
  onRouteChange: (route) => {
    if (route === "saved") refreshSaved();
    if (route === "project") renderProject();
    if (route === "library") renderSavedLooks();
    if (route === "create") {
      const options = pendingCreationOptions || {};
      pendingCreationOptions = null;
      ensureCreationExperience().then((controller) => controller.start(options)).catch(() => showToast("Creator could not be opened", "error"));
    }
    if (route === "visual") ensureVisualStudio().catch(() => showToast("Visual direction could not be opened", "error"));
    if (["prompt", "prompt-preview", "prompt-history"].includes(route)) {
      ensurePromptStudio().then((controller) => {
        if (route === "prompt") controller.selectProject?.(activeProject()?.id);
        if (route === "prompt-history") controller.renderHistory();
      }).catch(() => showToast("Creative brief builder could not be opened", "error"));
    }
  }
});

initializeDashboard({ engine: creationEngine, navigate: navigation.navigate, showToast });
initializeSettings(() => openDialog("Clear local storage?", "This permanently removes projects, prompts, history, and preferences from this device.", { destructive: true }));
initializeRipples();
initializeModals();
initializeBottomSheets();
initializeForms();
initializeLoading();
bindProjectActions();
bindSavedActions();
bindGeneralEvents();
addDataPortability();
document.querySelectorAll("[data-app-version]").forEach((item) => {
  item.textContent = `${APP_VERSION} · Universal Creative Platform`;
});
createSearchController({
  input: document.querySelector("#saved-search"),
  suggestions: document.querySelector("#search-suggestions"),
  clearButton: document.querySelector("[data-search-clear]"),
  getItems: getSavedItems,
  onQuery: debounce((query) => {
    state.query = query;
    refreshSaved();
  }, 100)
});
document.querySelector("#confirm-clear").addEventListener("click", () => {
  storage.clear();
  creationEngine.storage.clear();
  refreshSaved();
  closeDialog();
  document.dispatchEvent(new CustomEvent("vyrelix:projects-changed"));
  showToast("Local data cleared", "deleted");
});
refreshSaved();
renderProject();
renderSavedLooks();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
