/**
 * Compact summaries shared by preview, copy, and export surfaces.
 */

/** Builds a universal project summary. */
export function getProjectSummary(project) {
  return [
    `${project.name} is a ${project.type.toLocaleLowerCase()} project in ${project.studio}`,
    project.description && project.description !== "No description yet." ? project.description : "",
    `Theme: ${project.theme}`,
    `Art style: ${project.artStyle}`,
    project.tags?.length ? `Tags: ${project.tags.join(", ")}` : ""
  ].filter(Boolean).join(". ").replace(/\.\./g, ".");
}

/** Builds a character-specific summary while remaining safe for other studios. */
export function getCharacterSummary(project, visualEngine = null) {
  if (project.type !== "Character") return `${project.type} Studio project.`;
  const data = project.data || {};
  const character = data.visual?.character || {};
  const resolve = (type, id) => visualEngine?.getAsset(type, id)?.name || "";
  const features = [
    resolve("face", character.faceId),
    resolve("eyes", character.eyesId),
    resolve("hair", character.hairId),
    resolve("skin", character.skinId),
    resolve("species", character.speciesId)
  ].filter(Boolean);
  return [
    data.archetype || project.category,
    data.presence,
    features.length ? features.join(", ") : "",
    data.traits
  ].filter(Boolean).join(" · ") || "Original character";
}

