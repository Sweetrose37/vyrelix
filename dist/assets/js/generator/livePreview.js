/**
 * Live, non-persistent prompt preview controller.
 */
import { renderPromptPreview } from "../prompt/promptPreview.js";

/** Generates and renders a current draft, returning null for incomplete input. */
export function updateLivePreview(manager, projectId, settings, root) {
  try {
    const record = manager.generate(projectId, settings, { save: false });
    renderPromptPreview(record, root);
    return record;
  } catch {
    renderPromptPreview(null, root);
    return null;
  }
}

