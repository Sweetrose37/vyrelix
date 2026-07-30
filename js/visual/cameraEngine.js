/**
 * Camera framing and lens composition service.
 */
export class CameraEngine {
  constructor(angles, lenses) {
    this.angles = new Map(angles.map((item) => [item.id, item]));
    this.lenses = new Map(lenses.map((item) => [item.id, item]));
  }

  compose(angleId, lensId) {
    return {
      angle: this.angles.get(angleId) || null,
      lens: this.lenses.get(lensId) || null
    };
  }
}
