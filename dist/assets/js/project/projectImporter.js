/**
 * Safe JSON import parser. Validation and duplicate-name policy remain owned by the UCE.
 */
export function parseProjectJSON(source) {
  const payload = typeof source === "string" ? JSON.parse(source) : source;
  if (payload?.format !== "vyrelix-project" || payload?.schemaVersion !== 1 || !payload.project) {
    throw new Error("Unsupported Vyrelix project file.");
  }
  return structuredClone(payload.project);
}

export async function readProjectFile(file) {
  if (!file || file.type && file.type !== "application/json") throw new Error("Choose a JSON project file.");
  return parseProjectJSON(await file.text());
}
