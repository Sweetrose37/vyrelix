/**
 * Nine-step prompt-generation pipeline coordinator.
 */
import { PromptEngine } from "../prompt/promptEngine.js";
import { validatePromptInput } from "../prompt/promptValidator.js";

export class GeneratorManager {
  /** Creates a manager around project, visual, and prompt services. */
  constructor({ projects, visualEngine = null, storage = null } = {}) {
    this.projects = projects;
    this.visualEngine = visualEngine;
    this.storage = storage;
    this.promptEngine = new PromptEngine({ visualEngine });
  }

  /** Collects current project data without mutating persistence. */
  collect(projectId) {
    return this.projects.get(projectId);
  }

  /** Applies UVE compatibility validation when visual metadata exists. */
  validateCompatibility(project) {
    if (!project?.data?.visual || !this.visualEngine) return { valid: true, errors: [] };
    return this.visualEngine.validator.validate(project.data.visual);
  }

  /** Runs collect, validate, compatibility, defaults, build, optimize, preview, and optional save. */
  generate(projectId, settings = {}, { save = true } = {}) {
    const project = this.collect(projectId);
    const input = validatePromptInput(project, settings);
    if (!input.valid) throw new Error(input.errors.join(" "));
    const compatibility = this.validateCompatibility(project);
    if (!compatibility.valid) throw new Error(compatibility.errors.join(" "));
    const record = this.promptEngine.generate(project, settings);
    if (save) this.storage?.save(record);
    return record;
  }
}

