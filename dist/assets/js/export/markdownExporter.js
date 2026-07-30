/**
 * Markdown prompt exporter with future PDF-ready section structure.
 */

/** Converts a prompt record to Markdown. */
export function toMarkdown(record) {
  return `# ${record.title}\n\n## Prompt\n\n${record.prompt}\n\n## Negative prompt\n\n${record.negativePrompt || "Disabled"}\n\n## Project summary\n\n${record.summary}\n\n## Metadata\n\n- Studio: ${record.studio}\n- Type: ${record.promptType}\n- Seed: ${record.seed}\n- Generated: ${record.timestamp}\n`;
}

/** Downloads a prompt as Markdown. */
export function exportMarkdown(record) {
  const blob = new Blob([toMarkdown(record)], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${String(record.title).toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
}

