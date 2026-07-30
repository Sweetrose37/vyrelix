/**
 * Dashboard statistics derived from the current project collection.
 */
export function getProjectStatistics(projects) {
  return Object.freeze({
    total: projects.length,
    favorites: projects.filter((project) => project.favorite).length,
    drafts: projects.filter((project) => project.status === "draft").length,
    completed: projects.filter((project) => project.status === "completed").length,
    byType: projects.reduce((result, project) => ({ ...result, [project.type]: (result[project.type] || 0) + 1 }), {})
  });
}
