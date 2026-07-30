/**
 * Animated tab controller with keyboard navigation and a sliding indicator.
 */
function positionIndicator(root, active) {
  const indicator = root.querySelector(".tab-indicator");
  if (!indicator || !active) return;
  indicator.style.width = `${Math.min(36, active.offsetWidth - 24)}px`;
  indicator.style.setProperty("--tab-x", `${active.offsetLeft + (active.offsetWidth - Math.min(36, active.offsetWidth - 24)) / 2}px`);
}

function activate(root, button) {
  const tabName = button.dataset.tab;
  root.querySelectorAll("[role='tab']").forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
    const active = panel.dataset.tabPanel === tabName;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
  positionIndicator(root, button);
  button.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
}

export function initializeTabs() {
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const active = root.querySelector("[role='tab'].is-active");
    positionIndicator(root, active);
    root.addEventListener("click", (event) => {
      const button = event.target.closest("[role='tab']");
      if (button) activate(root, button);
    });
    root.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...root.querySelectorAll("[role='tab']")];
      const current = tabs.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      activate(root, tabs[next]);
    });
  });
  window.addEventListener("resize", () => document.querySelectorAll("[data-tabs]").forEach((root) => positionIndicator(root, root.querySelector(".is-active"))));
  document.addEventListener("vyrelix:route", (event) => {
    if (event.detail.route !== "components") return;
    requestAnimationFrame(() => document.querySelectorAll("[data-tabs]").forEach((root) => positionIndicator(root, root.querySelector(".is-active"))));
  });
}
