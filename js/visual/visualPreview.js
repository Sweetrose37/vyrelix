/**
 * Reusable live visual preview card. It uses CSS shapes and metadata only—no image generation.
 */
export function createVisualPreview() {
  const article = document.createElement("article");
  article.className = "visual-preview card";
  article.setAttribute("aria-label", "Live universal visual preview");
  article.innerHTML = `
    <div class="visual-preview__stage" role="img" aria-label="Abstract live character preview">
      <span class="visual-preview__halo" aria-hidden="true"></span>
      <span class="visual-preview__wings" aria-hidden="true"></span>
      <span class="visual-preview__horns" aria-hidden="true"></span>
      <span class="visual-preview__tail" aria-hidden="true"></span>
      <span class="visual-preview__head" aria-hidden="true">
        <i class="visual-preview__hair"></i><i class="visual-preview__eye visual-preview__eye--left"></i>
        <i class="visual-preview__eye visual-preview__eye--right"></i><i class="visual-preview__mark"></i><i class="visual-preview__beard"></i>
      </span>
      <span class="visual-preview__body" aria-hidden="true"></span>
      <span class="visual-preview__mechanical" aria-hidden="true"></span>
      <span class="visual-preview__effect" aria-hidden="true"></span>
    </div>
    <div class="visual-preview__summary" aria-live="polite">
      <span><small>Palette</small><strong data-preview-palette>Balanced</strong></span>
      <span><small>Style</small><strong data-preview-style>Illustration</strong></span>
      <span><small>Lighting</small><strong data-preview-lighting>Soft Light</strong></span>
    </div>`;
  return article;
}

export function updateVisualPreview(root, visual, engine) {
  const color = (id, fallback) => engine.colors.get(id)?.value || fallback;
  root.style.setProperty("--visual-primary", color(visual.colors.primaryId, "#D4AF37"));
  root.style.setProperty("--visual-secondary", color(visual.colors.secondaryId, "#C9CED8"));
  root.style.setProperty("--visual-accent", color(visual.colors.accentId, "#F7F3DE"));
  root.style.setProperty("--visual-background", color(visual.colors.backgroundId, "#090911"));
  root.style.setProperty("--visual-glow", color(visual.colors.glowId, "#F7F3DE"));
  root.style.setProperty("--visual-outline", color(visual.colors.outlineId, "#C9CED8"));
  root.style.setProperty("--visual-skin", engine.getAsset("skin", visual.character.skinId)?.value || "#B87645");
  const feature = (category, id) => engine.getAsset(category, id)?.name || "None";
  const horns = feature("horns", visual.character.hornsId);
  const wings = feature("wings", visual.character.wingsId);
  const halo = feature("halo", visual.character.haloId);
  const tails = feature("tails", visual.character.tailsId);
  const mechanical = feature("mechanical", visual.character.mechanicalId);
  root.dataset.horns = horns === "None" ? "false" : "true";
  root.dataset.wings = wings === "None" ? "false" : "true";
  root.dataset.halo = halo === "None" ? "false" : "true";
  root.dataset.tails = tails === "None" ? "false" : "true";
  root.dataset.mechanical = mechanical === "None" ? "false" : "true";
  root.dataset.face = visual.character.faceId;
  root.dataset.hair = visual.character.hairId;
  root.dataset.facialHair = feature("facialHair", visual.character.facialHairId) === "None" ? "false" : "true";
  root.dataset.markings = ["freckles", "scars", "birthmarks", "makeup"].some((category) => !feature(category, visual.character[`${category}Id`]).startsWith("No ")) ? "true" : "false";
  root.dataset.effects = visual.effects.length ? "true" : "false";
  root.querySelector(".visual-preview__stage").setAttribute("aria-label", [
    feature("species", visual.character.speciesId), feature("face", visual.character.faceId),
    feature("eyes", visual.character.eyesId), feature("hair", visual.character.hairId),
    wings, horns, halo, tails, mechanical
  ].filter((name) => name !== "None").join(", ") || "Abstract live character preview");
  root.querySelector("[data-preview-palette]").textContent = engine.colors.get(visual.colors.primaryId)?.name || "Custom";
  root.querySelector("[data-preview-style]").textContent = engine.getAsset("artStyle", visual.artStyleId)?.name || "Unspecified";
  root.querySelector("[data-preview-lighting]").textContent = engine.getAsset("lighting", visual.lightingId)?.name || "Unspecified";
}
