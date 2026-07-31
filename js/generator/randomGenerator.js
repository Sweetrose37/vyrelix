/**
 * Compatibility-aware random project and prompt helpers.
 */

/** Returns a random item from an array. */
function choice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export class RandomGenerator {
  /** Connects the UCE and optional UVE. */
  constructor({ engine, visualEngine = null }) {
    this.engine = engine;
    this.visualEngine = visualEngine;
  }

  /** Generates character-compatible identity metadata for the universal engine. */
  character() {
    return this.engine.generators.generate("Character", { datasets: this.engine.datasets }).value;
  }

  /** Generates compatible appearance metadata. */
  appearance() {
    return this.visualEngine?.randomAll(Date.now()) || null;
  }

  /** Generates random prompt settings. */
  prompt() {
    return {
      promptType: choice(["image", "portrait", "full-body", "concept-art", "character-sheet", "scene", "description"]),
      environment: choice(this.engine.datasets.environment),
      lighting: choice(this.engine.datasets.lighting),
      camera: choice(this.engine.datasets.camera),
      composition: choice(this.engine.datasets.composition),
      quality: choice(["premium detail", "editorial finish", "production-ready clarity"])
    };
  }

  /** Generates a complete unsaved project input with compatible visual state. */
  completeProject() {
    const character = this.character();
    const visual = this.appearance();
    return {
      ...character,
      type: "Character",
      studio: "Universal Creative Engine",
      description: "A generated demo character ready for prompt testing.",
      data: { archetype: character.category, visual }
    };
  }
}
