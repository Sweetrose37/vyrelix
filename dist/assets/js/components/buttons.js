/**
 * Button behaviors shared by favorite, loading, and semantic demo actions.
 * Uses one delegated listener so dynamically rendered controls work automatically.
 */
export function initializeButtons({ showToast, openModal, setLoading }) {
  document.addEventListener("click", (event) => {
    const favorite = event.target.closest("[data-favorite]");
    if (favorite) {
      const active = favorite.getAttribute("aria-pressed") !== "true";
      favorite.setAttribute("aria-pressed", String(active));
      favorite.setAttribute("aria-label", active ? "Remove from favorites" : "Add to favorites");
      favorite.classList.toggle("is-active", active);
      favorite.textContent = active ? "♥" : "♡";
      showToast(active ? "Added to favorites" : "Removed from favorites", active ? "saved" : "deleted");
      return;
    }

    const loading = event.target.closest("[data-demo-loading]");
    if (loading) {
      setLoading(loading, true);
      window.setTimeout(() => {
        setLoading(loading, false);
        showToast("Demo action complete", "success");
      }, 1200);
      return;
    }

    const toastButton = event.target.closest("[data-demo-toast]");
    if (toastButton) {
      const type = toastButton.dataset.demoToast;
      const messages = {
        copied: "Prompt copied",
        saved: "Saved on this device",
        deleted: "Item deleted",
        error: "Something needs your attention",
        loading: "Loading component",
        success: "Action completed"
      };
      showToast(messages[type] || messages.success, type);
      return;
    }

    const modalButton = event.target.closest("[data-demo-modal]");
    if (modalButton) openModal(modalButton.dataset.demoModal);
  });
}
