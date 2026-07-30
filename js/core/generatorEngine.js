/**
 * Seeded generator registry. Only Character has an implementation in this phase.
 */
function seededChoice(values, seed) {
  const index = Math.abs(Math.imul(seed ^ 0x9e3779b9, 2654435761)) % values.length;
  return values[index];
}

export class GeneratorEngine {
  constructor() {
    this.generators = new Map();
  }

  register(type, generator, { active = false } = {}) {
    this.generators.set(type, { generator, active });
    return this;
  }

  canGenerate(type) {
    return Boolean(this.generators.get(type)?.active);
  }

  generate(type, { seed = Math.floor(Math.random() * 2_147_483_647), datasets = {} } = {}) {
    const entry = this.generators.get(type);
    if (!entry) throw new Error(`Generator is not registered for ${type}.`);
    if (!entry.active) return { available: false, type, reason: "Coming Soon" };
    return { available: true, type, seed, value: entry.generator({ seed, datasets, choose: (values) => seededChoice(values, seed) }) };
  }
}
