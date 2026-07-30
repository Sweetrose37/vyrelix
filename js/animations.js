/**
 * Adds bounded pointer ripples without retaining animation nodes in the DOM.
 */
export function initializeRipples() {
  document.addEventListener("pointerdown", (event) => {
    const button = event.target.closest(".ripple");
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const circle = document.createElement("span");
    circle.className = "ripple-circle";
    Object.assign(circle.style, {
      width: `${size}px`, height: `${size}px`,
      left: `${event.clientX - rect.left - size / 2}px`,
      top: `${event.clientY - rect.top - size / 2}px`
    });
    button.append(circle);
    circle.addEventListener("animationend", () => circle.remove(), { once: true });
  });
}
