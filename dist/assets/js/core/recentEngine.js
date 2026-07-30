/**
 * Most-recently-touched project index for dashboard rendering.
 */
export class RecentEngine {
  constructor(storage, { limit = 24 } = {}) {
    this.storage = storage;
    this.limit = limit;
  }

  touch(projectId) {
    return this.storage.update("recent", (ids) => [projectId, ...ids.filter((id) => id !== projectId)].slice(0, this.limit));
  }

  resolve(projects) {
    const byId = new Map(projects.map((project) => [project.id, project]));
    return this.storage.read("recent").map((id) => byId.get(id)).filter(Boolean);
  }
}
