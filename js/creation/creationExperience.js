/**
 * Adaptive, studio-free entry layer for the Universal Creation Engine.
 * It asks for a goal and mode, renders only relevant controls, and saves through UCE.
 */
import {
  CREATION_CATEGORIES,
  CREATION_MODES,
  advancedFields,
  getCreationCategory,
  getCreationMode,
  inferCreationCategory,
  smartDefaults
} from "./creationSchemas.js";

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(className, text, dataset = {}) {
  const node = element("button", className, text);
  node.type = "button";
  Object.assign(node.dataset, dataset);
  return node;
}

function fieldControl(config, value = "") {
  const label = element("label", "field");
  const copy = element("span", "", config.label);
  const control = config.type === "textarea" ? element("textarea") : element("input");
  control.name = config.name;
  control.value = value || "";
  control.placeholder = config.placeholder || "";
  control.required = Boolean(config.required);
  control.setAttribute("aria-label", config.label);
  if (config.type === "textarea") control.rows = 3;
  else control.type = config.type || "text";
  label.append(copy, control);
  return label;
}

function uniqueProjectName(engine, requested) {
  const base = String(requested || "Untitled creation").trim().slice(0, 72) || "Untitled creation";
  const names = new Set(engine.projects.list({ includeArchived: true }).map((item) => item.name.toLocaleLowerCase()));
  if (!names.has(base.toLocaleLowerCase())) return base;
  let index = 2;
  while (names.has(`${base} ${index}`.toLocaleLowerCase())) index += 1;
  return `${base} ${index}`;
}

function answerValues(root) {
  const form = root.querySelector("form");
  return form ? Object.fromEntries(new FormData(form)) : {};
}

export function initializeCreationExperience({ root, engine, navigate, showToast }) {
  if (!root) throw new Error("Universal creation root is missing.");

  const goalInput = root.querySelector("#creation-goal");
  const categoryRoot = root.querySelector("#creation-categories");
  const categorySearch = root.querySelector("#creation-category-search");
  const inference = root.querySelector("#creation-inference");
  const questionOne = root.querySelector("#creation-question-one");
  const questionTwo = root.querySelector("#creation-question-two");
  const modeRoot = root.querySelector("#creation-modes");
  const workspace = root.querySelector("#creation-workspace");
  const workspaceRoot = root.querySelector("#adaptive-creation-root");
  const summaryCategory = root.querySelector("#creation-summary-category");
  const summaryMode = root.querySelector("#creation-summary-mode");
  const summaryGoal = root.querySelector("#creation-summary-goal");
  const stepLabel = root.querySelector("#creation-step-label");
  const liveStatus = root.querySelector("#creation-live-status");
  const progress = [...root.querySelectorAll("[data-creation-progress]")];

  const state = {
    stage: 1,
    category: null,
    mode: null,
    goal: "",
    directorResponses: [],
    ideas: [],
    favoriteIdeas: new Set(),
    selectedIdea: "",
    selectedTemplate: "",
    reference: null,
    referenceUrl: "",
    showAllCategories: false,
    categoryQuery: ""
  };

  function setStage(stage) {
    state.stage = stage;
    questionOne.classList.toggle("is-hidden", stage !== 1);
    questionTwo.classList.toggle("is-hidden", stage !== 2);
    workspace.classList.toggle("is-hidden", stage !== 3);
    progress.forEach((item, index) => item.classList.toggle("is-active", index < stage));
    stepLabel.textContent = stage < 3 ? `Question ${stage} of 2` : "Adaptive creator";
    liveStatus.textContent = stage === 1
      ? "Choose or describe what you want to create."
      : stage === 2 ? "Choose how you want to create it." : `${state.category.label} ${state.mode.name} ready.`;
  }

  function renderCategories() {
    const fragment = document.createDocumentFragment();
    const query = state.categoryQuery.toLocaleLowerCase();
    const categories = CREATION_CATEGORIES.filter((category) =>
      !query || category.label.toLocaleLowerCase().includes(query) || category.keywords.some((keyword) => keyword.includes(query))
    );
    const visible = state.showAllCategories || query ? categories : categories.slice(0, 12);
    visible.forEach((category) => {
      const item = button("creation-category", "", { creationCategory: category.id });
      item.setAttribute("aria-pressed", String(state.category?.id === category.id));
      item.classList.toggle("is-selected", state.category?.id === category.id);
      item.append(element("span", "", category.icon), element("span", "", category.label));
      fragment.append(item);
    });
    categoryRoot.replaceChildren(fragment);
    root.querySelector("[data-creation-browse-all]").textContent = state.showAllCategories ? "Show featured formats" : `Browse all ${CREATION_CATEGORIES.length} formats`;
  }

  function renderModes() {
    const fragment = document.createDocumentFragment();
    CREATION_MODES.forEach((mode) => {
      const item = button("creation-mode", "", { creationMode: mode.id });
      item.setAttribute("aria-label", `${mode.name}. ${mode.description}`);
      item.append(
        element("span", "creation-mode__icon", mode.icon),
        (() => {
          const copy = element("span");
          copy.append(element("strong", "", mode.name), element("small", "", mode.description));
          return copy;
        })(),
        element("span", "", "›")
      );
      fragment.append(item);
    });
    modeRoot.replaceChildren(fragment);
  }

  function selectCategory(category, { updateGoal = true } = {}) {
    state.category = category;
    if (updateGoal && !goalInput.value.trim()) goalInput.value = category.label.replace("…", "");
    inference.textContent = category.id === "anything" ? "Vyrelix will adapt from your description." : `Creative direction recognized: ${category.label}`;
    renderCategories();
  }

  function renderFieldPanel(fields, intro, values = {}) {
    const panel = element("div", "creation-panel");
    panel.append(element("p", "creation-panel__intro", intro));
    const form = element("form", "adaptive-fields");
    form.noValidate = true;
    fields.forEach((config) => form.append(fieldControl(config, values[config.name])));
    panel.append(form);
    return panel;
  }

  function createActionLabel() {
    if (state.mode.id === "quick") return "Create with smart defaults";
    if (state.mode.id === "reference") return "Create from reference";
    return "Create project";
  }

  function renderActions() {
    const actions = element("div", "creation-actions");
    actions.append(
      button("button button--outlined", "Start over", { creationAction: "reset" }),
      button("button button--primary ripple", createActionLabel(), { creationAction: "save" })
    );
    workspaceRoot.append(actions);
  }

  function renderQuick() {
    const values = smartDefaults(state.category, state.goal);
    const panel = renderFieldPanel([
      { name: "quickDescription", label: "Describe the result", placeholder: "What should Vyrelix create?", type: "textarea", required: true }
    ], "Give Vyrelix one clear description. Smart local defaults will complete the creative direction.", { quickDescription: state.goal });
    panel.dataset.creationPanel = "quick";
    workspaceRoot.append(panel);
    state.quickDefaults = values;
  }

  function renderGuided() {
    workspaceRoot.append(renderFieldPanel(
      state.category.fields.slice(0, 4),
      `Only the most useful questions for ${state.category.label.toLocaleLowerCase()} are shown.`
    ));
  }

  function renderAdvanced() {
    workspaceRoot.append(renderFieldPanel(
      advancedFields(state.category),
      `Every available ${state.category.label.toLocaleLowerCase()} and universal creative control is open.`
    ));
  }

  function directorQuestions() {
    return state.category.fields.slice(0, 4).map((config) => ({
      key: config.name,
      prompt: `Tell me about ${config.label.toLocaleLowerCase()}.`
    }));
  }

  function renderDirector() {
    const questions = directorQuestions();
    const panel = element("div", "creation-panel");
    panel.append(element("p", "creation-panel__intro", "Your local Creative Director will interview you and turn each answer into project direction."));
    const thread = element("div", "director-thread");
    thread.setAttribute("aria-live", "polite");
    thread.append(element("div", "director-message", `Let’s shape your ${state.category.label.toLocaleLowerCase()}. ${questions[0]?.prompt || "Tell me what you have in mind."}`));
    state.directorResponses.forEach((response) => {
      thread.append(element("div", "director-message director-message--user", response.value));
      const next = questions[response.index + 1];
      if (next) thread.append(element("div", "director-message", next.prompt));
    });
    if (state.directorResponses.length === questions.length) {
      thread.append(element("div", "director-message", "I have enough direction to begin."));
    }
    panel.append(thread);
    if (state.directorResponses.length < questions.length) {
      const form = element("form", "adaptive-fields");
      const control = fieldControl({
        name: "directorResponse", label: "Your response", placeholder: "Share as much or as little as you like", type: "textarea"
      });
      form.append(control, button("button button--outlined button--wide", "Add response", { creationAction: "director-send" }));
      panel.append(form);
    } else {
      panel.append(element("div", "notice", "Your creative direction is ready to become a universal project."));
    }
    workspaceRoot.append(panel);
  }

  function generateIdeas({ mixed = false } = {}) {
    const moods = ["refined", "unexpected", "cinematic", "warm", "bold", "minimal"];
    state.ideas = state.category.ideas.map((title, index) => {
      const mood = moods[(index + (mixed ? 2 : 0)) % moods.length];
      return `${title} — a ${mood} direction for ${state.goal.toLocaleLowerCase()}.`;
    });
    if (mixed && state.ideas.length > 1) {
      state.ideas.unshift(`Mixed direction — combine ${state.category.ideas[0].toLocaleLowerCase()} with ${state.category.ideas[1].toLocaleLowerCase()} for ${state.goal.toLocaleLowerCase()}.`);
    }
    state.selectedIdea = state.ideas[0] || "";
  }

  function renderInspire() {
    if (!state.ideas.length) generateIdeas();
    const panel = element("div", "creation-panel");
    panel.append(element("p", "creation-panel__intro", "Choose an idea, save favorites, or mix the directions into something new."));
    const grid = element("div", "inspiration-grid");
    state.ideas.forEach((idea, index) => {
      const item = element("div", `inspiration-card${state.selectedIdea === idea ? " is-selected" : ""}`);
      const select = button("inspiration-select", "", { ideaSelect: String(index) });
      select.setAttribute("aria-pressed", String(state.selectedIdea === idea));
      select.append(element("strong", "", idea.split(" — ")[0]), element("small", "", idea.split(" — ")[1] || idea));
      const favorite = button("idea-favorite", state.favoriteIdeas.has(idea) ? "♥" : "♡", { ideaFavorite: String(index) });
      favorite.setAttribute("aria-label", `${state.favoriteIdeas.has(idea) ? "Remove" : "Add"} idea favorite`);
      favorite.setAttribute("aria-pressed", String(state.favoriteIdeas.has(idea)));
      item.append(select, favorite);
      grid.append(item);
    });
    panel.append(grid, button("button button--outlined button--wide", "Mix these ideas", { creationAction: "mix" }));
    workspaceRoot.append(panel);
  }

  function availableTemplates() {
    const categoryTemplates = state.category.ideas.map((name, index) => ({
      id: `goal-${index}`, name, description: `Professional ${state.category.label.toLocaleLowerCase()} direction`
    }));
    const universal = engine.templates.list().slice(0, 6).map((item) => ({
      id: item.id, name: item.name, description: `${item.name.replace(" Template", "")} universal visual foundation`
    }));
    return [...categoryTemplates, ...universal];
  }

  function renderTemplates() {
    const panel = element("div", "creation-panel");
    panel.append(element("p", "creation-panel__intro", `Start your ${state.category.label.toLocaleLowerCase()} from a professional direction, then keep refining it anywhere in Vyrelix.`));
    const grid = element("div", "creation-template-grid");
    availableTemplates().forEach((template) => {
      const item = button(`creation-template-card${state.selectedTemplate === template.name ? " is-selected" : ""}`, "", { creationTemplate: template.name });
      item.setAttribute("aria-pressed", String(state.selectedTemplate === template.name));
      item.append(element("strong", "", template.name), element("small", "", template.description));
      grid.append(item);
    });
    panel.append(grid);
    if (state.selectedTemplate) {
      const form = element("form", "adaptive-fields");
      state.category.fields.slice(0, 3).forEach((config) => form.append(fieldControl(config)));
      panel.append(form);
    }
    workspaceRoot.append(panel);
  }

  async function analyzeReference(file) {
    if (file.size > 10_000_000) throw new Error("Reference images must be smaller than 10 MB.");
    if (!file.type.startsWith("image/")) throw new Error("Choose a supported image file.");
    if (state.referenceUrl) URL.revokeObjectURL(state.referenceUrl);
    state.referenceUrl = URL.createObjectURL(file);
    const image = new Image();
    const dimensions = await new Promise((resolve) => {
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => resolve({ width: 0, height: 0 });
      image.src = state.referenceUrl;
    });
    state.reference = {
      name: file.name,
      type: file.type || "image",
      size: file.size,
      ...dimensions,
      orientation: dimensions.width === dimensions.height ? "square" : dimensions.width > dimensions.height ? "landscape" : "portrait"
    };
    renderWorkspace();
    liveStatus.textContent = `${file.name} analyzed locally.`;
  }

  function renderReference() {
    const panel = element("div", "creation-panel");
    panel.append(element("p", "creation-panel__intro", "Images stay on this device. Vyrelix reads basic visual metadata locally and stores only the direction you approve."));
    const drop = element("label", "reference-drop");
    drop.append(element("strong", "", state.reference ? "Choose another reference" : "Upload a reference image"), element("small", "", "PNG, JPEG, WebP, or another browser-supported image"));
    const input = element("input");
    input.type = "file";
    input.accept = "image/*";
    input.dataset.referenceInput = "";
    input.setAttribute("aria-label", "Upload reference image");
    drop.append(input);
    panel.append(drop);
    if (state.reference) {
      const preview = element("div", "reference-preview");
      const image = element("img");
      image.src = state.referenceUrl;
      image.alt = `Reference preview: ${state.reference.name}`;
      const copy = element("div");
      copy.append(
        element("strong", "", state.reference.name),
        element("small", "", `${state.reference.width} × ${state.reference.height} · ${state.reference.orientation} · ${Math.max(1, Math.round(state.reference.size / 1024))} KB`)
      );
      preview.append(image, copy);
      panel.append(preview);
      const form = element("form", "adaptive-fields");
      form.append(fieldControl({
        name: "referenceDirection", label: "What should Vyrelix carry forward?", placeholder: "Composition, mood, palette, subject, or another quality", type: "textarea", required: true
      }, state.goal));
      panel.append(form);
    }
    workspaceRoot.append(panel);
  }

  function renderWorkspace() {
    summaryCategory.textContent = state.category.label;
    summaryMode.textContent = state.mode.name;
    summaryGoal.textContent = state.goal;
    workspaceRoot.replaceChildren();
    const renderers = {
      quick: renderQuick,
      guided: renderGuided,
      advanced: renderAdvanced,
      director: renderDirector,
      inspire: renderInspire,
      templates: renderTemplates,
      reference: renderReference
    };
    renderers[state.mode.id]();
    renderActions();
  }

  function selectMode(mode) {
    state.mode = mode;
    setStage(3);
    renderWorkspace();
  }

  function continueGoal() {
    state.goal = goalInput.value.trim();
    if (!state.goal && !state.category) {
      inference.textContent = "Describe your idea or choose a category to continue.";
      goalInput.focus();
      return;
    }
    if (!state.category) selectCategory(inferCreationCategory(state.goal), { updateGoal: false });
    if (!state.goal) state.goal = state.category.label.replace("…", "");
    setStage(2);
    modeRoot.querySelector("button")?.focus();
  }

  function reset() {
    if (state.referenceUrl) URL.revokeObjectURL(state.referenceUrl);
    Object.assign(state, {
      stage: 1,
      category: null,
      mode: null,
      goal: "",
      directorResponses: [],
      ideas: [],
      favoriteIdeas: new Set(),
      selectedIdea: "",
      selectedTemplate: "",
      reference: null,
      referenceUrl: "",
      showAllCategories: false,
      categoryQuery: "",
      quickDefaults: {}
    });
    goalInput.value = "";
    categorySearch.value = "";
    inference.textContent = "Describe anything. Vyrelix will recognize the creative direction.";
    renderCategories();
    setStage(1);
    goalInput.focus();
  }

  function validateRequiredAnswers(values) {
    const required = state.mode.id === "advanced"
      ? advancedFields(state.category).filter((item) => item.required)
      : state.category.fields.slice(0, state.mode.id === "guided" ? 4 : 3).filter((item) => item.required);
    const missing = required.find((item) => !String(values[item.name] || "").trim());
    if (!missing) return true;
    const control = workspaceRoot.querySelector(`[name="${missing.name}"]`);
    control?.focus();
    showToast(`Add ${missing.label.toLocaleLowerCase()} to continue`, "error");
    return false;
  }

  function saveProject() {
    const values = answerValues(workspaceRoot);
    if (state.mode.id === "quick" && !String(values.quickDescription || "").trim()) {
      workspaceRoot.querySelector('[name="quickDescription"]')?.focus();
      showToast("Add one description to continue", "error");
      return;
    }
    if (state.mode.id === "director" && !state.directorResponses.length) {
      workspaceRoot.querySelector('[name="directorResponse"]')?.focus();
      showToast("Answer the first Creative Director question to continue", "error");
      return;
    }
    if (["guided", "advanced", "templates"].includes(state.mode.id) && !validateRequiredAnswers(values)) return;
    if (state.mode.id === "reference" && !state.reference) {
      workspaceRoot.querySelector("[data-reference-input]")?.focus();
      showToast("Upload a reference image first", "error");
      return;
    }
    if (state.mode.id === "templates" && !state.selectedTemplate) {
      showToast("Choose a template first", "error");
      return;
    }
    const directorAnswers = Object.fromEntries(state.directorResponses.map((item) => [item.key, item.value]));
    const answers = {
      ...(state.quickDefaults || {}),
      ...directorAnswers,
      ...values
    };
    const primary = state.category.fields.map((item) => answers[item.name]).find((value) => String(value || "").trim());
    const direction = state.selectedIdea || state.selectedTemplate || answers.quickDescription || answers.referenceDirection || "";
    const name = uniqueProjectName(engine, primary || state.goal || state.category.label);
    const description = [state.goal, direction].filter(Boolean).filter((item, index, all) => all.indexOf(item) === index).join(" — ");
    try {
      const project = engine.projects.create({
        name,
        type: state.category.projectType,
        category: state.category.label,
        description,
        tags: [state.category.id, state.mode.id],
        theme: answers.mood || answers.tone || answers.campaignTone || state.selectedTemplate || "Original",
        artStyle: answers.style || answers.visualDirection || "Adaptive direction",
        colorPalette: answers.palette ? [answers.palette] : [],
        studio: "Universal Creative Engine",
        data: {
          goal: state.goal,
          creationCategory: state.category.id,
          creationMode: state.mode.id,
          answers,
          creativeDirection: direction,
          favoriteIdeas: [...state.favoriteIdeas],
          reference: state.reference ? { ...state.reference } : null,
          experienceVersion: 1
        }
      });
      engine.settings.set({ activeProjectId: project.id });
      document.dispatchEvent(new CustomEvent("vyrelix:projects-changed"));
      showToast(`${project.name} created`, "saved");
      navigate("project");
    } catch (error) {
      showToast(error.message || "Creation could not be saved", "error");
    }
  }

  function sendDirectorResponse() {
    const input = workspaceRoot.querySelector('[name="directorResponse"]');
    const value = input?.value.trim();
    if (!value) {
      input?.focus();
      showToast("Add a response first", "error");
      return;
    }
    const questions = directorQuestions();
    const index = state.directorResponses.length;
    state.directorResponses.push({ index, key: questions[index].key, value });
    renderWorkspace();
  }

  function start(options = {}) {
    if (options.reset) reset();
    if (options.category) selectCategory(getCreationCategory(options.category), { updateGoal: !options.goal });
    if (options.goal) {
      goalInput.value = options.goal;
      state.goal = options.goal;
      selectCategory(inferCreationCategory(options.goal), { updateGoal: false });
    }
    if (options.template) {
      const requested = options.template.toLocaleLowerCase();
      const match = engine.templates.list().find((item) =>
        item.id.toLocaleLowerCase() === requested || item.name.toLocaleLowerCase().startsWith(requested)
      );
      state.selectedTemplate = match?.name || "";
    }
    if (options.mode) {
      if (!state.category) selectCategory(inferCreationCategory(goalInput.value || options.template || "anything"), { updateGoal: false });
      state.goal = goalInput.value.trim() || state.category.label.replace("…", "");
      selectMode(getCreationMode(options.mode));
    }
    return api;
  }

  root.addEventListener("input", (event) => {
    if (event.target === categorySearch) {
      state.categoryQuery = categorySearch.value.trim();
      renderCategories();
      return;
    }
    if (event.target !== goalInput) return;
    const value = goalInput.value.trim();
    if (!value) {
      inference.textContent = "Describe anything. Vyrelix will recognize the creative direction.";
      return;
    }
    selectCategory(inferCreationCategory(value), { updateGoal: false });
  });

  root.addEventListener("change", (event) => {
    if (event.target.matches("[data-reference-input]")) {
      const file = event.target.files?.[0];
      if (file) analyzeReference(file).catch(() => showToast("That reference could not be analyzed", "error"));
    }
  });

  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-creation-browse-all]")) {
      state.showAllCategories = !state.showAllCategories;
      renderCategories();
      return;
    }
    const categoryButton = event.target.closest("[data-creation-category]");
    if (categoryButton) {
      selectCategory(getCreationCategory(categoryButton.dataset.creationCategory));
      return;
    }
    const modeButton = event.target.closest("[data-creation-mode]");
    if (modeButton) {
      selectMode(getCreationMode(modeButton.dataset.creationMode));
      return;
    }
    if (event.target.closest("[data-creation-continue]")) {
      continueGoal();
      return;
    }
    if (event.target.closest("[data-creation-back]")) {
      setStage(1);
      return;
    }
    const favorite = event.target.closest("[data-idea-favorite]");
    if (favorite) {
      event.stopPropagation();
      const idea = state.ideas[Number(favorite.dataset.ideaFavorite)];
      if (state.favoriteIdeas.has(idea)) state.favoriteIdeas.delete(idea);
      else state.favoriteIdeas.add(idea);
      renderWorkspace();
      return;
    }
    const idea = event.target.closest("[data-idea-select]");
    if (idea) {
      state.selectedIdea = state.ideas[Number(idea.dataset.ideaSelect)];
      renderWorkspace();
      return;
    }
    const template = event.target.closest("[data-creation-template]");
    if (template) {
      state.selectedTemplate = template.dataset.creationTemplate;
      renderWorkspace();
      return;
    }
    const action = event.target.closest("[data-creation-action]")?.dataset.creationAction;
    if (action === "reset") reset();
    if (action === "save") saveProject();
    if (action === "director-send") sendDirectorResponse();
    if (action === "mix") {
      generateIdeas({ mixed: true });
      renderWorkspace();
    }
  });

  renderCategories();
  renderModes();
  setStage(1);

  const api = { start, reset, getState: () => ({ ...state }) };
  return api;
}
