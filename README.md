# Nyvera

Nyvera is a mobile-first, installable prompt-building application with exactly three dedicated creative studios:

1. **Nyvera Character Studio** creates normal adult human characters only. It excludes under-18 subjects, fantasy species, magical powers, warriors, and superhero systems.
2. **Nyvera Kids Studio** creates normal human babies, toddlers, children, tweens, and teens plus books, learning materials, school designs, and family/classroom scenes. Clothing and presentation remain realistic, safe, and age-appropriate.
3. **Nyvera Sticker Studio** is a style-first, product-first workflow for single stickers, exact-count sheets and packs, phrases, icons, objects, planners, mockups, and packaging.

The current repository was transformed in place from the former application so its Git history and GitHub Pages deployment remain intact. The untouched source is recoverable from the `vyrelix-original-backup` branch at commit `1e350a2`.

## Features

- Dedicated loading, welcome, dashboard, builder, and result experiences for all three studios
- Exact 10-step Character and Kids creation workflows with grouped review, edit-return behavior, conflict correction, and Step 10 generation/save controls
- Searchable, collapsible Adult and Kids libraries with 863 duplicate-audited scenes, poses, expressions, hairstyles, realistic outfits, and luxury options
- Nyvera Luxury Clothing Line for realistic adult fashion
- Nyvera Kids Luxury Clothing Line for realistic, modest, age-appropriate fashion
- Guided builders, editable templates, Style Me proposals, and compatible Surprise Me concepts
- Exact sticker-count validation and automatic inventory balancing
- Optional post-completion Sticker product mockups with inherited project data, exact-count protection, linked variants, and separate prompt/export controls
- Optional post-completion Kids product creation with a duplicate-audited 126-format catalog, three compact stages, age guidance, trading-card safety, exact-text controls, and linked variants
- Natural-language master prompts, negative prompts, selection summaries, and TXT/JSON downloads
- Device-local projects, per-studio drafts, favorites, bounded history, search, filters, sorting, edit, duplicate, and delete
- Per-studio reset, complete reset, settings persistence, reduced motion, text sizing, and high contrast
- Individual project import/export plus merge-or-replace complete-data portability
- Dependency-free PWA app shell with safe versioned cache replacement and offline navigation
- Nyvera Live Radio with real Radio Browser discovery, search, studio-matched recommendations, one persistent player, favorites, recent stations, and device-local preferences
- World Radio Explorer for dynamic country, region, cautious city metadata/keyword, language, genre, saved-search, and recent-location discovery

Nyvera creates polished prompts and product specifications. It does not directly create finished images and does not require accounts, API credentials, cloud storage, or a backend.

## Technology and structure

Nyvera uses semantic HTML, modular native JavaScript, CSS, Local Storage, a Web App Manifest, and a service worker.

```text
index.html                 Accessible application shell and metadata
css/nyvera.css             Brand, studio themes, components, responsive/accessibility rules
css/radio.css              Persistent mini player, station browser, and studio radio themes
js/app.js                  Routing, views, interactions, project and settings UI
js/nyvera-content.js       Grouped Adult/Kids content libraries, semantic deduplication, and age compatibility
js/nyvera-data.js          Three studios, builders, options, defaults, and templates
js/nyvera-prompts.js       Validation, compatibility, suggestions, and prompt generation
js/nyvera-mockups.js       Optional Sticker mockup fields, inheritance, compatibility, assistance, and prompts
js/nyvera-kids-products.js Optional Kids product catalog, inheritance, age rules, assistance, and prompts
js/nyvera-storage.js       Namespaced storage, drafts, projects, history, and portability
js/nyvera-workflows.js     Character and Kids 10-step definitions, legacy-field mapping, and migration
js/radio.js                Persistent audio player, station browser, and radio settings UI
js/radio-explorer.js       World Radio location UI, breadcrumbs, combined filters, and saved/recent searches
js/radio-service.js        Radio Browser discovery, fallback servers, filtering, and playlist resolution
js/radio-storage.js        Radio favorites, recent stations, current selection, and preferences
assets/icons/              Original Nyvera emblem and reusable studio icon sprite
assets/illustrations/      Original character, kids, and sticker hero/loading artwork
assets/artwork/            Optimized AI-generated final studio artwork
scripts/build.ps1          Static GitHub Pages production build
tests/                     Scripted tests and manual acceptance checklist
```

## Run locally

The application uses JavaScript modules and a service worker, so serve it over HTTP:

```powershell
python -m http.server 8080
```

Open `http://localhost:8080`. Live radio requires internet access; Nyvera never autoplays and only connects to a stream after the user presses Play.

## Live radio behavior

Nyvera discovers healthy community Radio Browser servers at runtime and rotates through independent HTTPS fallbacks if discovery or a server fails. Search can filter station name, genre/tag, country, state, language, verification status, bitrate, codec, and family-oriented metadata. Stream availability remains controlled by each third-party station, so an individual station may occasionally be unavailable even while the directory works.

The app has exactly one audio element outside routed page content. It keeps playing when moving between Nyvera screens and studios, while the player colors and recommendations follow the active studio. The last selected station is restored paused—never autoplayed. Favorites, history, volume, mute, filters, player collapse state, and radio settings stay on the current device.

Only the local app shell is cached for offline use. Radio API responses have a short device cache for directory fallback; live streams are never stored by the service worker. Offline mode keeps builders, projects, and saved station metadata usable but disables live playback.

### Directory, formats, and playback

Radio Browser supplies station metadata; Nyvera does not proxy or own the broadcasts. Startup discovery calls Radio Browser's official server list, then rotates among the discovered hosts and the independent `de1`, `nl1`, and `at1` HTTPS fallbacks. Results are normalized and screened for a usable URL, health status, selected bitrate, codec, and mixed-content safety. Popular results and Character, Kids, and Sticker recommendation tags are normal directory searches—not fictional or hardcoded stations.

Direct MP3, AAC/AAC+, OGG, and Opus streams are accepted, subject to the browser's codec support. Nyvera reads M3U and PLS playlists and follows the first valid stream URL. M3U8/HLS works only when the browser reports native HLS support; no large HLS library is shipped. AAC and OGG support differs by browser. An HTTPS Nyvera page blocks HTTP streams by design because modern browsers treat them as mixed content.

Browsers require a click or tap before audio starts. Selecting or restoring a station does not autoplay it. If playback fails, the mini player explains the condition and offers Retry and a related replacement when available. Missing and broken remote logos fall back to the local radio icon.

Direct HTTPS MP3/AAC playback assigns the stream and calls the single persistent audio element from the same Play tap, which preserves Android’s user-gesture permission. M3U and PLS files are resolved first; after resolution the player explicitly asks for a second Play tap instead of attempting blocked delayed playback. A 15-second connection timeout prevents the player from remaining on Connecting indefinitely.

### Content and privacy notice

Nyvera does not own, operate, endorse, or guarantee any listed station. Station URLs, programming, availability, metadata, and regional access can change without notice. Live radio needs an internet connection, and playback depends on the browser supporting the broadcaster's current format. Directory metadata can be incomplete or inaccurate.

The optional family-friendly filter relies on station-supplied tags; Nyvera cannot guarantee that any station or live program is family-friendly. An adult should review and supervise stations before children listen in Kids Studio. Nyvera sends directory/search requests and the selected stream request to third-party providers; saved favorites and preferences remain in browser Local Storage.

### Testing and troubleshooting

Run `npm test` and `npm run build`, serve `dist/` over HTTP, and complete the Live Radio section in `tests/manual-test-checklist.md` at mobile, tablet, and desktop widths. In particular, start one station and navigate through every studio, builder step, projects, favorites, history, settings, and a result screen while confirming the same audio element continues playing.

For a failed station: confirm the device is online, choose Retry, try the suggested replacement, lower the bitrate/codec filters, and prefer a verified HTTPS result. A station that repeatedly fails may be offline or may have changed its stream. A message about autoplay requires another explicit Play tap; insecure HTTP and unsupported codecs require choosing another station.

To update the integration, edit discovery/fallback, normalization, filtering, and playlist rules in `js/radio-service.js`, then bump the cache name in `service-worker.js`. Change recommendation tags in the exported `recommendations` map in that service. Change per-studio radio accents under `.radio-theme--character`, `--kids`, and `--sticker` in `css/radio.css`.

### World Radio Explorer

Open Live Radio and choose **World Radio** to browse dynamic Radio Browser metadata by country, state/province/territory/region, language, genre, and supported city/locality fields. No GPS permission or precise device location is requested: every location is selected manually. Countries include their supplied two-letter code, station count, searchable list, sort controls, and a text country name in addition to the decorative flag.

Selecting a country loads real verified stations and derives available regions, languages, tags, and reliable cities from those station records. Country and state remain combined in API searches to avoid same-named regions in other countries. Common US postal abbreviations receive full display labels while original metadata is retained during normalization. Breadcrumbs clear incompatible lower levels when moving upward.

Radio Browser does not consistently provide city fields. Nyvera shows a city selector only when `city` or `locality` metadata is actually present. Otherwise it explains the limitation and offers a manually entered keyword match against available city metadata, station name, state, tags, and homepage URL. Keyword matches are discovery matches—not guarantees of a transmitter or broadcaster’s physical location.

Location filters combine in this order: country, region, city keyword, language, genre, then verification and stream quality. Active filters are removable chips. Results include verified status, votes, codec, bitrate, station details, playback, and station favorites. Popular, most-voted, highest-bitrate, and recently verified location sections use the current manually selected filters; “nearby” never implies GPS proximity.

Saved location searches are separate from favorite stations and support custom names, reopening, renaming, deletion, and confirmed clearing. Recent locations are deduplicated and capped at 25. The last filters restore without starting playback. Explorer storage keys are:

```text
nyvera_radio_selected_country / selected_country_code
nyvera_radio_selected_state / selected_city
nyvera_radio_selected_language / selected_genre
nyvera_radio_saved_locations / recent_locations / location_filters
```

Station country, region, city, language, and tag metadata comes from third parties and may be missing, inconsistent, or inaccurate. Nyvera does not guarantee a stream’s physical broadcast location. Station URLs and availability can change. Test combinations and responsive behavior using the World Radio section of `tests/manual-test-checklist.md`.

## Character and Kids workflows

Character and Kids builders use exactly ten grouped screens. The first eight collect creative direction, Step 9 provides editable summaries, validation, one-tap compatibility corrections, negative guidance, and a pre-generation preview, and Step 10 generates and saves the complete prompt. Current Selections is a grouped desktop side panel and a collapsible mobile card.

Existing flat form values remain the storage format, so saved projects, drafts, templates, specialized builder values, imports, and exports stay compatible. Legacy fields not present in the base workflow are retained under the closest creative-direction group; unknown saved values are never deleted. Style Me and Surprise Me open Step 9 after acceptance so their populated values can be reviewed before generation.

Workflow definitions live in `js/nyvera-workflows.js`; the expanded grouped option libraries and reusable semantic duplicate/age checks live in `js/nyvera-content.js`. Prompt generation remains in `js/nyvera-prompts.js`, which includes every additional grouped selection and filters empty values so prompts never contain `undefined`, `null`, `NaN`, or object stringification. Sticker Studio continues using its existing workflow.

## Optional Sticker product mockups

Every completed Sticker result offers an optional Product Mockup card without blocking the original save, copy, download, edit, duplicate, or navigation actions. The compact mockup builder inherits the sticker title, format, exact inventory, theme, style, palette, finish, border, background, product status, source prompt, negative prompt, and custom details.

Mockup prompts and their deduplicated negative prompts remain separate from the original sticker prompt. Saved mockups are linked variants embedded inside the original Sticker project, so multiple presentations can be saved, favorited, duplicated, edited, exported alone, or exported with the parent project without creating duplicate sticker projects. Older Sticker projects receive no new fields until saved and can start a mockup from their existing result normally.

## Optional Kids product creation

Every completed Kids result offers an optional product path after the generated prompt and selection summary. Its searchable catalog contains 126 unique formats across collectibles, books, learning, printables, celebrations, decor, digital products, and mockups. The compact three-stage builder inherits the completed child identity and visual direction, warns about age fit without unnecessarily hiding products, and supports digital, printable, physical-design, and mockup-only classifications.

Trading cards support coordinated front/back layouts and positive traits while excluding combat mechanics. Exact visible text stays separate from visual direction, and blank branding fields produce explicitly unbranded prompts with no Nyvera logo or standalone N mark. Saved products remain linked variants inside the original Kids project and can be favorited, edited, regenerated, duplicated independently, exported alone, or exported with the parent. Older Kids projects remain unchanged until saved.

## Test and build

```powershell
npm test
npm run build
```

The production artifact is written to `dist/`. To verify it, run a static server from that directory and check the browser console and mobile widths in `tests/manual-test-checklist.md`.

## Deployment

Pushes to `main` use `.github/workflows/pages.yml` to run the existing build script and deploy `dist/` to GitHub Pages. The active project root and hosting project were not duplicated. Standard static hosts can publish `dist/` without additional configuration.

## Storage and data model

Nyvera uses these independent keys:

```text
nyvera_character_projects / draft / history / favorites
nyvera_kids_projects / draft / history / favorites
nyvera_sticker_projects / draft / history / favorites
nyvera_settings
nyvera_app_version
nyvera_radio_favorites / recent / current_station
nyvera_radio_volume / muted / collapsed / filters / last_search / settings / cache
```

Projects store `id`, `studio`, `builderType`, `title`, ISO creation/update dates, favorite/status values, form data, generated/negative prompts, selection summary, template ID, and app version. Corrupt values fall back safely and are logged. Storage-quota failures keep the app usable and direct users to export data.

## Customize Nyvera

- Add or revise field options, templates, defaults, and dashboard builders in `js/nyvera-data.js`.
- Add generation and compatibility rules in `js/nyvera-prompts.js`; keep adult/child safety boundaries intact.
- Update global colors in the `:root` block of `css/nyvera.css`. Studio-specific surfaces use the `studio-shell--character`, `--kids`, and `--sticker` selectors.
- Replace the logo by preserving the path `assets/icons/nyvera-mark.svg`, or update both `index.html` and `manifest.webmanifest` to a new local asset.

After changing any app-shell file, update `CACHE_NAME` in `service-worker.js` so installed copies receive a clean cache. The activation handler removes obsolete cache versions.

## Known non-critical limitations

- Local Storage is browser- and device-specific; use Export All Data before clearing a browser or moving devices.
- Image models can still misspell text; phrase prompts preserve exact wording and explicitly request spelling verification.
- Live station reliability, codec support, and regional availability vary by provider and browser. HTTPS pages intentionally reject insecure HTTP streams.
- SVG icons satisfy current installable PWA metadata; stores that require raster icon sizes may need exported PNG variants.
- A future backend may add encrypted synchronization or image-generation providers without changing the local project model.
