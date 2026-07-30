/**
 * Half, full, and draggable mobile sheet controller.
 */
import { trapFocusWithin } from "../../utilities/helpers.js";

const backdrop = document.querySelector("[data-sheet-backdrop]");
const sheet = backdrop.querySelector("[data-sheet]");
const title = sheet.querySelector("#sheet-title");
let restoreFocus = null;
let startY = 0;
let dragY = 0;

export function openBottomSheet({ size = "half", heading = "Prompt anatomy", content = null } = {}) {
  restoreFocus = document.activeElement;
  sheet.classList.toggle("sheet--full", size === "full");
  title.textContent = heading;
  if (content) {
    let custom = sheet.querySelector(".sheet-demo-content");
    if (!custom) {
      custom = document.createElement("div");
      custom.className = "sheet-demo-content";
      sheet.querySelector(".anatomy-list").insertAdjacentElement("beforebegin", custom);
    }
    custom.replaceChildren(...content);
    sheet.querySelector(".anatomy-list").classList.add("is-hidden");
  } else {
    sheet.querySelector(".sheet-demo-content")?.remove();
    sheet.querySelector(".anatomy-list").classList.remove("is-hidden");
  }
  backdrop.classList.remove("is-hidden", "is-closing");
  document.body.classList.add("has-overlay");
  sheet.querySelector("[data-close-sheet]")?.focus();
}

export function closeBottomSheet() {
  if (backdrop.classList.contains("is-hidden")) return;
  backdrop.classList.add("is-closing");
  window.setTimeout(() => {
    backdrop.classList.add("is-hidden");
    backdrop.classList.remove("is-closing");
    sheet.style.transform = "";
    document.body.classList.remove("has-overlay");
    restoreFocus?.focus?.();
  }, 180);
}

function demoContent() {
  return ["Reusable structure", "Backdrop and focus", "Drag to dismiss"].map((label) => {
    const article = document.createElement("article");
    article.innerHTML = `<strong>${label}</strong><p class="caption">A production-ready mobile overlay primitive.</p>`;
    return article;
  });
}

export function initializeBottomSheets() {
  document.addEventListener("click", (event) => {
    const demo = event.target.closest("[data-demo-sheet]");
    if (demo) openBottomSheet({ size: demo.dataset.demoSheet, heading: `${demo.dataset.demoSheet === "full" ? "Full" : "Half"} sheet`, content: demoContent() });
    if (event.target.closest("[data-close-sheet]")) closeBottomSheet();
  });
  backdrop.addEventListener("pointerdown", (event) => {
    if (event.target === backdrop) closeBottomSheet();
  });
  sheet.querySelector(".sheet-handle").addEventListener("pointerdown", (event) => {
    startY = event.clientY;
    dragY = 0;
    sheet.classList.add("is-dragging");
    event.currentTarget.setPointerCapture(event.pointerId);
  });
  sheet.querySelector(".sheet-handle").addEventListener("pointermove", (event) => {
    if (!sheet.classList.contains("is-dragging")) return;
    dragY = Math.max(0, event.clientY - startY);
    sheet.style.transform = `translateY(${dragY}px)`;
  });
  sheet.querySelector(".sheet-handle").addEventListener("pointerup", () => {
    sheet.classList.remove("is-dragging");
    if (dragY > 90) closeBottomSheet();
    else sheet.style.transform = "";
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop.classList.contains("is-hidden")) closeBottomSheet();
    if (!backdrop.classList.contains("is-hidden")) trapFocusWithin(event, sheet);
  });
}
