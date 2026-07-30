/**
 * Universal validation rules for project records, imports, and references.
 * The engine is studio-agnostic; registered project types are supplied at runtime.
 */
export const REQUIRED_PROJECT_FIELDS = Object.freeze([
  "id", "name", "type", "category", "description", "tags", "thumbnail",
  "favorite", "createdAt", "modifiedAt", "version", "creator", "theme",
  "artStyle", "colorPalette", "visibility", "status", "randomSeed"
]);

export class ValidationEngine {
  constructor({ getProjectTypes = () => [], getProjects = () => [] } = {}) {
    this.getProjectTypes = getProjectTypes;
    this.getProjects = getProjects;
  }

  validateProject(project, { ignoreId = null } = {}) {
    const errors = [];
    if (!project || typeof project !== "object" || Array.isArray(project)) {
      return { valid: false, errors: ["Project must be an object."] };
    }
    REQUIRED_PROJECT_FIELDS.forEach((field) => {
      if (!(field in project) || project[field] === null || project[field] === "") errors.push(`Missing required field: ${field}.`);
    });
    if (!Array.isArray(project.tags)) errors.push("Tags must be an array.");
    if (!Array.isArray(project.colorPalette)) errors.push("Color palette must be an array.");
    if (!this.getProjectTypes().includes(project.type)) errors.push(`Invalid project type: ${project.type || "unknown"}.`);
    const normalizedName = String(project.name || "").trim().toLocaleLowerCase();
    if (normalizedName && this.getProjects().some((item) => item.id !== (ignoreId || project.id) && String(item.name).trim().toLocaleLowerCase() === normalizedName)) {
      errors.push("A project with this name already exists.");
    }
    if (!Number.isFinite(Number(project.randomSeed))) errors.push("Random seed must be numeric.");
    return { valid: errors.length === 0, errors };
  }

  validateReferences(project, ids = new Set(this.getProjects().map((item) => item.id))) {
    const missing = (project.references || []).filter((id) => !ids.has(id));
    return { valid: missing.length === 0, errors: missing.map((id) => `Broken reference: ${id}.`) };
  }

  assertProject(project, options) {
    const result = this.validateProject(project, options);
    if (!result.valid) throw new Error(result.errors[0]);
    return project;
  }
}
