/**
 * Registerable natural-language prompt templates shared by every studio.
 */
const templates = new Map();

/** Registers a validated prompt template. */
export function registerPromptTemplate(template) {
  if (!template?.id || !template?.name || typeof template.compose !== "function") {
    throw new TypeError("Prompt templates require an id, name, and compose function.");
  }
  templates.set(template.id, Object.freeze({ ...template }));
  return template;
}

/** Returns every registered prompt template. */
export function listPromptTemplates() {
  return [...templates.values()];
}

/** Returns a template by stable id. */
export function getPromptTemplate(id) {
  return templates.get(id) || null;
}

/** Turns non-empty sections into a readable professional paragraph. */
function narrative(sections) {
  return sections.filter(Boolean).map((section) => section.replace(/[.\s]+$/, "")).join(". ") + ".";
}

[
  ["image", "Image Prompt", "Create a polished image"],
  ["portrait", "Portrait Prompt", "Create a refined portrait"],
  ["full-body", "Full Body Prompt", "Create a full-body character study"],
  ["concept-art", "Concept Art Prompt", "Create professional concept art"],
  ["character-sheet", "Character Sheet Prompt", "Create a cohesive character reference sheet"],
  ["scene", "Scene Prompt", "Create an immersive narrative scene"],
  ["description", "Description Prompt", "Write a vivid visual description"]
].forEach(([id, name, opening]) => registerPromptTemplate({
  id,
  name,
  /** Composes ordered semantic sections instead of concatenating keywords. */
  compose: (sections) => narrative([
    `${opening} for ${sections.output || "a creative asset"} featuring ${sections.subject}`,
    sections.identity,
    sections.brief,
    sections.appearance,
    sections.visualDetails,
    sections.materials,
    sections.colors,
    sections.environment,
    sections.lighting,
    sections.camera,
    sections.composition,
    sections.mood,
    sections.artStyle,
    sections.quality,
    sections.additional
  ])
}));
