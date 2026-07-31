/**
 * Prompt composition root with registerable templates and deterministic generation.
 */
import { buildPositiveSections } from "./positivePromptEngine.js";
import { buildNegativePrompt } from "./negativePromptEngine.js";
import { buildGenerationProject, buildPromptRecord } from "./promptBuilder.js";
import { validatePromptInput, assertPromptRecord } from "./promptValidator.js";
import { getProjectSummary, getCharacterSummary } from "../generator/projectSummary.js";

export class PromptEngine {
  /** Creates a prompt engine with optional UVE resolution. */
  constructor({ visualEngine = null } = {}) {
    this.visualEngine = visualEngine;
  }

  /** Applies stable optional defaults without mutating caller data. */
  defaults(project, settings = {}) {
    return {
      promptType: settings.promptType || (project.type === "Character" ? "portrait" : "image"),
      subject: settings.subject || project.name,
      environment: settings.environment || "a setting that supports the subject",
      lighting: settings.lighting || "cinematic balanced lighting",
      camera: settings.camera || "eye level",
      composition: settings.composition || "clear visual hierarchy",
      quality: settings.quality || "premium detail",
      negativeEnabled: settings.negativeEnabled !== false,
      additional: settings.additional || "",
      seed: Number(settings.seed ?? project.randomSeed)
    };
  }

  /** Generates a validated reusable prompt record. */
  generate(project, settings = {}) {
    const normalized = this.defaults(project, settings);
    const input = validatePromptInput(project, normalized);
    if (!input.valid) throw new Error(input.errors.join(" "));
    normalized.negativePrompt = buildNegativePrompt({ enabled: normalized.negativeEnabled, value: settings.negativePrompt });
    normalized.summary = getProjectSummary(project);
    normalized.characterSummary = getCharacterSummary(project, this.visualEngine);
    const generationProject = buildGenerationProject(project, normalized);
    const sections = buildPositiveSections(project, normalized, this.visualEngine);
    const record = buildPromptRecord(project, generationProject, sections, normalized);
    const override = String(project.data?.promptOverride || "").trim();
    if (override) {
      record.prompt = override;
      record.text = override;
    }
    return assertPromptRecord(record);
  }
}
