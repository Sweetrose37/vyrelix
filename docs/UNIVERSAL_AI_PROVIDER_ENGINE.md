# Vyrelix Universal AI Provider Engine

## Purpose

Version 5 adds a provider-independent image-generation layer that can be fully exercised without internet access or API keys. Mock Provider is configured by default and returns clearly labeled demo artwork. OpenAI, Google, Replicate, Stability AI, and Hugging Face are registered as inactive adapters.

No network request is made in this phase. Selecting an unavailable adapter automatically resolves to Mock Provider.

## Provider Manager

`js/ai/providerManager.js` composes the provider registry, settings, and fallback rules. The default registry contains:

- Mock Provider: fully configured, offline, and functional.
- OpenAI: complete inactive adapter contract with API Key Required, Connect Provider, and Test Connection states.
- Google, Replicate, Stability AI, and Hugging Face: inactive future adapters that display Provider not configured.

Provider and developer preferences are stored under versioned device-local keys. Users can choose a preferred provider, enable future adapters, configure the default, and control mock latency or simulated failures. A preferred provider is used only when both enabled and configured.

## Provider Registry

Every adapter must implement:

`initialize()`, `validate()`, `generate()`, `cancel()`, `history()`, and `healthCheck()`.

`ProviderRegistry.register()` rejects adapters that do not implement this contract. Adding a future provider therefore requires one new adapter and registration; AI Engine, queue, pipelines, gallery, storage, and UI do not change.

## Mock Provider

`js/providers/mockProvider.js` behaves like an asynchronous image provider:

1. Accept and validate a Prompt Engine record.
2. Simulate Preparing Prompt, Building Request, Generating, Rendering, Finishing, and Completed stages.
3. Use randomized total latency from two to five seconds by default.
4. Select an appropriate cached demo-art category from the prompt and metadata.
5. Return provider-neutral artwork and timing data.
6. Pass the response through the shared response pipeline.
7. Save the completed image record and expose it through generation history.

Instant and slow modes are available in Developer Settings. Random Failures introduces controlled recoverable errors. Cancellation uses `AbortController`.

## Demo artwork

`js/mock/placeholderImages.js` contains ten reusable CSS artwork descriptors: Fantasy, Anime, Realistic, Sci-Fi, Modern, Creature, Landscape, Portrait, Concept Art, and Abstract.

Every card and result visibly displays:

- Demo Image
- Generated using Mock Provider

This prevents demo output from being mistaken for AI-generated artwork. The library is cached with the module and requires no image download. `imageDownloader.js` rasterizes the descriptor into a clearly labeled PNG entirely on the device.

## Request and response pipelines

`requestPipeline.js` converts a Prompt Engine record into the provider-neutral request contract. It preserves prompt, negative prompt, studio, theme, art style, camera, lighting, project and prompt references, collection, seed, and timestamp.

`responsePipeline.js` rejects malformed responses and delegates to `imageMetadata.js`. Every saved image contains:

- Prompt and negative prompt
- Studio, theme, art style, camera, and lighting
- Timestamp and generation time
- Provider and explicit demo status
- Project and prompt references
- Favorite and collection state
- Cached placeholder artwork metadata

## Queue and errors

`generationQueue.js` provides sequential execution, queue state, cancellation, and predictable task cleanup. A future provider can add its own concurrency limits behind the same interface.

`errorManager.js` normalizes missing providers, missing API keys, cancellation, offline status, timeouts, and unknown failures into stable messages suitable for the existing accessible modal system.

## Gallery and storage

`imageStorage.js` persists compact metadata rather than large image binaries. `generationHistory.js` handles search, newest/oldest/title sorting, collection filtering, and favorites. `imageGallery.js` reuses one accessible card renderer and appends results in idle batches for smooth mobile scrolling.

Gallery users can favorite, search, sort, delete, download, and move demo images into collections.

## Future provider integration

To activate OpenAI or another provider later:

1. Create a class extending `BaseProvider`.
2. Implement the six provider methods.
3. Keep credentials outside source and deployment artifacts.
4. Register the adapter with `ProviderRegistry`.
5. Mark it configured only after secure credential validation.
6. Return the existing provider-response contract.

No changes are required to Prompt Engine, AI Engine, request/response pipelines, queue, metadata, history, gallery, downloader, or project architecture.

## Accessibility, security, and performance

Provider controls, progress, cancellation, filters, gallery actions, and developer settings use semantic controls, live regions, high-contrast support, and 48-pixel touch targets. Reduced motion disables completion animation.

The provider feature loads only on AI, gallery, provider-settings, or test routes. Demo graphics are cached CSS descriptors; gallery records contain no image blobs; gallery rendering is incremental; and active generation is single-flight.

This phase accepts no credentials, sends no network requests, and never stores an API key.
