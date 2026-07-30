/**
 * Project-layer facade that combines schema and reference validation.
 */
export function validateProjectForPersistence(project, validationEngine) {
  const schema = validationEngine.validateProject(project);
  const references = validationEngine.validateReferences(project);
  return { valid: schema.valid && references.valid, errors: [...schema.errors, ...references.errors] };
}
