/** Composition rule lookup shared across every UVE-compatible studio. */
export class CompositionEngine {
  constructor(rules) {
    this.rules = new Map(rules.map((item) => [item.id, item]));
  }
  get(id) { return this.rules.get(id) || null; }
}
