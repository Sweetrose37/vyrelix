/**
 * Validation for project inputs, templates, and generated prompt records.
 */
import { getPromptTemplate } from "./promptTemplates.js";

/** Validates generation inputs before pipeline execution. */
export function validatePromptInput(project, settings = {}) {
  const errors = [];
  if (!project?.id) errors.push("Choose a saved project.");
  if (!String(project?.name || "").trim()) errors.push("The project needs a title.");
  if (!getPromptTemplate(settings.promptType || "image")) errors.push("Choose a valid prompt type.");
  return { valid: errors.length === 0, errors };
}

/** Validates the generated record before storage or export. */
export function validatePromptRecord(record) {
  const errors = [];
  ["id", "projectId", "studio", "promptType", "title", "prompt", "timestamp", "version"].forEach((field) => {
    if (!record?.[field]) errors.push(`Missing ${field}.`);
  });
  if (!String(record?.prompt || "").trim()) errors.push("Generated prompt cannot be empty.");
  return { valid: errors.length === 0, errors };
}

/** Throws a readable error when validation fails. */
export function assertPromptRecord(record) {
  const result = validatePromptRecord(record);
  if (!result.valid) throw new Error(result.errors.join(" "));
  return record;
}

