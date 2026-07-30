/**
 * Project favorite state and favorite collection queries.
 */
export class FavoritesEngine {
  constructor(projectManager) {
    this.projectManager = projectManager;
  }

  toggle(id) {
    const project = this.projectManager.get(id);
    if (!project) throw new Error("Project not found.");
    return this.projectManager.update(id, { favorite: !project.favorite }, "favorite");
  }

  list() {
    return this.projectManager.list().filter((project) => project.favorite);
  }
}
