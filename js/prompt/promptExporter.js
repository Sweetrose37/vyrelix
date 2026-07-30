/**
 * Prompt export facade for text, Markdown, and JSON formats.
 */
import { exportJSON } from "../export/jsonExporter.js";
import { exportText } from "../export/textExporter.js";
import { exportMarkdown } from "../export/markdownExporter.js";

/** Downloads a prompt record in a supported format. */
export function exportPrompt(record, format) {
  const exporters = { json: exportJSON, txt: exportText, md: exportMarkdown };
  if (!exporters[format]) throw new Error("Unsupported export format.");
  return exporters[format](record);
}

