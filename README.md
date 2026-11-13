# Leonarda Portfolio

React + Vite portfolio with a continuous homepage: Home, Work, Play, About me, Resume, and Contact. The sidebar scrolls to each section and follows the current section, like the case-study navigation. Work begins at the project cards, ordered Tomsoft, Echo, then brainy storm. Play has two experiment slots in `src/portfolioData.js`, each with a cover, title, and metadata. Incomplete slots stay hidden. Existing `/work` and `/about` hash routes open their sections on the homepage; `/play`, `/resume`, and `/contact` work the same way.

## Run

```sh
npm install
npm run dev
```

`npm run build` creates the production site in `dist/`.

## Visitor drawings and sticky notes

The published site currently enables browser-only drawings and sticky notes. Both live in memory for the current tab, remain available when navigating between pages, and clear on reload. Drawing undo/clear and note editing, moving, recoloring, and deleting work without any API or browser-storage writes. Shared visitor controls are hidden until a persistence backend is deployed. The permanent About me notes and artwork remain visible.

The shared implementation described below is retained for future deployment, but is not mounted by the current app.

The compact bottom-left toolbar provides a crayon and a stack of sticky notes. The crayon draws opaque, rounded, gently irregular strokes across the page background, with a random bright color for each stroke. Every completed stroke saves automatically to the server with its exact shape, color, page, creation time, and position. Drawings anchor to nearby content and scale proportionally across screen sizes. Existing tab-local drawings are imported on the next visit to their page. Click the crayon again or press Escape to stop; use Command/Ctrl+Z while drawing to undo. Undo and “Clear my drawings” remove only drawings owned by the current visitor.

Click or drag the note stack to create a note in its displayed color, with a peel effect while dragging. The next note color is chosen randomly. Notes are flat at rest and render above page content. Write directly on a note and click away to save automatically. Select a note to move or recolor it; double-click to edit. Delete/Backspace removes the selected note when not typing. Arrow keys move selected notes (Shift for larger steps). Escape or Command/Ctrl+Enter finishes editing; empty notes disappear. There are no Post/Cancel buttons, note labels, counters, or empty-state messages.

`npm run dev` and `npm run preview` include both endpoints automatically. To serve the production build with shared notes and drawings:

```sh
npm run build
npm start
```

The production server defaults to `127.0.0.1:3000`. Set `HOST=0.0.0.0` and `PORT` as required by your hosting, and set `STICKER_DATA_FILE` and `DRAWING_DATA_FILE` to persistent writable paths (for example, a mounted data volume). Run one server process against these files, keep backups, and preserve the original Host header through a reverse proxy. The rate limit uses the direct connection IP; a reverse proxy would share a bucket unless trusted client-IP handling is added for that deployment.

Uploading only `dist/` to a static host does **not** provide shared posting; it also needs this endpoint and persistent storage. No hosting or deployment has been configured. Failed saves keep the note in the current page and show a retry action. Published content is public; the site owner can maintain the JSON file while the server is stopped.

Run `npm run test:stickers` and `npm run test:drawings` for persistence, simultaneous posting, retries, validation, cross-visitor reads, ownership, responsive placement, and undo/clear during active saves.

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
