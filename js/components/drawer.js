/**
 * Side and bottom drawer controller with backdrop dismissal and focus restoration.
 */
import { trapFocusWithin } from "../../utilities/helpers.js";

const backdrop = document.querySelector("[data-drawer-backdrop]");
let activeDrawer = null;
let restoreFocus = null;

export function openDrawer(name) {
  const drawer = backdrop.querySelector(`[data-drawer="${name}"]`);
  if (!drawer) return;
  restoreFocus = document.activeElement;
  backdrop.querySelectorAll("[data-drawer]").forEach((item) => item.classList.toggle("is-hidden", item !== drawer));
  activeDrawer = drawer;
  backdrop.classList.remove("is-hidden", "is-closing");
  document.body.classList.add("has-overlay");
  drawer.querySelector("button")?.focus();
}

export function closeDrawer() {
  if (!activeDrawer) return;
  backdrop.classList.add("is-closing");
  window.setTimeout(() => {
    backdrop.classList.add("is-hidden");
    backdrop.classList.remove("is-closing");
    activeDrawer = null;
    document.body.classList.remove("has-overlay");
    restoreFocus?.focus?.();
  }, 180);
}

export function initializeDrawers() {
  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open-drawer]");
    if (opener) openDrawer(opener.dataset.openDrawer);
    if (event.target.closest("[data-close-drawer]")) closeDrawer();
    if (activeDrawer && event.target.closest("[data-route]")) closeDrawer();
  });
  backdrop.addEventListener("pointerdown", (event) => {
    if (event.target === backdrop) closeDrawer();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeDrawer) closeDrawer();
    if (activeDrawer) trapFocusWithin(event, activeDrawer);
  });
}
