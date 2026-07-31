/**
 * Accessible reusable live project preview card used by every studio and dashboard.
 */
function row(label, value) {
  const item = document.createElement("span");
  const term = document.createElement("small");
  const detail = document.createElement("strong");
  term.textContent = label;
  detail.textContent = value || "Unspecified";
  item.append(term, detail);
  return item;
}

export function createProjectPreview(project, { compact = false } = {}) {
  const article = document.createElement("article");
  const thumbnail = document.createElement("div");
  const content = document.createElement("div");
  const heading = document.createElement("div");
  const title = document.createElement("h3");
  const badge = document.createElement("span");
  const metadata = document.createElement("div");
  article.className = `card project-preview${compact ? " project-preview--compact" : ""}`;
  article.dataset.projectId = project.id;
  article.dataset.projectOpen = project.id;
  article.tabIndex = 0;
  article.setAttribute("role", "button");
  article.setAttribute("aria-label", `${project.name}, ${project.type} project, ${project.status}`);
  thumbnail.className = "project-preview__thumbnail";
  thumbnail.setAttribute("role", "img");
  thumbnail.setAttribute("aria-label", project.thumbnail ? `Thumbnail for ${project.name}` : `Thumbnail placeholder for ${project.name}`);
  thumbnail.textContent = project.name.slice(0, 2).toLocaleUpperCase();
  heading.className = "project-preview__heading";
  title.textContent = project.name;
  badge.className = "badge badge--soft";
  badge.textContent = project.status;
  heading.append(title, badge);
  metadata.className = "project-preview__meta";
  metadata.append(
    row("Goal", project.data?.goal || project.description),
    row("Category", project.category),
    row("Theme", project.theme),
    row("Art style", project.artStyle),
    row("Modified", new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(project.modifiedAt)))
  );
  content.append(heading, metadata);
  article.append(thumbnail, content);
  return article;
}
