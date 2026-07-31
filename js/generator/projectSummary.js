/**
 * Compact summaries shared by preview, copy, and export surfaces.
 */

/** Builds a universal project summary. */
export function getProjectSummary(project) {
  return [
    `${project.name} is a ${String(project.category || project.type).toLocaleLowerCase()} project`,
    project.description && project.description !== "No description yet." ? project.description : "",
    `Theme: ${project.theme}`,
    `Art style: ${project.artStyle}`,
    project.tags?.length ? `Tags: ${project.tags.join(", ")}` : ""
  ].filter(Boolean).join(". ").replace(/\.\./g, ".");
}

/** Builds a character-specific summary while remaining safe for other studios. */
export function getCharacterSummary(project, visualEngine = null) {
  const data = project.data || {};
  if (!["Character", "Creature", "Mascot"].includes(project.type)) {
    const answers = Object.values(data.answers || {}).filter(Boolean);
    return [data.creativeDirection, ...answers].filter(Boolean).slice(0, 4).join(" · ") || `${project.category || project.type} creative direction`;
  }
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
