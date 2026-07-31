/**
 * Minimal single-page navigation with history support and accessible state.
 */
const routes = new Set(["home", "create", "project", "visual", "prompt", "prompt-preview", "prompt-history", "saved", "settings"]);
const routeAliases = Object.freeze({
  studios: "create",
  builder: "create",
  "prompt-legacy": "prompt",
  "ai-image": "prompt-preview",
  "ai-image-legacy": "prompt-preview",
  "image-gallery": "saved",
  "provider-settings": "settings",
  "test-mode": "home",
  components: "settings"
});
const routeTitles = Object.freeze({
  home: "Home", create: "Create Anything", project: "Project",
  visual: "Visual Direction", prompt: "Creative Brief",
  "prompt-preview": "Brief Preview", "prompt-history": "Brief History",
  saved: "Projects", settings: "Settings"
});

export function createNavigation({ onRouteChange } = {}) {
  const screens = [...document.querySelectorAll("[data-screen]")];
  const navItems = [...document.querySelectorAll(".nav-item[data-route]")];

  function navigate(route, { replace = false, focus = true } = {}) {
    const requested = routeAliases[route] || route;
    const target = routes.has(requested) ? requested : "home";
    const current = screens.find((screen) => screen.classList.contains("is-active"))?.dataset.screen;
    screens.forEach((screen) => {
      const active = screen.dataset.screen === target;
      screen.classList.toggle("is-active", active);
      screen.toggleAttribute("inert", !active);
      screen.setAttribute("aria-hidden", String(!active));
    });
    navItems.forEach((item) => {
      const promptRoutes = ["prompt", "prompt-preview", "prompt-history"];
      const creationRoutes = ["create", "project", "visual", ...promptRoutes];
      const active = item.dataset.route === target || (creationRoutes.includes(target) && item.dataset.route === "create");
      item.classList.toggle("is-active", active);
      item.toggleAttribute("aria-current", active);
    });
    const url = target === "home" ? location.pathname : `#${target}`;
    history[replace || current === target ? "replaceState" : "pushState"]({ route: target }, "", url);
    document.querySelector(".screen-stack")?.scrollTo?.({ top: 0 });
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = target === "home" ? "Vyrelix" : `${routeTitles[target]} · Vyrelix`;
    onRouteChange?.(target);
    document.dispatchEvent(new CustomEvent("vyrelix:route", { detail: { route: target } }));
    if (focus) {
      const heading = screens.find((screen) => screen.dataset.screen === target)?.querySelector("h1");
      if (heading) {
        heading.tabIndex = -1;
        requestAnimationFrame(() => heading.focus({ preventScroll: true }));
      }
    }
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-route]");
    if (trigger) navigate(trigger.dataset.route);
  });
  window.addEventListener("popstate", () => navigate(location.hash.slice(1) || "home", { replace: true }));
  navigate(location.hash.slice(1) || "home", { replace: true, focus: false });
  return { navigate };
}
