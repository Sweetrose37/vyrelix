# Nyvera manual acceptance checklist

Test at 320, 360, 375, 390, 412, 430, 768, and 1024 CSS pixels. Confirm no horizontal scrolling, clipped controls, hidden buttons, bottom-nav overlap, off-screen dialogs, tiny text, or overflowing prompts. Test keyboard navigation, visible focus, screen-reader status announcements, reduced motion, large text, high contrast, and safe-area padding.

## Main app

- [ ] Loading screen transitions quickly to Welcome; Enter Nyvera opens exactly three studio cards.
- [ ] Character is first and labeled The Heart of Nyvera; every studio route is unique.
- [ ] Home, Create, Projects, Favorites, and Settings work; browser and in-app back behavior is safe.
- [ ] Switch Studio returns to the selector and no builder traps the user.
- [ ] Main hero, studio selector artwork, and Nyvera emblem remain balanced without large empty areas.

## Studio visual upgrade

- [ ] Character loading, welcome, dashboard, cards, and result use the local adult editorial artwork, plum glass, gold grid/rings, and readable ivory text.
- [ ] Kids loading, welcome, dashboard, cards, and result use the local learning scene, clouds/rainbow/school motifs, and dark high-contrast supporting text.
- [ ] Sticker loading, welcome, dashboard, cards, and result use the local sticker sheet/product artwork, grid, peel-corner shapes, and holographic accents.
- [ ] Each studio hero uses a balanced copy/art split on tablet and desktop and stacks compactly on phones.
- [ ] No hero artwork overlaps headings, subtitles, action buttons, or navigation at any required width.
- [ ] Builder cards use the local SVG line-icon system rather than emoji as their permanent icon system.
- [ ] Reduced Motion disables cloud, book, portrait, sticker, particle, and transition animations.

## Character Studio

- [ ] Unique loading/welcome/dashboard surfaces render and every builder card opens.
- [ ] Full builder contains adult ages only; generation adds no children, fantasy species, magic, armor, superheroes, or weapons.
- [ ] Realistic clothing and Nyvera Luxury Clothing Line generate correctly.
- [ ] Style Me previews before applying; Surprise Me stays compatible; templates remain editable.
- [ ] Bald/long-hair and transparent/detailed-environment conflicts are caught where applicable.
- [ ] Prompt, negative prompt, save, autosave, edit, duplicate, favorite, TXT, and JSON actions work.

## Kids Studio

- [ ] Unique pastel loading/welcome/dashboard surfaces render and every builder opens.
- [ ] Babies through teens remain human and age-appropriate; supporting adults are used only in appropriate scenes.
- [ ] No fantasy species, superhero/princess costumes, adult glamour, revealing clothing, weapons, or unsafe objects appear.
- [ ] Nyvera Kids Luxury Clothing Line, age compatibility, Style Me, Surprise Me, and templates work.
- [ ] Family, classroom, children’s book, story, coloring, activity, educational, school supply, wallpaper, affirmation, bookmark, and mockup workflows generate.

## Sticker Studio

- [ ] Unique holographic loading/welcome/dashboard surfaces render; every builder and Style Explorer opens.
- [ ] Single, sheet, pack, phrase, icon, object, decorative, planner, faith, seasonal, business, school, lifestyle, self-care, mockup, and packaging workflows generate.
- [ ] Exact inventory count blocks invalid generation and Auto-Balance reaches the selected total.
- [ ] Exact phrases, punctuation, and object lists are preserved; digital items make no shipping claim.
- [ ] Style Me, Surprise Me, templates, save, edit, duplicate, delete, favorite, TXT, and JSON work.

## Shared systems and PWA

- [ ] Draft autosave and Continue Last Project work independently for all studios.
- [ ] Projects search, studio/builder filters, newest/oldest/alphabetical sorts, favorites, history, duplicate, and delete work.
- [ ] Project import validates and previews; all-data import supports merge and replace confirmation.
- [ ] Per-studio reset leaves other studios intact; complete reset requires strong confirmation.
- [ ] Corrupted local storage and quota errors show friendly messages without raw stacks.
- [ ] Manifest metadata, installability, offline app shell, safe cache updates, and GitHub Pages paths work.
- [ ] No visible former-product branding, essential placeholders, broken assets, or console-breaking errors remain.
# Live Radio

- Confirm the header radio button opens Discover and shows real station names, logos or the local fallback icon, country/language, codec, and bitrate.
- Search by name, tag, country, state, and language; exercise HTTPS, verified, bitrate, codec, family metadata, and sort filters.
- Play an HTTPS MP3/AAC station, then navigate through Home, builders, results, projects, and all three studios. Confirm there is one player and playback is uninterrupted.
- Pause, resume, stop, mute, adjust volume, collapse, expand, favorite, unfavorite, and verify Favorites and Recent persist after reload.
- Reload with a remembered station and confirm it is selected but paused with no network stream started automatically.
- Confirm Character, Kids, and Sticker studio recommendation chips and player accents change without replacing the audio element.
- Test station failure, blocked/unsupported stream, missing logo, directory timeout, offline mode, reconnection, Retry, and selecting a replacement station.
- In Settings, test enable/disable, default volume, remember station, logos, HTTPS only, minimum bitrate, family metadata, clear actions, and radio reset.
- At 320 px width and landscape mobile, confirm the player does not cover primary navigation and the browser dialog scrolls without horizontal page overflow.

# World Radio Explorer

- Load, search, and sort dynamic countries; verify country name, code, count, flag/fallback, and Open Country.
- Select a country and confirm stations, regions, local languages, and local tags are real API metadata. Test a country with no region information.
- Test US full-name and abbreviation regions, then confirm country + region queries do not leak same-named regions from other countries.
- Test reliable city metadata when present and the explanatory unavailable state when absent. Run a city keyword match and confirm it remains combined with country/state.
- Traverse every breadcrumb level; changing country clears state/city and changing state clears city.
- Combine country, state, city keyword, multiple languages, genre, name, verified, HTTPS, bitrate, codec, family metadata, and every sort option.
- Remove individual filter chips, Clear All, Reset to Country, and Reset to World. Exercise every empty-state recovery action.
- Save, rename, reopen, delete, and clear location searches. Reopen, remove, and clear recent locations; verify the list never exceeds 25.
- Confirm Character, Kids, Sticker, and Main Lounge recommendation buttons query real stations. Verify the adult-review warning in Kids Studio.
- Reload and reopen the app; verify the last location restores without autoplay. Confirm station favorites and recent plays remain separate.
- Start a station, navigate between studios and all builder steps, and confirm the same audio element continues without restarting.
- Test widths 320, 360, 375, 390, 412, 430, and 768 px plus desktop. Check selectors, wrapping breadcrumbs, chips, station cards, mini-player clearance, bottom navigation clearance, mobile keyboard access, and horizontal overflow.

# Ten-step Character and Kids workflows

- Complete Character Steps 1–10 and confirm the exact headings, 10% progress increments, grouped Current Selections, Previous, Continue, Clear Step, Save and Exit, and autosave status.
- Complete Kids Steps 1–10 with the same navigation checks; confirm Baby/Toddler proportions, Teen-only makeup visibility, age-appropriate clothing, and supporting-person details.
- From Step 9, edit every earlier summary card and confirm Continue returns to Step 9 without losing values.
- Exercise transparent-background, bald/shaved hair, Baby/Toddler build, pajamas, bridal, athletic, and school-uniform corrections.
- Accept Style Me and Surprise Me and confirm each opens Step 9 with matching fields populated. Open templates and specialized builders and confirm legacy/specialized fields are retained.
- Generate both prompts at Step 10; test copy, save, favorite, TXT, JSON, edit, duplicate, create another, dashboard, and studio switching.
- Restore an old draft and saved project; confirm titles, prompts, dates, status, favorites, templates, custom fields, and unknown legacy values survive.
- While radio plays, traverse all ten steps in both studios and confirm the single global audio element remains mounted and playback does not restart.
- Test widths 320, 360, 375, 390, 412, and 430 px, plus tablet and desktop. Confirm forms are not squeezed, the selections card is collapsible, controls remain visible, and no horizontal page overflow occurs.
