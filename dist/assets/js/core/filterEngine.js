/**
 * Composable filtering and sorting for universal project collections.
 */
export class FilterEngine {
  apply(projects, filters = {}, sort = "modified-desc") {
    const filtered = projects.filter((project) => Object.entries(filters).every(([key, value]) => {
      if (value === "" || value === null || value === undefined || value === "all") return true;
      if (key === "date") return String(project.modifiedAt).startsWith(value);
      if (key === "favorite") return project.favorite === (value === true || value === "true");
      const projectKey = key === "projectType" ? "type" : key;
      return String(project[projectKey] || "").toLocaleLowerCase() === String(value).toLocaleLowerCase();
    }));
    const selectors = {
      "modified-desc": (a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt),
      "modified-asc": (a, b) => new Date(a.modifiedAt) - new Date(b.modifiedAt),
      "name-asc": (a, b) => a.name.localeCompare(b.name),
      "name-desc": (a, b) => b.name.localeCompare(a.name),
      "created-desc": (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    };
    return [...filtered].sort(selectors[sort] || selectors["modified-desc"]);
  }
}
