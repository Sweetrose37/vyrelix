import {
  ARTISTIC_STYLES,
  CREATIVE_PANELS,
  EVERYTHING_LIBRARY,
  analyzeCreativeIntent,
  blankSpecification,
  buildPromptFromSpecification,
  contextualSuggestion,
  createPanel,
  recommendCompletions
} from "./creativeIntelligence.js";
import {
  INSPIRATION_IDEAS,
  allGuidedCategories,
  categoryPresentation,
  featuredGuidedCategories,
  guidedSpecification,
  guidedSteps,
  inspirationSpecification,
  suggestedAnswer
} from "./guidedExperience.js";
import { getCreationCategory } from "./creationSchemas.js";
import { copyText } from "../clipboard.js";

const EXAMPLES = Object.freeze([
  "Create a luxury black and gold wedding invitation with Art Deco accents.",
  "Design a warm, modern coffee logo for an independent neighborhood roaster.",
  "Create a cinematic fantasy dragon guarding a crystal mountain city.",
  "Build a clean mobile finance app UI for first-time investors.",
  "Generate a playful sticker pack for plant lovers.",
  "Create premium toy packaging for a collectible space explorer.",
  "Design a bold YouTube thumbnail for a creative business channel.",
  "Create a dramatic comic cover set in a neon city."
]);

const ASSISTANT_ACTIONS = Object.freeze([
  ["next", "Suggest Next Step"],
  ["improve", "Improve My Idea"],
  ["style", "Recommend Style"],
  ["colors", "Recommend Colors"],
  ["lighting", "Recommend Lighting"],
  ["composition", "Recommend Composition"],
  ["cinematic", "More Cinematic"],
  ["luxurious", "More Luxurious"],
  ["realistic", "More Realistic"],
  ["creative", "More Creative"],
  ["detail", "Add Detail"],
  ["simplify", "Simplify"],
  ["trends", "Match Current Trends"],
  ["surprise", "Surprise Me"]
]);

function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(label, className, data = {}) {
  const node = element("button", className, label);
  node.type = "button";
  Object.assign(node.dataset, data);
  return node;
}

function clone(value) {
  return structuredClone(value);
}

function uniqueProjectName(engine, requested) {
  const base = String(requested || "Untitled creation").trim().slice(0, 72) || "Untitled creation";
  const names = new Set(engine.projects.list({ includeArchived: true }).map((project) => project.name.toLocaleLowerCase()));
  if (!names.has(base.toLocaleLowerCase())) return base;
  let index = 2;
  while (names.has(`${base} ${index}`.toLocaleLowerCase())) index += 1;
  return `${base} ${index}`;
}

function downloadText(name, text) {
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

function readableDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function initializeCreationExperience({ root, engine, navigate, showToast }) {
  if (!root) throw new Error("Universal creation root is missing.");
  const experienceRoot = root.querySelector("#creative-experience-root");
  const status = root.querySelector("#creation-live-status");
  const stageLabel = root.querySelector("#creation-stage-label");
  const state = {
    view: "choice",
    goal: "",
    specification: null,
    projectId: "",
    references: [],
    suggestions: [],
    history: [],
    historyIndex: -1,
    versions: [],
    library: "",
    libraryQuery: "",
    styleQuery: "",
    styleView: "all",
    promptOpen: false,
    historyOpen: false,
    compareVersionId: "",
    promptOverride: "",
    customPanelUids: [],
    guidedCategoryId: "",
    guidedStep: 0,
    guidedAnswers: {},
    guidedSeedGoal: "",
    guidedShowAll: false,
    guidedQuery: "",
    guidedCustomStep: "",
    inspirationCollection: "All",
    draggingUid: "",
    editingBefore: null
  };

  function updateStage(copy) {
    experienceRoot.dataset.creationView = state.view;
    stageLabel.textContent = copy;
    status.textContent = copy;
  }

  function recentIdeas() {
    return engine.settings.get().recentIdeas || [];
  }

  function saveRecentIdea(goal) {
    const ideas = [goal, ...recentIdeas().filter((item) => item !== goal)].filter(Boolean).slice(0, 6);
    engine.settings.set({ recentIdeas: ideas });
  }

  function guidedDraft() {
    const draft = engine.settings.get().creationDraftV1;
    return draft && typeof draft === "object" && draft.categoryId ? draft : null;
  }

  function persistGuidedDraft() {
    if (!state.guidedCategoryId) return;
    try {
      engine.settings.set({
        creationDraftV1: {
          categoryId: state.guidedCategoryId,
          step: state.guidedStep,
          answers: clone(state.guidedAnswers),
          seedGoal: state.guidedSeedGoal,
          projectId: state.projectId,
          updatedAt: new Date().toISOString()
        }
      });
    } catch {
      showToast("Draft could not be saved on this device", "error");
    }
  }

  function resumeGuidedDraft() {
    const draft = guidedDraft();
    if (!draft) return renderGuidedCategories();
    state.guidedCategoryId = draft.categoryId;
    state.guidedStep = Math.max(0, Number(draft.step) || 0);
    state.guidedAnswers = clone(draft.answers || {});
    state.guidedSeedGoal = draft.seedGoal || "";
    state.projectId = draft.projectId && engine.projects.get(draft.projectId) ? draft.projectId : "";
    renderGuidedStep();
  }

  function syncGuidedSpecification() {
    if (!state.guidedCategoryId) return;
    state.specification = guidedSpecification(state.guidedCategoryId, state.guidedAnswers, state.guidedSeedGoal);
    state.goal = state.specification.goal;
    state.promptOverride = "";
  }

  function selectGuidedCategory(categoryId, { preserve = false } = {}) {
    if (!preserve || state.guidedCategoryId !== categoryId) {
      const defaults = {
        woman: { gender: "Woman", age: "Adult" },
        man: { gender: "Man", age: "Adult" },
        teen: { age: "Teen" },
        child: { age: "Child" },
        toddler: { age: "Toddler" },
        baby: { age: "Baby" }
      };
      state.guidedAnswers = clone(defaults[categoryId] || {});
      state.guidedStep = 0;
      state.guidedCustomStep = "";
    }
    state.guidedCategoryId = categoryId;
    persistGuidedDraft();
    renderGuidedStep();
  }

  function updatePrompt() {
    if (!state.specification) return;
    state.specification.updatedAt = new Date().toISOString();
    state.specification.prompt = state.promptOverride || buildPromptFromSpecification(state.specification);
  }

  function pushHistory(label = "Creative change") {
    updatePrompt();
    const snapshot = { label, at: new Date().toISOString(), specification: clone(state.specification), promptOverride: state.promptOverride };
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(snapshot);
    if (state.history.length > 50) state.history.shift();
    state.historyIndex = state.history.length - 1;
  }

  function restoreHistory(index) {
    const snapshot = state.history[index];
    if (!snapshot) return;
    state.historyIndex = index;
    state.specification = clone(snapshot.specification);
    state.promptOverride = snapshot.promptOverride || "";
    state.suggestions = [];
    renderBuild();
    showToast(snapshot.label);
  }

  function createSnapshot(label = "Snapshot") {
    updatePrompt();
    const version = {
      id: `version-${Date.now().toString(36)}`,
      label: `${label} ${state.versions.length + 1}`,
      at: new Date().toISOString(),
      specification: clone(state.specification),
      prompt: state.specification.prompt
    };
    state.versions.unshift(version);
    renderBuild();
    showToast("Snapshot saved");
  }

  function qualityScore() {
    if (!state.specification?.sections.length) return 0;
    const complete = state.specification.sections.filter((section) => String(section.value || "").trim()).length;
    return Math.min(98, 38 + Math.round((complete / state.specification.sections.length) * 55));
  }

  function reset() {
    Object.assign(state, {
      view: "choice",
      goal: "",
      specification: null,
      projectId: "",
      references: [],
      suggestions: [],
      history: [],
      historyIndex: -1,
      versions: [],
      library: "",
      libraryQuery: "",
      styleQuery: "",
      styleView: "all",
      promptOpen: false,
      historyOpen: false,
      compareVersionId: "",
      promptOverride: "",
      customPanelUids: [],
      guidedCategoryId: "",
      guidedStep: 0,
      guidedAnswers: {},
      guidedSeedGoal: "",
      guidedShowAll: false,
      guidedQuery: "",
      guidedCustomStep: "",
      inspirationCollection: "All",
      draggingUid: "",
      editingBefore: null
    });
    renderChoice();
  }

  function modeCard(icon, title, subtitle, features, mode) {
    const card = button("", `creation-path-card creation-path-card--${mode}`, { creationPath: mode });
    card.setAttribute("aria-label", `${title}. ${subtitle}`);
    const mark = element("span", "creation-path-card__icon", icon);
    const copy = element("span", "creation-path-card__copy");
    copy.append(element("strong", "", title), element("small", "", subtitle));
    const list = element("span", "creation-path-card__features");
    features.forEach((feature) => list.append(element("span", "", feature)));
    copy.append(list);
    card.append(mark, copy, element("span", "creation-path-card__arrow", "›"));
    return card;
  }

  function projectProgress(project) {
    if (project.data?.creationMode === "guided" && project.data?.guidedCategoryId) {
      const steps = guidedSteps(project.data.guidedCategoryId);
      const answers = project.data?.guidedAnswers || {};
      const completed = steps.filter((step) => {
        const value = answers[step.id];
        return Array.isArray(value) ? value.length : String(value || "").trim();
      }).length;
      return Math.min(100, Math.round((completed / Math.max(1, steps.length)) * 100));
    }
    const sections = project.data?.creativeSpec?.sections || [];
    if (!sections.length) return project.status === "completed" ? 100 : 20;
    return Math.round((sections.filter((section) => String(section.value || "").trim()).length / sections.length) * 100);
  }

  function continueProjectCard(project) {
    const card = element("article", "continue-creation-card");
    const mark = element("span", "continue-creation-card__mark", (project.category || project.type || "V").slice(0, 1).toLocaleUpperCase());
    const copy = element("div", "continue-creation-card__copy");
    const heading = element("div");
    heading.append(element("strong", "", project.name));
    if (project.favorite) heading.append(element("span", "badge badge--soft", "Pinned"));
    copy.append(
      heading,
      element("small", "", `${project.category || project.type} · Edited ${readableDate(project.modifiedAt)}`)
    );
    const progress = element("div", "continue-progress");
    const meter = element("span");
    meter.style.setProperty("--progress", `${projectProgress(project)}%`);
    progress.append(meter, element("small", "", `${projectProgress(project)}% complete`));
    copy.append(progress);
    card.append(mark, copy, button("Continue", "button button--secondary", { continueCreationProject: project.id }));
    return card;
  }

  function renderChoice() {
    state.view = "choice";
    updateStage("Choose your creative experience");
    const intro = element("section", "creation-choice");
    const hero = element("header", "creation-choice__hero");
    hero.append(
      element("p", "eyebrow", "✨ Create"),
      element("h2", "display-title", "Create anything you can imagine."),
      element("p", "body-text text-muted", "Choose the experience that feels right. Every path uses the same intelligent creative engine.")
    );
    intro.append(hero);

    const projects = engine.projects.list()
      .sort((left, right) => Number(right.favorite) - Number(left.favorite) || new Date(right.modifiedAt) - new Date(left.modifiedAt))
      .slice(0, 4);
    const draft = guidedDraft();
    const continuation = element("section", "continue-creating");
    const continuationHeading = element("div", "section-heading");
    continuationHeading.append(
      (() => {
        const copy = element("div");
        copy.append(element("p", "eyebrow", "Saved on this device"), element("h3", "medium-title", "Continue creating"));
        return copy;
      })(),
      button("View all projects", "text-button", { routeProjects: "" })
    );
    continuation.append(continuationHeading);
    const continueRow = element("div", "continue-creation-row");
    if (draft) {
      const draftCategory = categoryPresentation(draft.categoryId);
      const draftCard = element("article", "continue-creation-card continue-creation-card--draft");
      draftCard.append(
        element("span", "continue-creation-card__mark", draftCategory.icon),
        (() => {
          const copy = element("div", "continue-creation-card__copy");
          copy.append(
            element("strong", "", `Continue ${draftCategory.label}`),
            element("small", "", `Auto-saved ${readableDate(draft.updatedAt)}`),
            element("span", "autosave-status", "✓ Progress saved locally")
          );
          return copy;
        })(),
        button("Resume", "button button--secondary", { resumeGuidedDraft: "" })
      );
      continueRow.append(draftCard);
    }
    projects.forEach((project) => continueRow.append(continueProjectCard(project)));
    if (!continueRow.childElementCount) {
      const empty = element("div", "creation-empty-start");
      empty.append(element("span", "", "✦"), element("strong", "", "Start your first creation."), element("small", "", "Your progress will be saved privately on this device."));
      continueRow.append(empty);
    }
    continuation.append(continueRow);
    const deviceStatus = element("div", "creation-sync-status");
    deviceStatus.append(element("span", "", "● Device auto-save ready"), element("span", "", "Cloud sync not connected"));
    continuation.append(deviceStatus);
    intro.append(continuation);

    const choiceHeading = element("div", "creation-choice__heading");
    choiceHeading.append(element("p", "eyebrow", "One engine · Three creative paths"), element("h3", "medium-title", "How would you like to create?"));
    intro.append(choiceHeading);
    const paths = element("div", "creation-path-grid");
    paths.append(
      modeCard("✍️", "Describe", "Tell Vyrelix your idea.", ["Natural conversation", "Voice and references", "Intelligent defaults"], "describe"),
      modeCard("🪄", "Creative Builder", "Build with expandable choices.", ["Open any section", "Rich visual options", "Progress always saved"], "guided"),
      modeCard("🎲", "Inspire Me", "Discover ideas you never imagined.", ["Curated directions", "Remix with one tap", "Save favorites"], "inspire")
    );
    intro.append(paths);
    experienceRoot.replaceChildren(intro);
  }

  function referenceDrop() {
    const drop = element("label", "creative-reference-drop");
    drop.dataset.referenceDrop = "";
    drop.append(
      element("strong", "", state.references.length ? `${state.references.length} reference${state.references.length === 1 ? "" : "s"} ready` : "Drop, paste, or choose references"),
      element("small", "", "References stay on this device and are attached to your project direction.")
    );
    const input = element("input", "sr-only");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.dataset.referenceInput = "";
    drop.append(input);
    return drop;
  }

  function renderDescribe() {
    state.view = "describe";
    updateStage("Describe Mode");
    const section = element("section", "describe-workspace");
    const intro = element("div", "describe-workspace__intro");
    intro.append(
      element("p", "eyebrow", "Talk to your Creative Director"),
      element("h2", "display-title", "What are you imagining?"),
      element("p", "body-text text-muted", "Use everyday language. Vyrelix will detect the output, style, palette, mood, materials, composition, typography, and finish.")
    );
    const composer = element("div", "creative-composer");
    const area = element("textarea");
    area.id = "describe-idea";
    area.maxLength = 1200;
    area.rows = 8;
    area.placeholder = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    area.value = state.goal;
    area.setAttribute("aria-label", "Describe your creative idea");
    const tools = element("div", "creative-composer__tools");
    tools.append(
      button("◉ Voice", "composer-tool", { voiceInput: "" }),
      button("▧ References", "composer-tool", { chooseReference: "" }),
      button("✦ Surprise Me", "composer-tool", { surpriseIdea: "" })
    );
    composer.append(area, tools);
    section.append(intro, composer, referenceDrop());
    if (state.references.length) {
      const refs = element("div", "reference-chip-row");
      state.references.forEach((reference, index) => refs.append(button(`${reference.name} ×`, "reference-chip", { removeReference: String(index) })));
      section.append(refs);
    }
    const examples = element("div", "idea-examples");
    examples.append(element("span", "", "Try an idea"));
    EXAMPLES.slice(0, 4).forEach((example) => examples.append(button(example, "idea-example", { exampleIdea: example })));
    const recent = recentIdeas();
    if (recent.length) {
      const recentRow = element("div", "reference-chip-row");
      recentRow.append(element("span", "caption", "Recent"));
      recent.slice(0, 3).forEach((idea) => recentRow.append(button(idea, "reference-chip", { recentIdea: idea })));
      section.append(recentRow);
    }
    section.append(
      examples,
      button("Understand my idea", "button button--primary button--wide creative-analyze", { analyzeIdea: "" }),
      button("Guide me step by step", "button button--outlined button--wide", { switchGuided: "" }),
      button("Choose another path", "text-button", { creationBack: "" })
    );
    experienceRoot.replaceChildren(section);
  }

  function renderGuidedCategories() {
    state.view = "guided-categories";
    updateStage("Creative Builder · Choose a creation");
    const section = element("section", "guided-category-picker");
    const header = element("header", "guided-category-picker__header");
    header.append(
      button("←", "icon-button", { creationBack: "" }),
      (() => {
        const copy = element("div");
        copy.append(
          element("p", "eyebrow", "🪄 Universal Creative Builder"),
          element("h2", "display-title", "What would you like to create today?"),
          element("p", "body-text text-muted", "Choose a starting point, then open any detail section in whatever order feels natural.")
        );
        return copy;
      })()
    );
    section.append(header);
    const search = element("input", "guided-category-search");
    search.type = "search";
    search.value = state.guidedQuery;
    search.placeholder = "Search every creative possibility";
    search.setAttribute("aria-label", "Search creation categories");
    search.dataset.guidedCategorySearch = "";
    section.append(search);
    const categories = (state.guidedShowAll ? allGuidedCategories() : featuredGuidedCategories())
      .filter((item) => !state.guidedQuery || `${item.label} ${item.description}`.toLocaleLowerCase().includes(state.guidedQuery.toLocaleLowerCase()));
    const grid = element("div", "guided-category-grid");
    categories.forEach((item) => {
      const card = button("", "guided-category-card", { guidedCategory: item.id });
      card.setAttribute("aria-label", `${item.label}. ${item.description}`);
      card.append(
        element("span", "guided-category-card__icon", item.icon),
        (() => {
          const copy = element("span");
          copy.append(element("strong", "", item.label), element("small", "", item.description));
          return copy;
        })(),
        element("span", "guided-category-card__arrow", "›")
      );
      grid.append(card);
    });
    if (!grid.childElementCount) {
      const empty = element("div", "creation-empty-start");
      empty.append(element("strong", "", "No exact match yet."), element("small", "", "Choose More to start with a universal creative direction."));
      grid.append(empty);
    }
    section.append(grid);
    if (!state.guidedQuery) {
      section.append(button(state.guidedShowAll ? "Show featured creations" : `✨ More · Explore ${allGuidedCategories().length} categories`, "button button--outlined button--wide", { guidedToggleAll: "" }));
    }
    section.append(button("Choose another experience", "text-button", { creationBack: "" }));
    experienceRoot.replaceChildren(section);
  }

  function currentGuidedStep() {
    return guidedSteps(state.guidedCategoryId)[state.guidedStep] || null;
  }

  function guidedAnswer(step) {
    return state.guidedAnswers[step.id] ?? (step.multiple ? [] : "");
  }

  function renderGuidedOption(step, item) {
    const answer = guidedAnswer(step);
    const selected = step.multiple ? Array.isArray(answer) && answer.includes(item.value) : answer === item.value;
    const control = button("", `guided-option${selected ? " is-selected" : ""}${step.visual ? ` guided-option--${step.visual}` : ""}`, {
      guidedOption: item.value,
      guidedStepId: step.id
    });
    control.setAttribute("aria-pressed", String(selected));
    if (item.swatch) {
      const swatch = element("span", "guided-option__swatch");
      swatch.style.background = item.swatch;
      control.append(swatch);
    } else if (step.visual === "style") {
      control.append(element("span", "guided-option__style-mark", item.label.slice(0, 1)));
    }
    control.append(element("strong", "", item.label));
    return control;
  }

  function renderGuidedCustom(step, container) {
    const answer = guidedAnswer(step);
    const optionValues = new Set((step.options || []).map((item) => item.value));
    const customValue = Array.isArray(answer)
      ? answer.filter((value) => !optionValues.has(value)).join(", ")
      : optionValues.has(answer) ? "" : answer;
    const open = Boolean(step.input) || state.guidedCustomStep === step.id || Boolean(customValue);
    if (step.allowCustom && !open) {
      container.append(button("＋ Custom", "guided-option guided-option--custom", { guidedOpenCustom: step.id }));
    }
    if (!open) return;
    const label = element("label", "guided-custom-field");
    label.append(element("span", "", step.input ? step.label : `Custom ${step.label.toLocaleLowerCase()}`));
    const input = element(step.input === "textarea" ? "textarea" : "input");
    if (input.tagName === "INPUT") input.type = "text";
    input.maxLength = step.input === "textarea" ? 500 : 180;
    input.value = customValue;
    input.placeholder = step.prompt;
    input.dataset.guidedCustomInput = step.id;
    input.setAttribute("aria-label", `Custom ${step.label}`);
    label.append(input);
    container.append(label);
  }

  function renderGuidedReview() {
    state.view = "guided-review";
    updateStage("Creative Builder · Review");
    syncGuidedSpecification();
    const category = getCreationCategory(state.guidedCategoryId);
    const presentation = categoryPresentation(category);
    const steps = guidedSteps(category);
    const section = element("section", "guided-review");
    const header = element("header", "guided-review__header");
    header.append(
      button("←", "icon-button", { guidedBack: "" }),
      (() => {
        const copy = element("div");
        copy.append(
          element("p", "eyebrow", `${steps.filter((step) => {
            const value = guidedAnswer(step);
            return Array.isArray(value) ? value.length : String(value || "").trim();
          }).length} details selected`),
          element("h2", "display-title", `${presentation.icon} Review your ${presentation.label.toLocaleLowerCase()}`),
          element("p", "body-text text-muted", "Every choice remains editable. Vyrelix has already assembled the creative direction behind the scenes.")
        );
        return copy;
      })()
    );
    section.append(header);
    const progress = element("div", "guided-progress");
    progress.style.setProperty("--guided-progress", "100%");
    progress.append(element("span"), element("small", "", "Creative direction ready"));
    section.append(progress);
    const summary = element("div", "guided-review-grid");
    steps.forEach((step, index) => {
      const value = guidedAnswer(step);
      const display = Array.isArray(value) ? value.join(", ") : value;
      const card = element("article", "guided-review-card");
      const copy = element("div");
      copy.append(element("small", "", step.label), element("strong", "", display || "AI will complete this"));
      card.append(copy, button("Edit", "text-button", { guidedEditStep: String(index) }));
      summary.append(card);
    });
    section.append(summary);
    const actions = element("div", "guided-review-actions");
    actions.append(
      button("✨ Generate", "button button--primary button--wide", { guidedGenerate: "" }),
      button("Save Draft", "button button--outlined button--wide", { guidedSaveDraft: "" }),
      button("Advanced Controls", "text-button", { guidedAdvanced: "" }),
      button("Cancel", "text-button", { guidedCancel: "" })
    );
    section.append(actions);
    experienceRoot.replaceChildren(section);
  }

  function renderGuidedStep() {
    if (!state.guidedCategoryId) return renderGuidedCategories();
    const category = getCreationCategory(state.guidedCategoryId);
    const presentation = categoryPresentation(category);
    const steps = guidedSteps(category);
    state.guidedStep = Math.min(Math.max(-1, state.guidedStep), Math.max(0, steps.length - 1));
    state.view = "guided";
    updateStage(`Creative Builder · ${presentation.label}`);
    const section = element("section", "guided-builder");
    const header = element("header", "guided-builder__header");
    header.append(
      button("←", "icon-button", { guidedCategories: "" }),
      (() => {
        const copy = element("div");
        copy.append(
          element("p", "eyebrow", `${presentation.icon} Universal Creative Engine`),
          element("h2", "display-title", `Build your ${presentation.label.toLocaleLowerCase()}`),
          element("p", "body-text text-muted", "Open any section, choose from the dropdown options, and customize every detail.")
        );
        return copy;
      })(),
      button("Cancel", "text-button", { guidedCancel: "" })
    );
    section.append(header);
    const completed = steps.filter((step) => {
      const value = guidedAnswer(step);
      return Array.isArray(value) ? value.length : String(value || "").trim();
    }).length;
    const progress = element("div", "guided-progress");
    progress.style.setProperty("--guided-progress", `${Math.round((completed / Math.max(1, steps.length)) * 100)}%`);
    progress.append(element("span"), element("small", "", `${completed} of ${steps.length} details selected · Auto-saved`));
    section.append(progress);

    const preview = element("section", "character-builder-preview");
    const age = String(state.guidedAnswers.age || "").toLocaleLowerCase();
    const gender = String(state.guidedAnswers.gender || "").toLocaleLowerCase();
    const avatar = age === "baby" ? "🍼" : age === "toddler" ? "👶" : age === "child" ? "🧒" : age === "teen" ? "🧑" : gender === "woman" ? "👩" : gender === "man" ? "👨" : presentation.icon;
    preview.append(
      element("span", "character-builder-preview__avatar", avatar),
      (() => {
        const copy = element("div");
        copy.append(element("strong", "", state.projectId ? "Continue your character" : "Your creation takes shape here"));
        const chips = element("div", "character-builder-preview__chips");
        steps.filter((step) => {
          const value = guidedAnswer(step);
          return Array.isArray(value) ? value.length : value;
        }).slice(0, 5).forEach((step) => {
          const value = guidedAnswer(step);
          chips.append(element("span", "", Array.isArray(value) ? value.join(", ") : value));
        });
        if (!chips.childElementCount) chips.append(element("small", "", "Choose details below to build the creative direction."));
        copy.append(chips);
        return copy;
      })(),
      button("✦ Fill for me", "text-button", { guidedSurprise: "" })
    );
    section.append(preview);

    const dropdowns = element("div", "guided-dropdown-list");
    let currentGroup = "";
    steps.forEach((step, index) => {
      const group = step.group || "Creative Details";
      if (group !== currentGroup) {
        dropdowns.append(element("p", "guided-dropdown-group", group));
        currentGroup = group;
      }
      const answer = guidedAnswer(step);
      const display = Array.isArray(answer) ? answer.join(", ") : answer;
      const panel = element("section", `guided-dropdown${state.guidedStep === index ? " is-open" : ""}`);
      const summary = button("", "guided-dropdown__summary", { guidedOpenStep: String(index) });
      summary.setAttribute("aria-expanded", String(state.guidedStep === index));
      const copy = element("span");
      copy.append(
        element("strong", "", step.label),
        element("small", display ? "guided-dropdown__value" : "", display || "Choose an option")
      );
      summary.append(copy, element("span", "guided-dropdown__chevron", state.guidedStep === index ? "⌃" : "⌄"));
      panel.append(summary);
      if (state.guidedStep === index) {
        const body = element("div", "guided-dropdown__body");
        body.append(element("p", "body-text text-muted", step.prompt));
        if (step.multiple) body.append(element("p", "caption", "Choose all that apply."));
        const options = element("div", `guided-option-grid${step.options.length > 10 ? " is-carousel" : ""}`);
        step.options.forEach((item) => options.append(renderGuidedOption(step, item)));
        renderGuidedCustom(step, options);
        body.append(options);
        const assist = element("div", "guided-assist-row");
        assist.append(
          button("✨ AI Suggest", "guided-assist", { guidedSuggest: "" }),
          button("🎲 Randomize", "guided-assist", { guidedRandomize: "" })
        );
        body.append(assist);
        panel.append(body);
      }
      dropdowns.append(panel);
    });
    section.append(dropdowns);
    const actions = element("footer", "guided-builder-actions");
    actions.append(
      button("Save Draft", "button button--outlined", { guidedSaveDraft: "" }),
      button("Review", "button button--secondary", { guidedReview: "" }),
      button("Create", "button button--primary", { guidedGenerate: "" })
    );
    section.append(actions);
    experienceRoot.replaceChildren(section);
  }

  function inspirationFavorites() {
    return engine.settings.get().inspirationFavorites || [];
  }

  function renderInspirationCard(idea) {
    const favorites = new Set(inspirationFavorites());
    const card = element("article", "inspiration-card");
    card.style.setProperty("--inspiration-accent", idea.accent);
    const visual = element("div", "inspiration-card__visual");
    visual.append(
      element("span", "", categoryPresentation(idea.categoryId).icon),
      element("small", "", idea.collection)
    );
    const copy = element("div", "inspiration-card__copy");
    copy.append(
      element("h3", "medium-title", idea.title),
      element("p", "body-text text-muted", idea.description),
      element("small", "", `${idea.style} · ${idea.palette}`)
    );
    const actions = element("div", "inspiration-card__actions");
    const favorite = button(favorites.has(idea.id) ? "♥ Saved" : "♡ Save", "text-button", { inspirationFavorite: idea.id });
    favorite.setAttribute("aria-pressed", String(favorites.has(idea.id)));
    actions.append(
      favorite,
      button("Describe", "button button--outlined", { inspirationDescribe: idea.id }),
      button("Remix", "button button--primary", { inspirationGuided: idea.id })
    );
    card.append(visual, copy, actions);
    return card;
  }

  function renderInspire() {
    state.view = "inspire";
    updateStage("Inspire Me");
    const section = element("section", "inspiration-workspace");
    const header = element("header", "inspiration-header");
    header.append(
      button("←", "icon-button", { creationBack: "" }),
      (() => {
        const copy = element("div");
        copy.append(
          element("p", "eyebrow", "🎲 Inspire Me"),
          element("h2", "display-title", "Discover your next idea."),
          element("p", "body-text text-muted", "Explore curated concepts, save favorites, or remix any direction with the same Universal Creative Engine.")
        );
        return copy;
      })()
    );
    section.append(header);
    const controls = element("div", "inspiration-controls");
    controls.append(button("✦ Surprise me", "button button--primary", { inspirationRandom: "" }));
    const filters = element("div", "inspiration-filter-row");
    ["All", "Featured", "Popular", "Calm", "Bold", "Playful", "Seasonal", "Favorites"].forEach((collection) => {
      const control = button(collection, `choice-chip${state.inspirationCollection === collection ? " is-active" : ""}`, { inspirationCollection: collection });
      control.setAttribute("aria-pressed", String(state.inspirationCollection === collection));
      filters.append(control);
    });
    controls.append(filters);
    section.append(controls);
    const favorites = new Set(inspirationFavorites());
    const ideas = INSPIRATION_IDEAS.filter((idea) => {
      if (state.inspirationCollection === "All") return true;
      if (state.inspirationCollection === "Favorites") return favorites.has(idea.id);
      return idea.collection === state.inspirationCollection;
    });
    const grid = element("div", "inspiration-grid");
    ideas.forEach((idea) => grid.append(renderInspirationCard(idea)));
    if (!ideas.length) {
      const empty = element("div", "creation-empty-start");
      empty.append(element("span", "", "♡"), element("strong", "", "Your inspiration collection is ready."), element("small", "", "Save ideas you love and they will appear here."));
      grid.append(empty);
    }
    section.append(grid, button("Choose another experience", "text-button", { creationBack: "" }));
    experienceRoot.replaceChildren(section);
  }

  function detectedItems() {
    const detected = state.specification?.detected || {};
    return Object.entries(detected).filter(([, values]) => values.length);
  }

  function renderAnalysis() {
    state.view = "analysis";
    updateStage("Creative specification ready");
    const spec = state.specification;
    const section = element("section", "specification-review");
    const hero = element("div", "specification-hero");
    hero.append(
      element("span", "specification-hero__mark", "✦"),
      (() => {
        const copy = element("div");
        copy.append(
          element("p", "eyebrow", `${Math.round(spec.confidence * 100)}% intent match`),
          element("h2", "display-title", spec.categoryLabel),
          element("p", "body-text text-muted", spec.goal)
        );
        return copy;
      })()
    );
    section.append(hero);
    const detected = element("div", "detected-grid");
    detectedItems().forEach(([label, values]) => {
      const card = element("article", "detected-card");
      card.append(element("small", "", label), element("strong", "", values.join(", ")));
      detected.append(card);
    });
    if (detected.childElementCount) section.append(detected);
    const preview = element("section", "adaptive-spec-preview");
    preview.append(element("div", "section-heading"));
    preview.querySelector(".section-heading").append(
      (() => {
        const copy = element("div");
        copy.append(element("p", "eyebrow", "Adaptive workspace"), element("h3", "medium-title", `${spec.sections.length} creative sections selected`));
        return copy;
      })(),
      element("span", "badge", `${qualityScore()}% ready`)
    );
    const list = element("div", "spec-section-preview");
    spec.sections.forEach((item) => {
      const card = element("article", `spec-preview-card${item.value ? " has-value" : ""}`);
      card.append(element("strong", "", item.label), element("small", "", item.value || "Ready for your direction"));
      list.append(card);
    });
    preview.append(list);
    const actions = element("div", "analysis-actions");
    actions.append(
      button("Advanced Controls", "button button--primary button--wide", { editBuild: "" }),
      button("Save this project", "button button--outlined button--wide", { saveProject: "" }),
      button("Refine description", "text-button", { refineDescription: "" })
    );
    section.append(preview, actions);
    experienceRoot.replaceChildren(section);
  }

  function renderWorkspaceHeader(container) {
    const header = element("header", "builder-header");
    const copy = element("div");
    copy.append(
      element("p", "eyebrow", `${state.specification.categoryLabel} · ${state.specification.sections.length} panels`),
      element("h2", "medium-title", state.projectId ? "Continue refining" : "Advanced creative controls"),
      element("p", "body-text text-muted", state.specification.goal || "Every creative decision remains editable.")
    );
    const score = element("div", "quality-orbit");
    score.style.setProperty("--quality", `${qualityScore() * 3.6}deg`);
    score.append(element("strong", "", `${qualityScore()}%`), element("small", "", "direction"));
    header.append(copy, score);
    const switcher = element("div", "workflow-switcher");
    switcher.append(
      button("◌ Describe", "workflow-switch", { switchDescribe: "" }),
      button("🪄 Guided", "workflow-switch", { switchGuided: "" }),
      button("🛠 Advanced", "workflow-switch is-active", { switchBuild: "" })
    );
    container.append(header, switcher);
  }

  function renderToolbar(container) {
    const toolbar = element("div", "builder-toolbar");
    const undo = button("↶ Undo", "builder-tool", { historyUndo: "" });
    const redo = button("↷ Redo", "builder-tool", { historyRedo: "" });
    undo.disabled = state.historyIndex <= 0;
    redo.disabled = state.historyIndex >= state.history.length - 1;
    toolbar.append(
      undo,
      redo,
      button("◷ Versions", "builder-tool", { versionHistory: "" }),
      button("⌁ Prompt Inspector", "builder-tool", { promptInspector: "" }),
      button("▣ Snapshot", "builder-tool", { createSnapshot: "" })
    );
    container.append(toolbar);
  }

  function renderPanel(item, index) {
    const descriptor = CREATIVE_PANELS.find((panel) => panel.id === item.kind);
    const card = element("article", `creative-panel-card${item.collapsed ? " is-collapsed" : ""}${item.locked ? " is-locked" : ""}${["ai", "detected", "suggested"].includes(item.source) ? " has-intelligence" : ""}`);
    card.draggable = true;
    card.dataset.panelUid = item.uid;
    const heading = element("header", "creative-panel-card__heading");
    const iconAction = (label, glyph, data, className = "") => {
      const control = button(glyph, `panel-icon-action ${className}`.trim(), data);
      control.setAttribute("aria-label", `${label} ${item.label}`);
      return control;
    };
    const grip = element("span", "panel-grip", "⠿");
    grip.setAttribute("aria-hidden", "true");
    const title = element("div");
    title.append(element("strong", "", item.label), element("small", "", item.source === "detected" ? "Detected from your idea" : item.source === "ai" ? "Suggested by Vyrelix" : "Creative control"));
    heading.append(
      grip,
      title,
      iconAction("Favorite", (engine.settings.get().panelFavorites || []).includes(item.kind) ? "♥" : "♡", { favoritePanel: item.kind }),
      iconAction(item.locked ? "Unlock" : "Lock", item.locked ? "●" : "○", { lockPanel: item.uid }),
      iconAction(item.collapsed ? "Expand" : "Collapse", item.collapsed ? "＋" : "−", { collapsePanel: item.uid }),
      iconAction("Remove", "×", { removePanel: item.uid }, "panel-remove")
    );
    card.append(heading);
    if (!item.collapsed) {
      const body = element("div", "creative-panel-card__body");
      const suggestions = descriptor?.suggestions || [];
      const selectLabel = element("label", "panel-choice-control");
      selectLabel.append(element("span", "", `Choose ${item.label.toLocaleLowerCase()}`));
      const select = element("select");
      select.dataset.panelSelect = item.uid;
      select.disabled = item.locked;
      select.setAttribute("aria-label", `Choose ${item.label}`);
      select.append(new Option(`Select ${item.label.toLocaleLowerCase()}…`, ""));
      if (item.value && !suggestions.includes(item.value)) select.append(new Option(`${item.value} · Current`, item.value));
      suggestions.forEach((suggestion) => select.append(new Option(suggestion, suggestion)));
      select.append(new Option("Custom direction…", "__custom__"));
      select.value = state.customPanelUids.includes(item.uid) ? "__custom__" : item.value || "";
      selectLabel.append(select);
      body.append(selectLabel);
      if (state.customPanelUids.includes(item.uid)) {
        const area = element("textarea");
        area.rows = 3;
        area.value = item.value || "";
        area.placeholder = descriptor?.hint || `Define ${item.label.toLocaleLowerCase()}`;
        area.dataset.panelValue = item.uid;
        area.disabled = item.locked;
        area.setAttribute("aria-label", `Custom ${item.label}`);
        body.append(area);
      }
      if (item.kind === "artistic-style") body.append(button("Browse 300+ styles", "text-button", { openLibrary: "styles" }));
      const order = element("div", "panel-order-actions");
      const up = button("↑ Move up", "text-button", { movePanel: item.uid, moveDirection: "-1" });
      const down = button("↓ Move down", "text-button", { movePanel: item.uid, moveDirection: "1" });
      up.disabled = index === 0;
      down.disabled = index === state.specification.sections.length - 1;
      order.append(up, down);
      body.append(order);
      card.append(body);
    }
    card.style.setProperty("--panel-order", index);
    return card;
  }

  function renderAssistant() {
    const aside = element("aside", "creative-assistant");
    const heading = element("div", "creative-assistant__heading");
    heading.append(element("span", "", "✦"), (() => {
      const copy = element("div");
      copy.append(element("strong", "", "Creative Director"), element("small", "", "Suggestions preview before applying"));
      return copy;
    })());
    aside.append(heading);
    const actions = element("div", "assistant-action-grid");
    ASSISTANT_ACTIONS.forEach(([id, label]) => actions.append(button(label, "assistant-action", { assistantAction: id })));
    aside.append(actions, button("✨ Let AI Complete This", "button button--primary button--wide", { completeProject: "" }));
    const suggestionRoot = element("div", "assistant-suggestions");
    if (!state.suggestions.length) {
      suggestionRoot.append(element("p", "assistant-empty", "Ask for a direction or let Vyrelix complete unfinished panels. Nothing changes until you apply it."));
    } else {
      state.suggestions.forEach((suggestion) => {
        const card = element("article", "suggestion-preview-card");
        card.append(
          element("small", "", suggestion.label),
          element("strong", "", suggestion.after),
          element("p", "", suggestion.reason)
        );
        const controls = element("div", "button-row");
        controls.append(
          button("Apply", "button button--secondary", { applySuggestion: suggestion.id }),
          button("Dismiss", "button button--ghost", { dismissSuggestion: suggestion.id })
        );
        card.append(controls);
        suggestionRoot.append(card);
      });
      if (state.suggestions.length > 1) suggestionRoot.prepend(button("Apply all suggestions", "button button--outlined button--wide", { applyAllSuggestions: "" }));
    }
    aside.append(suggestionRoot);
    return aside;
  }

  function renderLivePreview() {
    const preview = element("section", "live-creative-preview");
    const visual = element("div", "live-creative-preview__visual");
    visual.append(
      element("span", "live-preview-kicker", state.specification.categoryLabel),
      element("strong", "live-preview-title", state.specification.goal || "Your creative direction"),
      element("span", "live-preview-line"),
      element("span", "live-preview-line live-preview-line--short"),
      element("em", "", `${qualityScore()}%`)
    );
    const copy = element("div", "live-creative-preview__copy");
    const style = state.specification.sections.find((panel) => panel.kind === "artistic-style")?.value || "Style open";
    const palette = state.specification.sections.find((panel) => panel.kind === "palette")?.value || "Palette open";
    const mood = state.specification.sections.find((panel) => panel.kind === "mood")?.value || "Mood open";
    copy.append(
      element("p", "eyebrow", "Live Creative Preview"),
      element("h3", "section-title", "Direction updates as you build"),
      element("p", "body-text text-muted", "This specification preview reflects your current hierarchy and creative completeness."),
      (() => {
        const tags = element("div", "preview-direction-tags");
        [style, palette, mood].forEach((value) => tags.append(element("span", "", value)));
        return tags;
      })()
    );
    preview.append(visual, copy);
    return preview;
  }

  function renderPanelLibrary() {
    if (state.library !== "panels") return null;
    const library = element("section", "builder-library");
    const heading = element("div", "section-heading");
    heading.append(element("h3", "medium-title", "Add Creative Panel"), button("Close", "text-button", { closeLibrary: "" }));
    const search = element("input");
    search.type = "search";
    search.placeholder = "Search creative panels";
    search.value = state.libraryQuery;
    search.dataset.panelLibrarySearch = "";
    search.setAttribute("aria-label", "Search creative panels");
    const results = element("div", "panel-library-grid");
    const query = state.libraryQuery.toLocaleLowerCase();
    CREATIVE_PANELS.filter((panel) => !query || `${panel.label} ${panel.group}`.toLocaleLowerCase().includes(query)).forEach((panel) => {
      const item = button("", "panel-library-item", { addPanel: panel.id });
      item.append(element("small", "", panel.group), element("strong", "", panel.label), element("span", "", "+"));
      results.append(item);
    });
    library.append(heading, search, results);
    return library;
  }

  function styleFavorites() {
    return engine.settings.get().styleFavorites || [];
  }

  function renderStyleLibrary() {
    if (state.library !== "styles") return null;
    const library = element("section", "builder-library style-library");
    const heading = element("div", "section-heading");
    heading.append(element("h3", "medium-title", "Artistic Styles"), button("Close", "text-button", { closeLibrary: "" }));
    const search = element("input");
    search.type = "search";
    search.placeholder = "Search 300+ artistic styles";
    search.value = state.styleQuery;
    search.dataset.styleSearch = "";
    search.setAttribute("aria-label", "Search artistic styles");
    const tabs = element("div", "segmented");
    ["all", "favorites", "recent"].forEach((view) => {
      const item = button(view[0].toUpperCase() + view.slice(1), view === state.styleView ? "is-active" : "", { styleView: view });
      item.setAttribute("aria-pressed", String(view === state.styleView));
      tabs.append(item);
    });
    const favorites = new Set(styleFavorites());
    const recent = engine.settings.get().recentStyles || [];
    const query = state.styleQuery.toLocaleLowerCase();
    let styles = ARTISTIC_STYLES.filter((style) => !query || `${style.name} ${style.family}`.toLocaleLowerCase().includes(query));
    if (state.styleView === "favorites") styles = styles.filter((style) => favorites.has(style.id));
    if (state.styleView === "recent") styles = recent.map((id) => ARTISTIC_STYLES.find((style) => style.id === id)).filter(Boolean);
    const grid = element("div", "style-library-grid");
    styles.slice(0, 120).forEach((style) => {
      const card = element("article", "style-card");
      card.append(
        button(favorites.has(style.id) ? "♥" : "♡", "style-favorite", { favoriteStyle: style.id }),
        button("", "style-select", { selectStyle: style.id })
      );
      card.querySelector(".style-select").append(element("span", "style-swatch", style.family.slice(0, 1)), element("strong", "", style.name), element("small", "", style.family));
      grid.append(card);
    });
    if (!styles.length) grid.append(element("p", "empty-state", "No styles match this view."));
    library.append(heading, search, tabs, grid);
    return library;
  }

  function renderVersionHistory() {
    if (!state.historyOpen) return null;
    const section = element("section", "version-drawer");
    const heading = element("div", "section-heading");
    heading.append(element("h3", "medium-title", "Version History"), button("Close", "text-button", { closeVersions: "" }));
    section.append(heading);
    if (!state.versions.length) {
      section.append(element("p", "body-text text-muted", "Create a snapshot whenever you reach a direction worth keeping."));
    }
    state.versions.forEach((version) => {
      const item = element("article", "version-card");
      const copy = element("div");
      copy.append(element("strong", "", version.label), element("small", "", readableDate(version.at)));
      const actions = element("div");
      actions.append(
        button("Compare", "text-button", { compareVersion: version.id }),
        button("Restore", "text-button", { restoreVersion: version.id })
      );
      item.append(copy, actions);
      if (state.compareVersionId === version.id) {
        const currentValues = new Map(state.specification.sections.map((panel) => [panel.kind, panel.value]));
        const changed = version.specification.sections.filter((panel) => currentValues.get(panel.kind) !== panel.value);
        item.append(element("p", "version-comparison", changed.length ? `${changed.length} section${changed.length === 1 ? "" : "s"} differ from the current version: ${changed.map((panel) => panel.label).join(", ")}.` : "This snapshot matches the current direction."));
        if (version.prompt !== state.specification.prompt) item.append(element("p", "version-comparison", "The generated prompt also differs from this snapshot."));
      }
      section.append(item);
    });
    return section;
  }

  function renderPromptInspector() {
    if (!state.promptOpen) return null;
    updatePrompt();
    const inspector = element("section", "prompt-inspector");
    const heading = element("div", "section-heading");
    heading.append(
      (() => {
        const copy = element("div");
        copy.append(element("p", "eyebrow", "Advanced control"), element("h3", "medium-title", "Prompt Inspector"));
        return copy;
      })(),
      button("Hide prompt", "text-button", { closePrompt: "" })
    );
    const notice = element("p", "body-text text-muted", "Vyrelix maintains this prompt behind the scenes. Editing it is optional and never locks you out of visual controls.");
    const area = element("textarea", "prompt-inspector__editor");
    area.rows = 10;
    area.value = state.specification.prompt;
    area.dataset.promptEditor = "";
    area.setAttribute("aria-label", "Generated prompt");
    const controls = element("div", "prompt-inspector__controls");
    controls.append(
      button("Copy Prompt", "button button--secondary", { copyPrompt: "" }),
      button("Export Prompt", "button button--outlined", { exportPrompt: "" }),
      button("Reset to Generated", "button button--ghost", { resetPrompt: "" })
    );
    const locks = element("div", "prompt-locks");
    locks.append(element("strong", "", "Lock creative sections"));
    state.specification.sections.forEach((panel) => {
      const label = element("label", "check-control");
      const input = element("input");
      input.type = "checkbox";
      input.checked = panel.locked;
      input.dataset.promptLock = panel.uid;
      label.append(input, element("span", "", panel.label));
      locks.append(label);
    });
    inspector.append(heading, notice, area, controls, locks);
    return inspector;
  }

  function renderPresetBar(container) {
    const bar = element("div", "preset-bar");
    const output = element("select");
    output.setAttribute("aria-label", "Creative output type");
    output.dataset.outputType = "";
    if (!EVERYTHING_LIBRARY.includes(state.specification.categoryLabel)) output.append(new Option(`${state.specification.categoryLabel} · Current`, state.specification.categoryLabel));
    EVERYTHING_LIBRARY.forEach((item) => output.append(new Option(item, item)));
    output.value = state.specification.categoryLabel;
    const outputLabel = element("label", "output-picker");
    outputLabel.append(element("span", "", "Everything Library"), output);
    const select = element("select");
    select.dataset.applyPreset = "";
    select.setAttribute("aria-label", "Apply creative preset");
    select.append(new Option("Apply a preset…", ""));
    engine.templates.list().slice(0, 8).forEach((template) => select.append(new Option(template.name, `template:${template.name}`)));
    (engine.settings.get().customCreativePresets || []).forEach((preset) => select.append(new Option(preset.name, `custom:${preset.id}`)));
    bar.append(outputLabel, select, button("Save custom preset", "text-button", { savePreset: "" }));
    container.append(bar);
  }

  function renderBuild() {
    state.view = "build";
    updateStage("Advanced Controls · Creative workspace");
    updatePrompt();
    const workspace = element("section", "build-workspace");
    renderWorkspaceHeader(workspace);
    renderToolbar(workspace);
    renderPresetBar(workspace);
    const layout = element("div", "builder-layout");
    const canvas = element("main", "builder-canvas");
    const panels = element("div", "creative-panel-stack");
    panels.setAttribute("aria-label", "Creative panels");
    state.specification.sections.forEach((panel, index) => panels.append(renderPanel(panel, index)));
    canvas.append(renderLivePreview(), panels, button("＋ Add creative panel", "button button--outlined button--wide add-panel-button", { openLibrary: "panels" }));
    layout.append(canvas, renderAssistant());
    workspace.append(layout);
    const panelLibrary = renderPanelLibrary();
    const styleLibrary = renderStyleLibrary();
    const versions = renderVersionHistory();
    const inspector = renderPromptInspector();
    [panelLibrary, styleLibrary, versions, inspector].filter(Boolean).forEach((section) => workspace.append(section));
    const dock = element("div", "builder-save-dock");
    dock.append(
      element("span", "", `${qualityScore()}% creative direction ready`),
      button(state.projectId ? "Save changes" : "Save project", "button button--primary", { saveProject: "" })
    );
    workspace.append(dock);
    experienceRoot.replaceChildren(workspace);
  }

  function ensureBuildSpecification() {
    if (!state.specification) state.specification = blankSpecification(state.goal);
    if (!state.history.length) pushHistory("Workspace started");
  }

  function analyze() {
    const input = experienceRoot.querySelector("#describe-idea");
    const goal = input?.value.trim() || state.goal;
    if (!goal) {
      input?.focus();
      showToast("Describe your idea first", "error");
      return;
    }
    state.goal = goal;
    state.specification = analyzeCreativeIntent(goal);
    state.specification.references = clone(state.references);
    state.promptOverride = "";
    state.history = [];
    state.historyIndex = -1;
    pushHistory("Idea understood");
    saveRecentIdea(goal);
    renderAnalysis();
  }

  function addReference(file) {
    if (!file?.type.startsWith("image/")) return showToast("Choose an image reference", "error");
    if (file.size > 10_000_000) return showToast("Reference images must be smaller than 10 MB", "error");
    state.references.push({ name: file.name, type: file.type, size: file.size, addedAt: new Date().toISOString() });
    if (state.specification) state.specification.references = clone(state.references);
    if (state.view === "describe") renderDescribe();
    showToast("Reference added locally");
  }

  function applySuggestion(suggestion) {
    let panel = state.specification.sections.find((item) => item.uid === suggestion.panelUid || item.kind === suggestion.kind);
    if (!panel) {
      panel = createPanel(suggestion.kind, "", "ai");
      state.specification.sections.push(panel);
    }
    if (panel.locked) return;
    panel.value = suggestion.after;
    panel.source = "ai";
  }

  function saveProject({ stay = false } = {}) {
    updatePrompt();
    const spec = state.specification;
    const existingProject = state.projectId ? engine.projects.get(state.projectId) : null;
    const answers = Object.fromEntries(spec.sections.map((section, index) => [`${section.kind}-${index + 1}`, section.value]).filter(([, value]) => String(value || "").trim()));
    const nameSeed = spec.sections.find((section) => section.kind === "subject")?.value || spec.goal || spec.categoryLabel;
    const patch = {
      name: existingProject?.name || uniqueProjectName(engine, nameSeed),
      type: spec.projectType,
      category: spec.categoryLabel,
      description: spec.goal || "Original creative direction",
      tags: [...new Set([...(existingProject?.tags || []), spec.categoryId, "dual-creation", state.view])],
      theme: spec.sections.find((section) => section.kind === "mood")?.value || "Original",
      artStyle: spec.sections.find((section) => section.kind === "artistic-style")?.value || "Adaptive direction",
      colorPalette: (spec.sections.find((section) => section.kind === "palette")?.value || "").split(",").map((value) => value.trim()).filter(Boolean),
      data: {
        ...(existingProject?.data || {}),
        goal: spec.goal,
        creationCategory: spec.categoryId,
        creationMode: state.guidedCategoryId ? "guided" : "dual-experience",
        answers,
        creativeSpec: clone(spec),
        creativeVersions: clone(state.versions),
        promptOverride: state.promptOverride,
        references: clone(state.references),
        guidedCategoryId: state.guidedCategoryId,
        guidedStep: state.guidedStep,
        guidedAnswers: clone(state.guidedAnswers),
        guidedSeedGoal: state.guidedSeedGoal,
        experienceVersion: 3
      }
    };
    try {
      const project = state.projectId ? engine.projects.update(state.projectId, patch, "creative workspace updated") : engine.projects.create(patch);
      state.projectId = project.id;
      engine.settings.set({ activeProjectId: project.id });
      document.dispatchEvent(new CustomEvent("vyrelix:projects-changed"));
      showToast(`${project.name} saved`, "saved");
      if (!stay) navigate("project");
      return project;
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function openProject(project) {
    if (!project) return reset();
    state.projectId = project.id;
    state.goal = project.data?.goal || project.description;
    state.specification = clone(project.data?.creativeSpec || analyzeCreativeIntent(state.goal));
    state.references = clone(project.data?.references || []);
    state.versions = clone(project.data?.creativeVersions || []);
    state.promptOverride = project.data?.promptOverride || "";
    state.guidedCategoryId = project.data?.guidedCategoryId || "";
    state.guidedStep = Math.max(0, Number(project.data?.guidedStep) || 0);
    state.guidedAnswers = clone(project.data?.guidedAnswers || {});
    state.guidedSeedGoal = project.data?.guidedSeedGoal || project.data?.goal || "";
    state.history = [];
    state.historyIndex = -1;
    pushHistory("Project opened");
    renderBuild();
  }

  function resumeProject(project) {
    if (!project) return;
    openProject(project);
    if (state.guidedCategoryId) renderGuidedStep();
  }

  function start(options = {}) {
    if (options.projectId) {
      openProject(engine.projects.get(options.projectId));
      return api;
    }
    if (options.reset) reset();
    if (options.category) {
      selectGuidedCategory(options.category);
    } else if (options.template) {
      state.specification = blankSpecification("");
      if (options.template === "Custom") {
        state.library = "panels";
      } else {
        const templateId = options.template.toLocaleLowerCase().replace(/\s+/g, "-");
        const values = engine.templates.apply(templateId);
        if (values.theme) state.specification.sections.push(createPanel("mood", values.theme, "template"));
        const style = state.specification.sections.find((panel) => panel.kind === "artistic-style");
        if (style && values.artStyle) {
          style.value = values.artStyle;
          style.source = "template";
        }
      }
      ensureBuildSpecification();
      pushHistory(`${options.template} template applied`);
      renderBuild();
    } else if (options.mode === "build") {
      state.specification = blankSpecification("");
      ensureBuildSpecification();
      renderBuild();
    } else if (options.mode === "guided") {
      renderGuidedCategories();
    } else if (options.mode === "inspire") {
      renderInspire();
    } else if (options.mode === "describe") {
      renderDescribe();
    } else if (state.view === "guided" || state.view === "guided-review") {
      renderGuidedStep();
    } else if (state.view === "guided-categories") {
      renderGuidedCategories();
    } else if (state.view === "inspire") {
      renderInspire();
    } else if (state.view === "describe") {
      renderDescribe();
    } else if (!state.specification || state.view === "choice") {
      renderChoice();
    } else {
      renderBuild();
    }
    return api;
  }

  root.addEventListener("input", (event) => {
    if (event.target.matches("#describe-idea")) {
      state.goal = event.target.value;
    }
    if (event.target.matches("[data-guided-category-search]")) {
      state.guidedQuery = event.target.value;
      renderGuidedCategories();
      const search = root.querySelector("[data-guided-category-search]");
      search?.focus();
      search?.setSelectionRange(state.guidedQuery.length, state.guidedQuery.length);
    }
    if (event.target.matches("[data-guided-custom-input]")) {
      const step = currentGuidedStep();
      if (step?.id === event.target.dataset.guidedCustomInput) {
        const value = event.target.value.trimStart();
        if (step.multiple) {
          const optionValues = new Set(step.options.map((item) => item.value));
          const selected = (Array.isArray(state.guidedAnswers[step.id]) ? state.guidedAnswers[step.id] : []).filter((item) => optionValues.has(item));
          state.guidedAnswers[step.id] = value ? [...selected, value] : selected;
        } else {
          state.guidedAnswers[step.id] = value;
        }
        persistGuidedDraft();
      }
    }
    if (event.target.matches("[data-panel-value]")) {
      const panel = state.specification.sections.find((item) => item.uid === event.target.dataset.panelValue);
      if (panel) {
        panel.value = event.target.value;
        panel.source = "manual";
        state.promptOverride = "";
        updatePrompt();
        root.querySelector(".builder-save-dock > span").textContent = `${qualityScore()}% creative direction ready`;
        event.target.closest(".creative-panel-card")?.classList.add("is-changing");
        window.setTimeout(() => event.target.closest(".creative-panel-card")?.classList.remove("is-changing"), 500);
      }
    }
    if (event.target.matches("[data-prompt-editor]")) {
      state.promptOverride = event.target.value;
      state.specification.prompt = state.promptOverride;
    }
    if (event.target.matches("[data-panel-library-search]")) {
      state.libraryQuery = event.target.value;
      renderBuild();
      root.querySelector("[data-panel-library-search]")?.focus();
    }
    if (event.target.matches("[data-style-search]")) {
      state.styleQuery = event.target.value;
      renderBuild();
      root.querySelector("[data-style-search]")?.focus();
    }
  });

  root.addEventListener("focusin", (event) => {
    if (event.target.matches("[data-panel-value], [data-prompt-editor]")) state.editingBefore = clone(state.specification);
  });

  root.addEventListener("change", (event) => {
    if (event.target.matches("[data-panel-value], [data-prompt-editor]")) {
      pushHistory("Creative text updated");
      state.editingBefore = null;
      renderBuild();
    }
    if (event.target.matches("[data-panel-select]")) {
      const panel = state.specification.sections.find((item) => item.uid === event.target.dataset.panelSelect);
      if (!panel) return;
      if (event.target.value === "__custom__") {
        if (!state.customPanelUids.includes(panel.uid)) state.customPanelUids.push(panel.uid);
        renderBuild();
        requestAnimationFrame(() => root.querySelector(`[data-panel-value="${panel.uid}"]`)?.focus());
      } else {
        state.customPanelUids = state.customPanelUids.filter((uid) => uid !== panel.uid);
        panel.value = event.target.value;
        panel.source = "selected";
        state.promptOverride = "";
        pushHistory(`${panel.label} selected`);
        renderBuild();
      }
    }
    if (event.target.matches("[data-reference-input]")) [...(event.target.files || [])].forEach(addReference);
    if (event.target.matches("[data-prompt-lock]")) {
      const panel = state.specification.sections.find((item) => item.uid === event.target.dataset.promptLock);
      if (panel) panel.locked = event.target.checked;
      pushHistory("Section lock updated");
      renderBuild();
    }
    if (event.target.matches("[data-apply-preset]") && event.target.value) {
      const [kind, value] = event.target.value.split(":");
      if (kind === "template") {
        const style = state.specification.sections.find((panel) => panel.kind === "artistic-style");
        if (style && !style.locked) style.value = value.replace(" Template", "");
      } else {
        const preset = (engine.settings.get().customCreativePresets || []).find((item) => item.id === value);
        if (preset) state.specification.sections = clone(preset.sections);
      }
      pushHistory("Preset applied");
      renderBuild();
    }
    if (event.target.matches("[data-output-type]") && event.target.value.trim()) {
      const inferred = analyzeCreativeIntent(event.target.value.trim());
      state.specification.categoryLabel = event.target.value.trim();
      state.specification.categoryId = inferred.categoryId;
      state.specification.projectType = inferred.projectType;
      pushHistory("Creative output changed");
      renderBuild();
    }
  });

  root.addEventListener("dragstart", (event) => {
    const panel = event.target.closest("[data-panel-uid]");
    if (panel) state.draggingUid = panel.dataset.panelUid;
  });
  root.addEventListener("dragover", (event) => {
    if (event.target.closest("[data-panel-uid], [data-reference-drop]")) event.preventDefault();
  });
  root.addEventListener("drop", (event) => {
    const target = event.target.closest("[data-panel-uid]");
    if (target && state.draggingUid) {
      event.preventDefault();
      const from = state.specification.sections.findIndex((panel) => panel.uid === state.draggingUid);
      const to = state.specification.sections.findIndex((panel) => panel.uid === target.dataset.panelUid);
      if (from >= 0 && to >= 0 && from !== to) {
        const [moved] = state.specification.sections.splice(from, 1);
        state.specification.sections.splice(to, 0, moved);
        pushHistory("Panel reordered");
        renderBuild();
      }
      state.draggingUid = "";
      return;
    }
    if (event.target.closest("[data-reference-drop]")) {
      event.preventDefault();
      [...(event.dataTransfer?.files || [])].forEach(addReference);
    }
  });
  root.addEventListener("paste", (event) => {
    const images = [...(event.clipboardData?.files || [])].filter((file) => file.type.startsWith("image/"));
    images.forEach(addReference);
  });

  root.addEventListener("click", async (event) => {
    const target = event.target.closest("button, [data-creation-path]");
    if (!target) return;
    if (target.dataset.creationPath === "describe") renderDescribe();
    if (target.dataset.creationPath === "guided") renderGuidedCategories();
    if (target.dataset.creationPath === "inspire") renderInspire();
    if (target.dataset.creationPath === "build") {
      state.specification = blankSpecification("");
      ensureBuildSpecification();
      renderBuild();
    }
    if (target.hasAttribute("data-route-projects")) navigate("saved");
    if (target.dataset.continueCreationProject) resumeProject(engine.projects.get(target.dataset.continueCreationProject));
    if (target.hasAttribute("data-resume-guided-draft")) resumeGuidedDraft();
    if (target.dataset.guidedCategory) selectGuidedCategory(target.dataset.guidedCategory);
    if (target.hasAttribute("data-guided-categories")) renderGuidedCategories();
    if (target.dataset.guidedOpenStep !== undefined) {
      const requestedStep = Number(target.dataset.guidedOpenStep);
      state.guidedStep = state.guidedStep === requestedStep ? -1 : requestedStep;
      persistGuidedDraft();
      renderGuidedStep();
    }
    if (target.hasAttribute("data-guided-review")) renderGuidedReview();
    if (target.hasAttribute("data-guided-toggle-all")) {
      state.guidedShowAll = !state.guidedShowAll;
      renderGuidedCategories();
    }
    if (target.dataset.guidedOption !== undefined) {
      const step = currentGuidedStep();
      if (step?.id === target.dataset.guidedStepId) {
        if (step.multiple) {
          const selected = new Set(Array.isArray(state.guidedAnswers[step.id]) ? state.guidedAnswers[step.id] : []);
          selected.has(target.dataset.guidedOption) ? selected.delete(target.dataset.guidedOption) : selected.add(target.dataset.guidedOption);
          state.guidedAnswers[step.id] = [...selected];
        } else {
          state.guidedAnswers[step.id] = target.dataset.guidedOption;
        }
        state.guidedCustomStep = "";
        persistGuidedDraft();
        renderGuidedStep();
      }
    }
    if (target.dataset.guidedOpenCustom) {
      state.guidedCustomStep = target.dataset.guidedOpenCustom;
      renderGuidedStep();
      requestAnimationFrame(() => root.querySelector("[data-guided-custom-input]")?.focus());
    }
    if (target.hasAttribute("data-guided-back")) {
      renderGuidedStep();
    }
    if (target.hasAttribute("data-guided-cancel")) {
      persistGuidedDraft();
      renderChoice();
      showToast("Progress saved on this device", "saved");
    }
    if (target.hasAttribute("data-guided-suggest")) {
      const step = currentGuidedStep();
      if (step) {
        state.guidedAnswers[step.id] = suggestedAnswer(step, getCreationCategory(state.guidedCategoryId));
        persistGuidedDraft();
        renderGuidedStep();
        showToast("Creative Director suggestion added");
      }
    }
    if (target.hasAttribute("data-guided-randomize")) {
      const step = currentGuidedStep();
      if (step) {
        const options = step.options || [];
        state.guidedAnswers[step.id] = options.length
          ? options[Math.floor(Math.random() * options.length)].value
          : suggestedAnswer(step, getCreationCategory(state.guidedCategoryId));
        persistGuidedDraft();
        renderGuidedStep();
      }
    }
    if (target.hasAttribute("data-guided-surprise")) {
      const category = getCreationCategory(state.guidedCategoryId);
      guidedSteps(category).forEach((step) => {
        if (state.guidedAnswers[step.id] && (!Array.isArray(state.guidedAnswers[step.id]) || state.guidedAnswers[step.id].length)) return;
        const options = step.options || [];
        state.guidedAnswers[step.id] = options.length
          ? options[Math.floor(Math.random() * options.length)].value
          : suggestedAnswer(step, category);
      });
      persistGuidedDraft();
      renderGuidedStep();
      showToast("A complete direction is ready to explore");
    }
    if (target.hasAttribute("data-guided-skip") || target.hasAttribute("data-guided-next")) {
      state.guidedStep += 1;
      state.guidedCustomStep = "";
      persistGuidedDraft();
      renderGuidedStep();
    }
    if (target.hasAttribute("data-guided-save-draft")) {
      syncGuidedSpecification();
      if (!state.history.length) pushHistory("Guided draft created");
      persistGuidedDraft();
      saveProject({ stay: true });
      renderGuidedStep();
    }
    if (target.dataset.guidedEditStep !== undefined) {
      state.guidedStep = Number(target.dataset.guidedEditStep);
      persistGuidedDraft();
      renderGuidedStep();
    }
    if (target.hasAttribute("data-guided-generate")) {
      syncGuidedSpecification();
      state.history = [];
      state.historyIndex = -1;
      pushHistory("Guided creation completed");
      persistGuidedDraft();
      saveProject();
    }
    if (target.hasAttribute("data-guided-advanced")) {
      syncGuidedSpecification();
      if (!state.history.length) pushHistory("Guided direction opened in Advanced Controls");
      persistGuidedDraft();
      renderBuild();
    }
    if (target.dataset.inspirationCollection) {
      state.inspirationCollection = target.dataset.inspirationCollection;
      renderInspire();
    }
    if (target.dataset.inspirationFavorite) {
      const favorites = new Set(inspirationFavorites());
      favorites.has(target.dataset.inspirationFavorite) ? favorites.delete(target.dataset.inspirationFavorite) : favorites.add(target.dataset.inspirationFavorite);
      engine.settings.set({ inspirationFavorites: [...favorites] });
      renderInspire();
    }
    if (target.hasAttribute("data-inspiration-random")) {
      const idea = INSPIRATION_IDEAS[Math.floor(Math.random() * INSPIRATION_IDEAS.length)];
      state.specification = inspirationSpecification(idea);
      state.goal = idea.description;
      state.guidedSeedGoal = idea.description;
      state.guidedCategoryId = idea.categoryId;
      state.guidedAnswers = { artisticStyle: idea.style, colorPalette: idea.palette };
      state.guidedStep = 0;
      persistGuidedDraft();
      renderGuidedStep();
      showToast(`${idea.title} is ready to remix`);
    }
    if (target.dataset.inspirationDescribe) {
      const idea = INSPIRATION_IDEAS.find((item) => item.id === target.dataset.inspirationDescribe);
      if (idea) {
        state.specification = inspirationSpecification(idea);
        state.goal = `${idea.description} Style: ${idea.style}. Palette: ${idea.palette}.`;
        renderDescribe();
      }
    }
    if (target.dataset.inspirationGuided) {
      const idea = INSPIRATION_IDEAS.find((item) => item.id === target.dataset.inspirationGuided);
      if (idea) {
        state.specification = inspirationSpecification(idea);
        state.goal = idea.description;
        state.guidedSeedGoal = idea.description;
        state.guidedCategoryId = idea.categoryId;
        state.guidedAnswers = { artisticStyle: idea.style, colorPalette: idea.palette };
        state.guidedStep = 0;
        persistGuidedDraft();
        renderGuidedStep();
      }
    }
    if (target.hasAttribute("data-creation-back")) renderChoice();
    if (target.dataset.recentIdea) {
      state.goal = target.dataset.recentIdea;
      renderDescribe();
      requestAnimationFrame(() => { root.querySelector("#describe-idea").value = state.goal; });
    }
    if (target.dataset.exampleIdea) {
      state.goal = target.dataset.exampleIdea;
      root.querySelector("#describe-idea").value = state.goal;
    }
    if (target.hasAttribute("data-surprise-idea")) {
      state.goal = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
      root.querySelector("#describe-idea").value = state.goal;
    }
    if (target.hasAttribute("data-choose-reference")) root.querySelector("[data-reference-input]")?.click();
    if (target.hasAttribute("data-voice-input")) {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) return showToast("Voice input is not supported in this browser", "error");
      const recognition = new Recognition();
      recognition.lang = document.documentElement.lang || "en";
      recognition.onresult = (voiceEvent) => {
        const transcript = voiceEvent.results[0][0].transcript;
        const area = root.querySelector("#describe-idea");
        area.value = `${area.value}${area.value ? " " : ""}${transcript}`;
        state.goal = area.value;
      };
      recognition.onerror = () => showToast("Voice input could not start", "error");
      recognition.start();
      showToast("Listening…");
    }
    if (target.dataset.removeReference !== undefined) {
      state.references.splice(Number(target.dataset.removeReference), 1);
      renderDescribe();
    }
    if (target.hasAttribute("data-analyze-idea")) analyze();
    if (target.hasAttribute("data-refine-description") || target.hasAttribute("data-switch-describe")) renderDescribe();
    if (target.hasAttribute("data-switch-guided")) {
      state.guidedSeedGoal = state.goal || state.specification?.goal || state.guidedSeedGoal;
      if (!state.guidedCategoryId) state.guidedCategoryId = (state.specification || analyzeCreativeIntent(state.guidedSeedGoal)).categoryId;
      state.guidedStep = Math.max(0, state.guidedStep);
      persistGuidedDraft();
      renderGuidedStep();
    }
    if (target.hasAttribute("data-edit-build")) renderBuild();
    if (target.hasAttribute("data-switch-build")) renderBuild();
    if (target.hasAttribute("data-history-undo")) restoreHistory(state.historyIndex - 1);
    if (target.hasAttribute("data-history-redo")) restoreHistory(state.historyIndex + 1);
    if (target.hasAttribute("data-create-snapshot")) createSnapshot();
    if (target.hasAttribute("data-version-history")) {
      state.historyOpen = !state.historyOpen;
      renderBuild();
    }
    if (target.hasAttribute("data-close-versions")) {
      state.historyOpen = false;
      renderBuild();
    }
    if (target.dataset.compareVersion) {
      state.compareVersionId = state.compareVersionId === target.dataset.compareVersion ? "" : target.dataset.compareVersion;
      renderBuild();
    }
    if (target.dataset.restoreVersion) {
      const version = state.versions.find((item) => item.id === target.dataset.restoreVersion);
      if (version) {
        state.specification = clone(version.specification);
        state.promptOverride = "";
        pushHistory("Version restored");
        renderBuild();
      }
    }
    if (target.hasAttribute("data-prompt-inspector")) {
      state.promptOpen = true;
      renderBuild();
    }
    if (target.hasAttribute("data-close-prompt")) {
      state.promptOpen = false;
      renderBuild();
    }
    if (target.hasAttribute("data-copy-prompt")) {
      updatePrompt();
      const copied = await copyText(state.specification.prompt);
      showToast(copied ? "Prompt copied" : "Prompt could not be copied", copied ? "success" : "error");
    }
    if (target.hasAttribute("data-export-prompt")) {
      updatePrompt();
      downloadText("vyrelix-prompt.txt", state.specification.prompt);
      showToast("Prompt export prepared");
    }
    if (target.hasAttribute("data-reset-prompt")) {
      state.promptOverride = "";
      updatePrompt();
      pushHistory("Prompt regenerated");
      renderBuild();
    }
    if (target.dataset.lockPanel) {
      const panel = state.specification.sections.find((item) => item.uid === target.dataset.lockPanel);
      if (panel) panel.locked = !panel.locked;
      pushHistory("Panel lock updated");
      renderBuild();
    }
    if (target.dataset.favoritePanel) {
      const favorites = new Set(engine.settings.get().panelFavorites || []);
      if (favorites.has(target.dataset.favoritePanel)) favorites.delete(target.dataset.favoritePanel);
      else favorites.add(target.dataset.favoritePanel);
      engine.settings.set({ panelFavorites: [...favorites] });
      renderBuild();
    }
    if (target.dataset.collapsePanel) {
      const panel = state.specification.sections.find((item) => item.uid === target.dataset.collapsePanel);
      if (panel) panel.collapsed = !panel.collapsed;
      renderBuild();
    }
    if (target.dataset.removePanel) {
      state.specification.sections = state.specification.sections.filter((panel) => panel.uid !== target.dataset.removePanel);
      pushHistory("Panel removed");
      renderBuild();
    }
    if (target.dataset.movePanel) {
      const from = state.specification.sections.findIndex((panel) => panel.uid === target.dataset.movePanel);
      const to = from + Number(target.dataset.moveDirection);
      if (from >= 0 && to >= 0 && to < state.specification.sections.length) {
        const [moved] = state.specification.sections.splice(from, 1);
        state.specification.sections.splice(to, 0, moved);
        pushHistory("Panel reordered");
        renderBuild();
      }
    }
    if (target.dataset.panelSuggestion) {
      const panel = state.specification.sections.find((item) => item.uid === target.dataset.panelSuggestion);
      if (panel && !panel.locked) {
        panel.value = target.dataset.suggestionValue;
        panel.source = "suggested";
        state.promptOverride = "";
        pushHistory(`${panel.label} suggestion applied`);
        renderBuild();
      }
    }
    if (target.dataset.openLibrary) {
      state.library = target.dataset.openLibrary;
      renderBuild();
    }
    if (target.hasAttribute("data-close-library")) {
      state.library = "";
      renderBuild();
    }
    if (target.dataset.addPanel) {
      state.specification.sections.push(createPanel(target.dataset.addPanel));
      state.library = "";
      pushHistory("Creative panel added");
      renderBuild();
    }
    if (target.dataset.styleView) {
      state.styleView = target.dataset.styleView;
      renderBuild();
    }
    if (target.dataset.favoriteStyle) {
      const favorites = new Set(styleFavorites());
      if (favorites.has(target.dataset.favoriteStyle)) favorites.delete(target.dataset.favoriteStyle);
      else favorites.add(target.dataset.favoriteStyle);
      engine.settings.set({ styleFavorites: [...favorites] });
      renderBuild();
    }
    if (target.dataset.selectStyle) {
      const style = ARTISTIC_STYLES.find((item) => item.id === target.dataset.selectStyle);
      let panel = state.specification.sections.find((item) => item.kind === "artistic-style");
      if (!panel) {
        panel = createPanel("artistic-style");
        state.specification.sections.push(panel);
      }
      if (!panel.locked) panel.value = style.name;
      const recent = [style.id, ...(engine.settings.get().recentStyles || []).filter((id) => id !== style.id)].slice(0, 20);
      engine.settings.set({ recentStyles: recent });
      state.library = "";
      pushHistory("Artistic style selected");
      renderBuild();
    }
    if (target.dataset.assistantAction) {
      state.suggestions = [contextualSuggestion(state.specification, target.dataset.assistantAction)];
      renderBuild();
    }
    if (target.hasAttribute("data-complete-project")) {
      state.suggestions = recommendCompletions(state.specification);
      if (!state.suggestions.length) state.suggestions = [contextualSuggestion(state.specification, "improve")];
      renderBuild();
    }
    if (target.dataset.applySuggestion) {
      const suggestion = state.suggestions.find((item) => item.id === target.dataset.applySuggestion);
      if (suggestion) applySuggestion(suggestion);
      state.suggestions = state.suggestions.filter((item) => item.id !== target.dataset.applySuggestion);
      state.promptOverride = "";
      pushHistory("Creative suggestion applied");
      renderBuild();
    }
    if (target.dataset.dismissSuggestion) {
      state.suggestions = state.suggestions.filter((item) => item.id !== target.dataset.dismissSuggestion);
      renderBuild();
    }
    if (target.hasAttribute("data-apply-all-suggestions")) {
      state.suggestions.forEach(applySuggestion);
      state.suggestions = [];
      state.promptOverride = "";
      pushHistory("All creative suggestions applied");
      renderBuild();
    }
    if (target.hasAttribute("data-save-preset")) {
      const presets = engine.settings.get().customCreativePresets || [];
      const preset = { id: `preset-${Date.now().toString(36)}`, name: `${state.specification.categoryLabel} Preset ${presets.length + 1}`, sections: clone(state.specification.sections) };
      engine.settings.set({ customCreativePresets: [preset, ...presets].slice(0, 20) });
      renderBuild();
      showToast("Custom preset saved");
    }
    if (target.hasAttribute("data-save-project")) saveProject();
  });

  root.querySelector("[data-creative-reset]").addEventListener("click", reset);
  renderChoice();
  const api = { start, reset, openProject, resumeProject, getState: () => clone(state) };
  return api;
}
