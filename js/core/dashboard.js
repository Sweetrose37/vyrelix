/**
 * Mobile dashboard and Studio Selection renderer for the Universal Creation Engine.
 * DOM updates are fragment-based and shared project previews are rendered in bounded batches.
 */
import { createProjectPreview } from "../project/projectPreview.js";
import { getProjectStatistics } from "../project/projectStatistics.js";
import { createEmptyState } from "../components/loading.js";
import { renderInBatches } from "../components/cards.js";

function createStatistic(label, value, filter) {
  const button = document.createElement("button");
  const count = document.createElement("strong");
  const copy = document.createElement("small");
  button.type = "button";
  button.className = "dashboard-stat";
  button.dataset.dashboardFilter = filter;
  button.setAttribute("aria-label", `Show ${label.toLocaleLowerCase()}: ${value}`);
  count.textContent = String(value);
  copy.textContent = label;
  button.append(count, copy);
  return button;
}

function createStudioCard(studio) {
  const button = document.createElement("button");
  const icon = document.createElement("span");
  const copy = document.createElement("span");
  const heading = document.createElement("span");
  const title = document.createElement("h2");
  const status = document.createElement("span");
  const description = document.createElement("p");
  button.type = "button";
  button.className = `studio-option${studio.active ? " studio-option--active" : ""}`;
  button.dataset.studioId = studio.id;
  button.disabled = !studio.active;
  button.setAttribute("aria-label", `${studio.name}. ${studio.active ? "Open studio" : "Coming Soon"}. ${studio.description}`);
  icon.className = "studio-option__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = studio.icon;
  copy.className = "studio-option__copy";
  heading.className = "studio-option__heading";
  title.textContent = studio.name;
  status.className = `badge${studio.active ? "" : " badge--soft"}`;
  status.textContent = studio.active ? "Open" : "Coming Soon";
  description.textContent = studio.description;
  heading.append(title, status);
  copy.append(heading, description);
  button.append(icon, copy);
  return button;
}

export function initializeDashboard({ engine, navigate, showToast }) {
  const statsRoot = document.querySelector("#dashboard-stats");
  const projectsRoot = document.querySelector("#dashboard-projects");
  const studiosRoot = document.querySelector("#studio-selector");
  const search = document.querySelector("#project-search");
  const status = document.querySelector("#project-status-filter");
  const sort = document.querySelector("#project-sort");
  let dashboardFilter = "all";

  studiosRoot.replaceChildren(...engine.studios.list().filter((studio) => studio.id !== "icon").map(createStudioCard));

  function render() {
    const projects = engine.projects.list();
    const statistics = getProjectStatistics(projects);
    statsRoot.replaceChildren(
      createStatistic("Recent", statistics.total, "all"),
      createStatistic("Favorites", statistics.favorites, "favorite"),
      createStatistic("Drafts", statistics.drafts, "draft"),
      createStatistic("Completed", statistics.completed, "completed")
    );
    const filters = {};
    if (status.value !== "all") filters.status = status.value;
    if (dashboardFilter === "favorite") filters.favorite = true;
    if (["draft", "completed"].includes(dashboardFilter)) filters.status = dashboardFilter;
    const matches = engine.query({ query: search.value, filters, sort: sort.value }).slice(0, engine.settings.get().pageSize);
    if (!matches.length) {
      projectsRoot.replaceChildren(createEmptyState(search.value ? "search" : "saved"));
      return;
    }
    renderInBatches(matches, (project) => createProjectPreview(project, { compact: true }), projectsRoot, { batchSize: 6 });
  }

  studiosRoot.addEventListener("click", (event) => {
    const studio = engine.studios.get(event.target.closest("[data-studio-id]")?.dataset.studioId);
    if (!studio?.active) return;
    navigate(studio.route || "home");
  });
  statsRoot.addEventListener("click", (event) => {
    const target = event.target.closest("[data-dashboard-filter]");
    if (!target) return;
    dashboardFilter = target.dataset.dashboardFilter;
    status.value = ["draft", "completed"].includes(dashboardFilter) ? dashboardFilter : "all";
    render();
  });
  [search, status, sort].forEach((control) => control.addEventListener(control === search ? "input" : "change", render));
  document.querySelector("[data-random-character]").addEventListener("click", () => {
    const generated = engine.generators.generate("Character", { datasets: engine.datasets });
    try {
      const project = engine.projects.create({
        ...generated.value,
        type: "Character",
        description: "Seeded character concept created by the Universal Randomizer.",
        tags: ["random", generated.value.category.toLocaleLowerCase()]
      });
      showToast(`${project.name} added to projects`, "saved");
      render();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
  document.querySelector(".template-scroll").addEventListener("click", (event) => {
    const template = event.target.closest("[data-template]")?.dataset.template;
    if (!template) return;
    if (template === "Blank") navigate("builder");
    else showToast(`${template} template framework is ready for a future studio`, "success");
  });
  document.addEventListener("vyrelix:projects-changed", render);
  render();
  return { render };
}
