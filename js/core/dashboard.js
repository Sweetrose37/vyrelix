/**
 * Mobile dashboard renderer for the Universal Creation Engine.
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

export function initializeDashboard({ engine, navigate, showToast }) {
  const statsRoot = document.querySelector("#dashboard-stats");
  const projectsRoot = document.querySelector("#dashboard-projects");
  const search = document.querySelector("#project-search");
  const status = document.querySelector("#project-status-filter");
  const sort = document.querySelector("#project-sort");
  let dashboardFilter = "all";

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

  statsRoot.addEventListener("click", (event) => {
    const target = event.target.closest("[data-dashboard-filter]");
    if (!target) return;
    dashboardFilter = target.dataset.dashboardFilter;
    status.value = ["draft", "completed"].includes(dashboardFilter) ? dashboardFilter : "all";
    render();
  });
  [search, status, sort].forEach((control) => control.addEventListener(control === search ? "input" : "change", render));
  document.addEventListener("vyrelix:projects-changed", render);
  render();
  return { render };
}
