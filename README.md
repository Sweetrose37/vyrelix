# Vyrelix

Vyrelix is a responsive, device-private Universal Creative Platform. Every idea begins in one engine and can move freely between two creation methods:

- **Describe Mode** understands a natural-language idea and converts it into an editable creative specification.
- **Build Mode** exposes that same specification as modular panels users can add, remove, reorder, collapse, lock, favorite, and complete with contextual recommendations.

Both workflows converge into the same project, visual-direction, prompt-inspection, history, template, import, and export systems.

## Product capabilities

- 94 output concepts in the Everything Library, with open-ended output naming
- 66 reusable creative panel types
- 305 searchable artistic style directions with favorites and recents
- Intent detection for output type, style, colors, mood, materials, typography, composition, lighting, and rendering
- Reference images, drag and drop, pasted images, and supported-browser voice input
- Contextual creative suggestions that preview before application
- Undo, redo, snapshots, version comparison, and restoration
- Generated prompts that remain behind the scenes unless Prompt Inspector is opened
- Project saving, editing, duplication, archive, import, and export
- Responsive phone, tablet, desktop, portrait, and landscape layouts
- Installable offline-capable PWA

All creative data is stored in the current browser. The static client does not accept API credentials or transmit projects.

## Technology

Vyrelix uses semantic HTML, modular CSS, and native JavaScript modules with no runtime package dependencies. `index.html` contains the accessible application shell; `js/app.js` composes navigation and feature controllers; `js/core/` owns the Universal Creation Engine; and `js/creation/` contains creative intelligence, the Everything Library, Describe Mode, and Build Mode.

Internal project-type descriptors under `js/studios/` are retained for backward compatibility only. Users never select or switch studios.

## Production

Create the GitHub Pages artifact with:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build.ps1
```

Pushes to `main` deploy `dist/` through `.github/workflows/pages.yml`.

## Architecture boundary

Vyrelix’s current creative intelligence and prompt generation run deterministically on the device. The architecture keeps project and prompt records provider-independent so a secure server-side intelligence service can be integrated later without changing the creation experience or exposing credentials in the browser.
