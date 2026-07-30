/** Mood lookup kept visual-only and independent from character personality. */
export class MoodEngine {
  constructor(moods) {
    this.moods = new Map(moods.map((item) => [item.id, item]));
  }
  get(id) { return this.moods.get(id) || null; }
}
