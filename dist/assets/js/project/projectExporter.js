/**
 * JSON export framework with portable format metadata for future cloud synchronization.
 */
export function serializeProject(project) {
  return JSON.stringify({ format: "vyrelix-project", schemaVersion: 1, exportedAt: new Date().toISOString(), project }, null, 2);
}

export function downloadProject(project) {
  const blob = new Blob([serializeProject(project)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${project.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-") || "vyrelix-project"}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
