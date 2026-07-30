/**
 * Builds the reusable internal generation object and prompt record.
 */
import { createId } from "../../utilities/helpers.js";
import { getPromptTemplate } from "./promptTemplates.js";
import { optimizePrompt, optimizeNegativePrompt } from "./promptOptimizer.js";

/** Converts the universal project into the stable generation schema. */
export function buildGenerationProject(project, settings = {}) {
  const visual = project.data?.visual || {};
  return {
    projectId: project.id,
    projectType: project.type,
    studio: project.studio,
    title: project.name,
    identity: { archetype: project.data?.archetype || project.category, concept: project.description, traits: project.data?.traits || "" },
    appearance: structuredClone(visual.character || {}),
    visualStyle: visual.artStyleId || project.artStyle,
    colorPalette: structuredClone(visual.colors || project.colorPalette),
    lighting: visual.lightingId || settings.lighting,
    mood: visual.moodId || project.theme,
    camera: { angle: visual.cameraAngleId || settings.camera, lens: visual.cameraLensId || "" },
    quality: visual.renderQualityId || settings.quality,
    negativePrompt: settings.negativePrompt || "",
    tags: [...project.tags],
    seed: Number(settings.seed ?? project.randomSeed),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    visual: structuredClone(visual)
  };
}

/** Builds and optimizes a complete prompt record from semantic sections. */
export function buildPromptRecord(project, generationProject, sections, settings = {}) {
  const template = getPromptTemplate(settings.promptType || "image");
  if (!template) throw new Error("Prompt template is unavailable.");
  const prompt = optimizePrompt(template.compose(sections));
  return {
    id: createId("prompt"),
    kind: "prompt",
    projectId: project.id,
    projectType: project.type,
    studio: project.studio,
    title: `${project.name} — ${template.name}`,
    subtitle: `${project.studio} · ${template.name}`,
    promptType: template.id,
    prompt,
    text: prompt,
    negativePrompt: optimizeNegativePrompt(generationProject.negativePrompt),
    summary: settings.summary || "",
    characterSummary: settings.characterSummary || "",
    tags: [...project.tags],
    seed: generationProject.seed,
    favorite: false,
    timestamp: generationProject.timestamp,
    createdAt: Date.now(),
    version: generationProject.version,
    project: generationProject
  };
}

