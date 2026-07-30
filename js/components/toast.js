/**
 * Semantic, queued toast notifications with live-region announcements.
 */
const region = document.querySelector("#toast-region");
const DEFAULT_DURATION = 2800;

export function showToast(message, type = "success", duration = DEFAULT_DURATION) {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.style.setProperty("--toast-duration", `${duration}ms`);
  toast.dataset.toastType = type;
  toast.textContent = message;
  region.append(toast);
  const remove = () => {
    toast.classList.add("is-leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  };
  window.setTimeout(remove, duration);
  return toast;
}
