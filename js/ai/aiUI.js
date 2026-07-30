/**
 * Lazily loaded provider generation, settings, gallery, and developer interface.
 */
import { AIEngine } from "./aiEngine.js";
import { PromptStorage } from "../prompt/promptStorage.js";
import { renderImageGallery } from "./imageGallery.js";
import { downloadImage } from "./imageDownloader.js";
import { validateProviderSettings } from "../providers/providerValidator.js";
import { SAMPLE_PROJECTS } from "../mock/sampleProjects.js";
import { SAMPLE_PROMPTS } from "../mock/samplePrompts.js";

/** Creates a Prompt Engine compatible record from an offline sample. */
function sampleRecord(sample, index = 0) {
  return {
    id: `${sample.id}-${Date.now().toString(36)}-${index}`,
    projectId: `demo-project-${index}`,
    title: sample.title,
    prompt: sample.prompt,
    negativePrompt: sample.negativePrompt,
    studio: "Character Studio",
    seed: index + 1,
    project: {
      mood: sample.theme,
      visualStyle: sample.artStyle,
      camera: { angle: "Close portrait" },
      lighting: "Volumetric glow"
    }
  };
}

/** Initializes the universal AI provider workspace. */
export async function initializeAIStudio({ creationEngine, navigate, showToast, openModal }) {
  const engine = await new AIEngine().initialize();
  const promptStorage = new PromptStorage();
  const generateButton = document.querySelector("#generate-demo-image");
  const cancelButton = document.querySelector("#cancel-demo-image");
  const progress = document.querySelector("#ai-generation-progress");
  const progressBar = document.querySelector("#ai-progress-bar");
  const status = document.querySelector("#ai-generation-status");
  const estimate = document.querySelector("#ai-generation-estimate");
  const result = document.querySelector("#ai-generation-result");
  const galleryRoot = document.querySelector("#image-gallery-list");
  let currentImage = engine.images.list()[0] || null;
  let galleryView = { query: "", sort: "newest", collection: "all", favorites: false };

  /** Returns the most recent generated prompt. */
  function currentPrompt() {
    return promptStorage.list()[0] || null;
  }

  /** Updates the prompt-ready generation panel. */
  function renderGenerator() {
    const prompt = currentPrompt();
    const provider = engine.providers.active();
    document.querySelector("#ai-provider-badge").textContent = provider.name;
    document.querySelector("#ai-prompt-preview").textContent = prompt?.prompt || "Generate and save a prompt in Prompt Studio first.";
    document.querySelector("#ai-provider-status").textContent = provider.demo ? "Offline demo ready" : "Provider not configured";
    generateButton.disabled = !prompt || !provider.configured;
    estimate.textContent = engine.providers.settings.get().latencyMode === "instant" ? "Under 1 second" : engine.providers.settings.get().latencyMode === "slow" ? "About 7 seconds" : "2–5 seconds";
    renderResult(currentImage);
  }

  /** Renders the latest demo artwork without external images. */
  function renderResult(record) {
    result.classList.toggle("is-hidden", !record);
    if (!record) return;
    const artwork = result.querySelector("[data-ai-artwork]");
    artwork.style.background = record.artwork.artwork;
    artwork.setAttribute("aria-label", record.artwork.alt);
    result.querySelector("[data-ai-result-title]").textContent = record.title;
    result.querySelector("[data-ai-result-meta]").textContent = `${record.provider === "mock" ? "Mock Provider" : record.provider} · ${(record.generationTime / 1000).toFixed(1)} seconds · Demo`;
  }

  /** Displays progress with accessible status updates. */
  function updateProgress(detail) {
    progress.classList.remove("is-hidden");
    status.textContent = detail.stage;
    progressBar.style.width = `${detail.progress}%`;
    progress.setAttribute("aria-valuenow", String(detail.progress));
    estimate.textContent = detail.estimatedMs ? `About ${Math.max(1, Math.ceil(detail.estimatedMs / 1000))} seconds remaining` : "Complete";
  }

  /** Generates and saves one mock image through the provider pipeline. */
  async function generate() {
    const prompt = currentPrompt();
    if (!prompt) {
      openModal("error", { title: "Prompt required", copy: "Generate a prompt in Prompt Studio before creating demo artwork." });
      return;
    }
    generateButton.disabled = true;
    cancelButton.classList.remove("is-hidden");
    result.classList.add("is-hidden");
    try {
      currentImage = await engine.generate(prompt, {
        collection: document.querySelector("#ai-collection").value.trim() || "All Generations",
        onProgress: updateProgress
      });
      renderResult(currentImage);
      result.classList.add("is-complete");
      globalThis.navigator?.vibrate?.([15, 35, 15]);
      showToast("Demo image generated and saved");
      document.dispatchEvent(new CustomEvent("vyrelix:images-changed"));
    } catch (error) {
      openModal("error", { title: error.code === "CANCELLED" ? "Generation cancelled" : "Generation unavailable", copy: error.message });
    } finally {
      generateButton.disabled = false;
      cancelButton.classList.add("is-hidden");
      globalThis.setTimeout(() => result.classList.remove("is-complete"), 800);
    }
  }

  /** Renders provider selection and configuration state. */
  function renderProviders() {
    const providers = engine.providers.list();
    const settings = engine.providers.settings.get();
    const select = document.querySelector("#default-provider");
    select.replaceChildren(...providers.map((provider) => new Option(provider.name, provider.id)));
    select.value = settings.defaultProvider;
    document.querySelector("#provider-list").replaceChildren(...providers.map((provider) => {
      const article = document.createElement("article");
      article.className = "provider-card";
      const copy = document.createElement("div");
      const name = document.createElement("strong");
      const state = document.createElement("small");
      name.textContent = provider.name;
      state.textContent = provider.demo ? "Configured · Offline demo" : provider.credentialLabel || "Provider not configured.";
      copy.append(name, state);
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.role = "switch";
      toggle.checked = provider.enabled;
      toggle.disabled = provider.id === "mock";
      toggle.dataset.providerEnable = provider.id;
      toggle.setAttribute("aria-label", `Enable ${provider.name}`);
      article.append(copy, toggle);
      if (!provider.demo) {
        const actions = document.createElement("div");
        actions.className = "provider-card__actions";
        ["Connect Provider", "Test Connection"].forEach((label) => {
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.providerAction = label.startsWith("Connect") ? "connect" : "test";
          button.dataset.providerId = provider.id;
          button.textContent = label;
          actions.append(button);
        });
        article.append(actions);
      }
      return article;
    }));
    document.querySelector("#developer-latency").value = settings.latencyMode;
    document.querySelector("#developer-failures").checked = settings.randomFailures;
    renderGenerator();
  }

  /** Lazily renders filtered and sorted gallery records. */
  function renderGallery() {
    const records = engine.history.query(galleryView);
    document.querySelector("#image-gallery-count").textContent = `${records.length} image${records.length === 1 ? "" : "s"}`;
    const collectionSelect = document.querySelector("#gallery-collection");
    const current = collectionSelect.value || galleryView.collection;
    collectionSelect.replaceChildren(new Option("All collections", "all"), ...engine.images.collections().map((name) => new Option(name, name)));
    collectionSelect.value = [...collectionSelect.options].some((option) => option.value === current) ? current : "all";
    renderImageGallery(records, galleryRoot);
  }

  /** Handles reusable gallery card actions. */
  function handleGalleryAction(button) {
    const id = button.closest("[data-image-id]")?.dataset.imageId;
    const record = engine.images.get(id);
    if (!record) return;
    const action = button.dataset.imageAction;
    if (action === "favorite") engine.images.toggleFavorite(id);
    if (action === "download") downloadImage(record);
    if (action === "collection") {
      const name = globalThis.prompt("Collection name", record.collection || "Favorites");
      if (name?.trim()) engine.images.update(id, { collection: name.trim() });
    }
    if (action === "delete" && globalThis.confirm("Delete this demo image?")) engine.images.remove(id);
    renderGallery();
    showToast(action === "download" ? "Demo image download prepared" : "Gallery updated");
  }

  /** Handles developer provider controls. */
  async function developerAction(action) {
    if (action === "clear-ai-history") {
      engine.clearHistory();
      currentImage = null;
      renderGenerator();
      renderGallery();
      showToast("Generation history cleared", "deleted");
    }
    if (action === "reset-ai-demo") {
      engine.clearHistory();
      engine.providers.storage.reset();
      currentImage = null;
      renderProviders();
      renderGallery();
      showToast("Mock Provider demo data reset", "deleted");
    }
    if (action === "load-ai-projects" || action === "generate-test-projects") {
      SAMPLE_PROJECTS.forEach((project, index) => {
        try {
          creationEngine.projects.create({ ...project, name: `${project.name} ${Date.now().toString(36).slice(-3)}${index}` });
        } catch { /* Existing demo names remain untouched. */ }
      });
      document.dispatchEvent(new CustomEvent("vyrelix:projects-changed"));
      showToast("Demo projects loaded");
    }
    if (action === "generate-test-images") {
      const previous = engine.providers.settings.get().latencyMode;
      engine.providers.settings.setLatencyMode("instant");
      for (let index = 0; index < SAMPLE_PROMPTS.length; index += 1) {
        currentImage = await engine.generate(sampleRecord(SAMPLE_PROMPTS[index], index), { collection: "Developer Samples", onProgress: updateProgress });
      }
      engine.providers.settings.setLatencyMode(previous);
      renderGenerator();
      renderGallery();
      showToast("Test demo images generated");
    }
  }

  generateButton.addEventListener("click", generate);
  cancelButton.addEventListener("click", () => engine.cancel());
  document.querySelector("[data-download-current]").addEventListener("click", () => currentImage && downloadImage(currentImage));
  document.querySelector("[data-favorite-current]").addEventListener("click", () => {
    if (!currentImage) return;
    currentImage = engine.images.toggleFavorite(currentImage.id);
    renderResult(currentImage);
    showToast(currentImage.favorite ? "Added to favorites" : "Removed from favorites");
  });
  document.querySelector("[data-open-gallery]").addEventListener("click", () => navigate("image-gallery"));
  document.querySelector("#default-provider").addEventListener("change", (event) => {
    const requested = engine.providers.registry.get(event.target.value);
    engine.providers.select(event.target.value);
    const result = validateProviderSettings(requested);
    if (!result.valid) showToast(`${result.message} Mock Provider selected automatically.`, "error");
    renderProviders();
  });
  document.querySelector("#provider-list").addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-provider-enable]");
    if (toggle) engine.providers.settings.setEnabled(toggle.dataset.providerEnable, toggle.checked);
    renderProviders();
  });
  document.querySelector("#provider-list").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-provider-action]");
    if (!button) return;
    const provider = engine.providers.registry.get(button.dataset.providerId);
    const health = await provider.healthCheck();
    openModal("info", {
      title: button.dataset.providerAction === "connect" ? `${provider.name} connection` : `${provider.name} health check`,
      copy: health.configured ? "Provider ready." : `${provider.credentialLabel || "Provider not configured."} No connection was attempted.`
    });
  });
  document.querySelector("#developer-latency").addEventListener("change", (event) => {
    engine.providers.settings.setLatencyMode(event.target.value);
    renderGenerator();
  });
  document.querySelector("#developer-failures").addEventListener("change", (event) => engine.providers.settings.setRandomFailures(event.target.checked));
  document.querySelectorAll("[data-ai-dev-action]").forEach((button) => button.addEventListener("click", () => {
    developerAction(button.dataset.aiDevAction).catch((error) => {
      openModal("error", { title: "Developer action failed", copy: error.message || "The test action could not be completed." });
    });
  }));
  document.querySelector("#image-gallery-search").addEventListener("input", (event) => { galleryView.query = event.target.value; renderGallery(); });
  document.querySelector("#image-gallery-sort").addEventListener("change", (event) => { galleryView.sort = event.target.value; renderGallery(); });
  document.querySelector("#gallery-collection").addEventListener("change", (event) => { galleryView.collection = event.target.value; renderGallery(); });
  document.querySelector("#gallery-favorites").addEventListener("click", (event) => {
    galleryView.favorites = !galleryView.favorites;
    event.currentTarget.setAttribute("aria-pressed", String(galleryView.favorites));
    renderGallery();
  });
  galleryRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-image-action]");
    if (button) handleGalleryAction(button);
  });
  document.addEventListener("vyrelix:prompts-changed", renderGenerator);
  renderProviders();
  return { engine, renderGenerator, renderProviders, renderGallery };
}
