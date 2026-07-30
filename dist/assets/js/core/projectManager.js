/**
 * Universal project lifecycle manager: create, rename, duplicate, archive, delete, favorite, and restore.
 */
export class ProjectManager {
  constructor({ storage, projects, validation, history, recent }) {
    this.storage = storage;
    this.projects = projects;
    this.validation = validation;
    this.history = history;
    this.recent = recent;
  }

  list({ includeArchived = false } = {}) {
    const projects = this.storage.read("projects");
    return includeArchived ? [...projects, ...this.storage.read("archive")] : projects;
  }

  get(id) {
    return this.list({ includeArchived: true }).find((project) => project.id === id) || null;
  }

  create(input) {
    const project = this.projects.create(input);
    this.validation.assertProject(project);
    this.storage.update("projects", (items) => [project, ...items]);
    this.recent.touch(project.id);
    this.history.record("created", project.id);
    return project;
  }

  update(id, patch, action = "updated") {
    const current = this.get(id);
    if (!current || current.status === "archived") throw new Error("Active project not found.");
    const updated = this.projects.update(current, patch);
    this.validation.assertProject(updated, { ignoreId: id });
    this.storage.update("projects", (items) => items.map((item) => item.id === id ? updated : item));
    this.recent.touch(id);
    this.history.record(action, id, { fields: Object.keys(patch) });
    return updated;
  }

  rename(id, name) {
    return this.update(id, { name: String(name).trim() }, "renamed");
  }

  duplicate(id, name) {
    const source = this.get(id);
    if (!source) throw new Error("Project not found.");
    const copy = this.projects.duplicate(source, name);
    return this.create(copy);
  }

  archive(id) {
    const project = this.get(id);
    if (!project || project.status === "archived") throw new Error("Active project not found.");
    const archived = this.projects.update(project, { status: "archived" });
    this.storage.update("projects", (items) => items.filter((item) => item.id !== id));
    this.storage.update("archive", (items) => [archived, ...items.filter((item) => item.id !== id)]);
    this.history.record("archived", id);
    return archived;
  }

  restore(id) {
    const project = this.storage.read("archive").find((item) => item.id === id);
    if (!project) throw new Error("Archived project not found.");
    const restored = this.projects.update(project, { status: "draft" });
    this.validation.assertProject(restored, { ignoreId: id });
    this.storage.update("archive", (items) => items.filter((item) => item.id !== id));
    this.storage.update("projects", (items) => [restored, ...items]);
    this.recent.touch(id);
    this.history.record("restored", id);
    return restored;
  }

  delete(id) {
    const existed = Boolean(this.get(id));
    this.storage.update("projects", (items) => items.filter((item) => item.id !== id));
    this.storage.update("archive", (items) => items.filter((item) => item.id !== id));
    this.history.record("deleted", id);
    return existed;
  }

  favorite(id) {
    const project = this.get(id);
    if (!project) throw new Error("Project not found.");
    return this.update(id, { favorite: !project.favorite }, "favorite");
  }
}
