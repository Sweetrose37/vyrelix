/** Scene Studio registration scaffold. */
export const sceneStudio = Object.freeze({
  id: "scene", name: "Scene Studio", projectType: "Scene", icon: "▣",
  description: "Compose story moments with atmosphere and focus.", active: false, generator: false,
  visualCapabilities: Object.freeze(["color", "lighting", "mood", "composition", "camera", "effects"])
});
