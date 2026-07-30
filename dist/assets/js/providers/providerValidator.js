/**
 * Provider contract and request validation helpers.
 */

/** Validates provider selection and prompt data. */
export function validateProviderRequest(provider, request) {
  const errors = [];
  if (!provider) errors.push("Provider missing.");
  if (!String(request?.prompt || "").trim()) errors.push("A generated prompt is required.");
  if (provider && !provider.configured) errors.push(provider.id === "openai" ? "API key missing." : "Provider not configured.");
  const adapter = provider?.validate?.(request);
  if (adapter && !adapter.valid) errors.push(...adapter.errors);
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

/** Verifies that a provider can be selected without contacting it. */
export function validateProviderSettings(provider) {
  if (!provider) return { valid: false, message: "Provider missing." };
  if (!provider.configured) return { valid: false, message: provider.id === "openai" ? "API Key Required" : "Provider not configured." };
  return { valid: true, message: "Provider ready." };
}

