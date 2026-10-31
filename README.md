# Leonarda Portfolio

React + Vite portfolio template, based on the layout and long-form case-study structure at https://jessicahsu.design. Playground is omitted.

## Run

```sh
npm install
npm run dev
```

`npm run build` creates the production site in `dist/`.

## Visitor stickers

The bottom-right tray provides yellow sticky notes with a peel effect while dragging. Notes are flat at rest and render above the tray and page. Click or drag to create one, write directly on it, and click away to save automatically. Select a note to move or recolor it; double-click to edit. Delete/Backspace removes the selected note when not typing. Arrow keys move selected notes (Shift for larger steps). Escape or Command/Ctrl+Enter finishes editing; empty notes disappear. There are no Post/Cancel buttons, note labels, counters, or empty-state messages.

“Show others” only reveals or hides other visitors’ notes in their original page positions. Your current-visit notes remain visible. Notes anchor to page sections where possible, with positions adapting to the available width. Editing access lasts for the browser tab session, without accounts or long-term ownership.

Stickers are stored as ordinary JSON in `.data/stickers.json`, separate from the authored case studies and ignored by Git. `GET/POST /api/stickers` lists and creates notes; `PATCH/DELETE /api/stickers/:id` updates and removes the visitor’s own notes. Visitors refresh the board every 15 seconds. Each note has a random editing key in tab session storage; only its hash is kept on the server, and neither is included in public reads. Writes are serialized and atomically replace the file. Note IDs make creation retries safe. Basic validation and a limit of 30 new notes per connection IP per hour are included. The IP is held only in memory for rate limiting and is not written with comments.

`npm run dev` and `npm run preview` include the endpoint automatically. To serve the production build with shared stickers:

```sh
npm run build
npm start
```

The production server defaults to `127.0.0.1:3000`. Set `HOST=0.0.0.0` and `PORT` as required by your hosting, and set `STICKER_DATA_FILE` to a persistent writable path (for example, a mounted data volume). Run one server process against this file, keep backups, and preserve the original Host header through a reverse proxy. The rate limit uses the direct connection IP; a reverse proxy would share a bucket unless trusted client-IP handling is added for that deployment.

Uploading only `dist/` to a static host does **not** provide shared posting; it also needs this endpoint and persistent storage. No hosting or deployment has been configured. Failed saves keep the note in the current page and show a retry action. Published content is public; the site owner can maintain the JSON file while the server is stopped.

Run `npm run test:stickers` for persistence, simultaneous posting, retries, validation, cross-visitor reads, and editing/deletion authorization checks.

## Fill in your portfolio

Use [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) as your writing outline. It includes the complete block order, fill-in prompts, and paragraph word-count targets.

- `src/portfolioData.js`: name, introduction, About text, location/timezone, email, resume, and social links.
- `src/content/project-one.json` through `project-four.json`: independent project titles, card descriptions, tags, covers, metadata, and complete case-study content.
- `src/App.jsx`: reusable rendering components and navigation.
- `src/index.css`: global site styles.
- `src/case-study.css`: case-study layout, type hierarchy, reading width, and responsive navigation.
- `src/components/EchoBlocks.css`: Echo research, study-flow, and chart styles.
- `docs/visual-review.md`: visual audit, design decisions, and remaining observations.

Replace the bracketed prompts in each JSON file with your writing. Each project contains eight navigable sections and full-length media slots. Keep the section IDs stable; change their labels freely. The sidebar automatically follows the section list and highlights the current section while scrolling. On smaller screens, it becomes a sticky horizontal navigation strip.

Put images in `public/assets/`, then set a media block's `src` to `/assets/your-image.webp` and write a descriptive `alt`. Set `cover` and `coverAlt` for the project card and hero. Empty image paths show placeholders. Clicking an actual case-study image opens an enlarged view; Escape closes it.

Supported blocks: `text`, `columns`, `metrics`, `media`, `quote`, `resources`, `videos`, `testingPhotos`, `beforeAfter`, `feedback`, `graphic`, `questions`, `studyFlow`, `demographics`, `recognition`, `participantCounts`, `visualPlaceholder`, and `soundscapes`. `pending` blocks preserve editorial plans but are hidden from the public page. Media layouts: `wide`, `pair`, `phones`, and `short`. The layouts size placeholders; real images retain their original proportions. For a pair of screens, supply a single composed image.

Set the resume and social URLs, email address, and resource URLs when ready. Unconfigured links are displayed as text, rather than sending visitors to someone else's profile. The existing portfolio PDF is linked from About.

Echo’s Testing section includes a `testingPhotos` block in `src/content/project-one.json`. Place your testing photographs in `public/assets/` and fill each item's `src` (for example, `/assets/echo-testing-01.webp`) and descriptive `alt`. The current Echo page uses seven real installation photographs. Photos can be moved by mouse, touch, or arrow keys (Shift for larger steps).

Routes use hashes, such as `/#/project/project-one`, so static hosting does not require rewrite rules. The project slug controls its route.

## Reference fidelity

The template follows the reference's floating navigation, two-column card layout, desktop side navigation, long editorial rhythm, and dark footer composition. Content, device placeholders, icons, and contact-note artwork are replacements. Georgia substitutes for the reference's P22 Mackinac serif; to match that font exactly, provide a licensed webfont and update `--serif` in the stylesheet. Case-study headings use Inter. Final page height depends on your text and image proportions.

## Graphic styling

Follow [AGENTS.md](AGENTS.md) for layout preservation and the required visual review. Case-study covers start at the page top and occupy two thirds of the viewport height at every breakpoint. Scale inline media to the same column as the text unless a layout change is explicitly requested. Diagram labels scale proportionally with their artwork; do not impose a uniform screen-pixel text size.

Integrate charts and new graphics directly into the case-study page, aligned with the content column. Use the page background; avoid separate tinted panels, enclosing borders, rounded cards, and extra container padding unless explicitly requested.

## Echo content and graphics

`src/content/project-one.json` is the rendered content source. `project-one-media/project-one.md` is the editorial companion, not a generated input. `navLabel` provides concise navigation independently of section labels. A section with `placement: "opening"` renders after the project metadata, before the photo teaser, while remaining in the section navigation. Echo uses this for its results preview. `participantCounts` reuses the demographics dot rows; `visualPlaceholder` reserves an explicitly labeled comparison slot without inventing a graphic or data. The shared `title` is used for the project card, case-study heading, and browser title.

The Examples section after Research uses `SoundscapeCards.jsx` to adapt the six generative soundscapes from [Atmospheric Soundscapes](https://github.com/leonarda4/Atmospheric-Soundscapes). `SoundscapeCarousel.jsx` loops through complete slides within the text column: two cards per slide on desktop and one at narrow widths. Subtle arrow buttons sit at the left and right beneath the cards. Layer tabs expose each instrument’s sliders and mute toggle. Only one atmosphere plays at a time; Volume and Stop share a row above the cards. Labels and parameter ranges live in `src/components/soundscapes/data.js`, with the original Tone.js synthesis adapted in `engine.js`. Audio loads on the first play action and is disposed when leaving the case study.

Echo uses `accent: "#FFF544"` and `coverGraphic: "echo"`. `EchoCover.jsx` uses the single animated feedback-loop diagram for both the project card and case-study banner, centered and scaled proportionally within their existing dimensions, with yellow filling the remaining space. Movement loops within the diagram; the cover does not cycle between scenes. Animation pauses offscreen and becomes static with reduced motion. `EchoProject.css` keeps the highlighted question and featured feedback card yellow across portfolio themes. Testing opens with two participant videos; the Audiovisual section pairs the installation schematic with a gallery photograph.

All three supplied diagram modules were byte-identical. The imported copy is `src/components/echo-graphics/graphics.js`; `EchoGraphic.jsx` controls continuous looping while visible and respects reduced motion. The original supplied assets remain in `public/assets/echo-testing/`.

The Visuals section directly after Sounds renders 30 gradient recipes (five per emotion) from The Noise Lab with the original GLSL shader. `GradientGallery.jsx` shares one WebGL canvas across the emotion groups and supports enlarged views, pause/play, reduced motion, and saved-preview fallbacks. Recipe data and source provenance are in [src/components/noise-lab/README.md](src/components/noise-lab/README.md). The selection preserves the 12 clear screenshot matches and adds 18 similar saved recipes, with original code and parameters retained.
