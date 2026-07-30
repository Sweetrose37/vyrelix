/**
 * Normalizes visual dataset entries so every UVE selector can share one contract.
 */
export function createVisualOptions(names, category, extra = {}) {
  return Object.freeze(names.map((name, index) => Object.freeze({
    id: `${category.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`,
    name,
    category,
    tags: Object.freeze([category.toLocaleLowerCase(), ...String(name).toLocaleLowerCase().split(/\s+/)]),
    studios: Object.freeze(["*"]),
    ...extra
  })));
}

export function freezeVisualGroups(groups) {
  return Object.freeze(Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, Object.freeze(value)])));
}
