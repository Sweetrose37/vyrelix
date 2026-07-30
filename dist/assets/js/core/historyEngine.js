/**
 * Bounded, append-only project activity history.
 */
export class HistoryEngine {
  constructor(storage, { limit = 200 } = {}) {
    this.storage = storage;
    this.limit = limit;
  }

  record(action, projectId, details = {}) {
    const entry = { action, projectId, details, at: new Date().toISOString() };
    this.storage.update("history", (items) => [entry, ...items].slice(0, this.limit));
    return entry;
  }

  list(projectId = null) {
    const entries = this.storage.read("history");
    return projectId ? entries.filter((entry) => entry.projectId === projectId) : entries;
  }
}
