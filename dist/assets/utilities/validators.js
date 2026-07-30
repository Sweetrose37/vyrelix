/**
 * Small, composable validators for client-side form feedback.
 */
export function validateRequired(value, message = "This field is required.") {
  return String(value ?? "").trim() ? "" : message;
}

export function validateLength(value, maximum, message = `Use ${maximum} characters or fewer.`) {
  return String(value ?? "").length <= maximum ? "" : message;
}
