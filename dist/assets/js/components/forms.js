/**
 * Input controllers for expandable selects, ranges, steppers, and search suggestions.
 */
import { clamp } from "../../utilities/random.js";

export function initializeForms() {
  document.addEventListener("click", (event) => {
    const selectRoot = event.target.closest("[data-expandable-select]");
    if (selectRoot) {
      const option = event.target.closest("[data-value]");
      const trigger = selectRoot.querySelector(":scope > button");
      const options = selectRoot.querySelector(".expandable-select__options");
      const triggerHit = event.target.closest("[data-expandable-select] > button");
      if (option) {
        selectRoot.querySelector("[data-select-value]").textContent = option.dataset.value;
        options.querySelectorAll("[role='option']").forEach((item) => item.setAttribute("aria-selected", String(item === option)));
        options.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      } else if (triggerHit === trigger) {
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!expanded));
        options.hidden = expanded;
        if (!expanded) options.querySelector("[role='option']")?.focus();
      }
    }

    const stepButton = event.target.closest("[data-stepper] [data-step]");
    if (stepButton) {
      const root = stepButton.closest("[data-stepper]");
      const output = root.querySelector("output");
      const value = clamp(Number(output.value || output.textContent) + Number(stepButton.dataset.step), Number(root.dataset.min), Number(root.dataset.max));
      output.value = String(value);
      output.textContent = String(value);
    }
  });

  document.addEventListener("input", (event) => {
    if (!event.target.matches("[data-range]")) return;
    const output = event.target.closest(".range-field")?.querySelector("[data-range-output]");
    if (output) output.value = `${event.target.value}%`;
  });

  document.addEventListener("keydown", (event) => {
    const option = event.target.closest(".expandable-select__options [role='option']");
    if (!option) return;
    const options = [...option.parentElement.querySelectorAll("[role='option']")];
    const index = options.indexOf(option);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      options[(index + 1) % options.length].focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      options[(index - 1 + options.length) % options.length].focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      const root = option.closest("[data-expandable-select]");
      root.querySelector(".expandable-select__options").hidden = true;
      root.querySelector(":scope > button").setAttribute("aria-expanded", "false");
      root.querySelector(":scope > button").focus();
    }
  });
}

export function createSearchController({ input, suggestions, clearButton, getItems, onQuery }) {
  function close() {
    suggestions.classList.add("is-hidden");
    input.setAttribute("aria-expanded", "false");
  }

  function update() {
    const query = input.value.trim().toLowerCase();
    clearButton.classList.toggle("is-hidden", !query);
    onQuery(query);
    if (!query) { close(); return; }
    const matches = getItems().filter((item) => item.title.toLowerCase().includes(query)).slice(0, 4);
    suggestions.replaceChildren(...matches.map((item) => {
      const button = document.createElement("button");
      const label = document.createElement("span");
      const kind = document.createElement("small");
      button.type = "button";
      button.setAttribute("role", "option");
      button.dataset.suggestion = item.title;
      label.textContent = item.title;
      kind.textContent = item.kind;
      button.append(label, kind);
      return button;
    }));
    suggestions.classList.toggle("is-hidden", !matches.length);
    input.setAttribute("aria-expanded", String(Boolean(matches.length)));
  }

  input.addEventListener("input", update);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      const first = suggestions.querySelector("[role='option']");
      if (first) { event.preventDefault(); first.focus(); }
    } else if (event.key === "Escape") close();
  });
  suggestions.addEventListener("click", (event) => {
    const option = event.target.closest("[data-suggestion]");
    if (!option) return;
    input.value = option.dataset.suggestion;
    update();
    close();
    input.focus();
  });
  suggestions.addEventListener("keydown", (event) => {
    const options = [...suggestions.querySelectorAll("[role='option']")];
    const index = options.indexOf(event.target);
    if (event.key === "ArrowDown") { event.preventDefault(); options[(index + 1) % options.length]?.focus(); }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index <= 0) input.focus();
      else options[index - 1].focus();
    }
    if (event.key === "Escape") { close(); input.focus(); }
  });
  clearButton.addEventListener("click", () => {
    input.value = "";
    update();
    input.focus();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("[data-search-root]")) close();
  });
  return { update, close };
}
