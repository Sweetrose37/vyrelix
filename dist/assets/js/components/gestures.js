/**
 * Opt-in mobile gestures: swipes, long press, touch hold, double tap, and pull refresh.
 */
export function initializeGestures({ showToast, onPullRefresh } = {}) {
  let startX = 0;
  let startY = 0;
  let activeCard = null;
  let holdTimer = null;
  let lastTap = 0;
  let pulling = false;

  document.addEventListener("pointerdown", (event) => {
    activeCard = event.target.closest("[data-gesture-card]");
    startX = event.clientX;
    startY = event.clientY;
    if (activeCard) {
      holdTimer = window.setTimeout(() => {
        activeCard.classList.add("is-held");
        showToast?.("Hold actions ready", "loading");
      }, 520);
    } else if (window.scrollY <= 0 && event.pointerType === "touch") {
      pulling = true;
    }
  }, { passive: true });

  document.addEventListener("pointermove", (event) => {
    if (Math.abs(event.clientX - startX) > 10 || Math.abs(event.clientY - startY) > 10) clearTimeout(holdTimer);
  }, { passive: true });

  document.addEventListener("pointerup", (event) => {
    clearTimeout(holdTimer);
    if (activeCard) {
      const deltaX = event.clientX - startX;
      activeCard.classList.remove("is-held", "is-swiped-left", "is-swiped-right");
      if (Math.abs(deltaX) > 55) {
        const direction = deltaX < 0 ? "left" : "right";
        activeCard.classList.add(`is-swiped-${direction}`);
        showToast?.(`Swiped ${direction}`, "success");
        window.setTimeout(() => activeCard?.classList.remove(`is-swiped-${direction}`), 420);
      }
      const now = Date.now();
      if (now - lastTap < 320 && Math.abs(deltaX) < 10) {
        activeCard.querySelector("[data-favorite]")?.click();
        lastTap = 0;
      } else lastTap = now;
    } else if (pulling && event.clientY - startY > 80) {
      onPullRefresh?.();
      showToast?.("Collection refreshed", "success");
    }
    activeCard = null;
    pulling = false;
  }, { passive: true });

  document.addEventListener("pointercancel", () => {
    clearTimeout(holdTimer);
    activeCard?.classList.remove("is-held");
    activeCard = null;
    pulling = false;
  });
}
