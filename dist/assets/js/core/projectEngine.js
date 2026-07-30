/**
 * Defines and evolves the universal project model shared by every Vyrelix studio.
 */
import { createId } from "../../utilities/helpers.js";

export const PROJECT_STATUSES = Object.freeze(["draft", "completed", "archived"]);
export const PROJECT_VISIBILITIES = Object.freeze(["private", "unlisted", "public"]);

export class ProjectEngine {
  constructor({ version = "1.0.0", creator = "Local creator" } = {}) {
    this.version = version;
    this.creator = creator;
  }

  create(input = {}) {
    const now = new Date().toISOString();
    return {
      id: input.id || createId("project"),
      name: String(input.name || "Untitled project").trim(),
      type: input.type || "Character",
      category: input.category || "Original",
      description: input.description || "No description yet.",
      tags: [...new Set((input.tags || []).map((tag) => String(tag).trim()).filter(Boolean))],
      thumbnail: input.thumbnail || "placeholder",
      favorite: Boolean(input.favorite),
      createdAt: input.createdAt || now,
      modifiedAt: input.modifiedAt || now,
      version: input.version || this.version,
      creator: input.creator || this.creator,
      theme: input.theme || "Original",
      artStyle: input.artStyle || "Unspecified",
      colorPalette: Array.isArray(input.colorPalette) ? [...input.colorPalette] : [],
      visibility: PROJECT_VISIBILITIES.includes(input.visibility) ? input.visibility : "private",
      status: PROJECT_STATUSES.includes(input.status) ? input.status : "draft",
      randomSeed: Number.isFinite(Number(input.randomSeed)) ? Number(input.randomSeed) : Math.floor(Math.random() * 2_147_483_647),
      studio: input.studio || `${input.type || "Character"} Studio`,
      data: input.data && typeof input.data === "object" ? structuredClone(input.data) : {},
      references: Array.isArray(input.references) ? [...input.references] : []
    };
  }

  update(project, patch = {}) {
    return this.create({ ...project, ...patch, id: project.id, createdAt: project.createdAt, modifiedAt: new Date().toISOString() });
  }

  duplicate(project, name = `${project.name} Copy`) {
    return this.create({ ...structuredClone(project), id: undefined, name, favorite: false, status: "draft", createdAt: undefined, modifiedAt: undefined });
  }
}
