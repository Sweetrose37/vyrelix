/**
 * Fluent builder for assembling universal projects before validation and persistence.
 */
export class ProjectBuilder {
  constructor(projectEngine, initial = {}) {
    this.projectEngine = projectEngine;
    this.value = { ...initial };
  }

  set(field, value) {
    this.value[field] = value;
    return this;
  }

  merge(values) {
    Object.assign(this.value, values);
    return this;
  }

  build() {
    return this.projectEngine.create(this.value);
  }
}
