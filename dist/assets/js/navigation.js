/**
 * Minimal single-page navigation with history support and accessible state.
 */
const routes = new Set(["home", "studios", "builder", "visual", "prompt", "prompt-preview", "prompt-history", "ai-image", "test-mode", "saved", "settings", "components"]);

export function createNavigation({ onRouteChange } = {}) {
  const screens = [...document.querySelectorAll("[data-screen]")];
  const navItems = [...document.querySelectorAll(".nav-item[data-route]")];

  function navigate(route, { replace = false } = {}) {
    const target = routes.has(route) ? route : "home";
    screens.forEach((screen) => screen.classList.toggle("is-active", screen.dataset.screen === target));
    navItems.forEach((item) => {
      const promptRoutes = ["prompt", "prompt-preview", "prompt-history", "ai-image", "test-mode"];
      const active = item.dataset.route === target || ((promptRoutes.includes(target) || target === "visual") && item.dataset.route === "builder");
      item.classList.toggle("is-active", active);
      item.toggleAttribute("aria-current", active);
    });
    const url = target === "home" ? location.pathname : `#${target}`;
    history[replace ? "replaceState" : "pushState"]({ route: target }, "", url);
    document.querySelector(".screen-stack")?.scrollTo?.({ top: 0 });
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = target === "home" ? "Vyrelix" : `${target[0].toUpperCase()}${target.slice(1)} · Vyrelix`;
    onRouteChange?.(target);
    document.dispatchEvent(new CustomEvent("vyrelix:route", { detail: { route: target } }));
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-route]");
    if (trigger) navigate(trigger.dataset.route);
  });
  window.addEventListener("popstate", () => navigate(location.hash.slice(1) || "home", { replace: true }));
  navigate(location.hash.slice(1) || "home", { replace: true });
  return { navigate };
}
