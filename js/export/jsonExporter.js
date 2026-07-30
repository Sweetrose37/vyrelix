/**
 * Portable JSON prompt exporter.
 */

/** Downloads a versioned JSON prompt envelope. */
export function exportJSON(record) {
  return download(JSON.stringify({ format: "vyrelix-prompt", schemaVersion: 1, record }, null, 2), record, "json", "application/json");
}

/** Creates and releases a browser download. */
function download(content, record, extension, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slug(record?.title)}.${extension}`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/** Produces a safe filename. */
function slug(value) {
  return String(value || "vyrelix-prompt").toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

