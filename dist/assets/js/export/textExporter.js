/**
 * Plain-text prompt exporter.
 */
import { formatPromptText } from "../prompt/promptFormatter.js";

/** Downloads a prompt as TXT. */
export function exportText(record) {
  const blob = new Blob([formatPromptText(record)], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${String(record.title).toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

