# ECHO asset library

**Edit `src/assets/`. Open `export/index.html`.** There is one renderer for the live gallery, SVG/PNG files and exported React components.

```sh
npm install
npm run build
npm test
```

The build generates ten English-labeled graphics in both light and dark, 1920 × 1080 SVGs and PNGs, and two ZIP downloads. Open the gallery directly from disk; it needs no server or internet connection. Click a theme, preview the animation, and download assets or React code.

## Source of truth

- `src/assets/catalog.ts` — the ten graphic IDs, labels and loop duration.
- `src/assets/ContentGraphic.tsx` — shared SVG composition.
- `src/assets/SystemGraphic.tsx`, `Figures.tsx` — graphic geometry.
- `src/assets/pose.ts`, `house.json` — authored gesture and the recorded pose track used by the graphics.
- `src/assets/tokens.ts` — both theme palettes. Colors inherit through SVG variables; animation opacity is preserved.
- `src/assets/PortfolioGraphic.tsx` — playback, pause, offscreen suspension and reduced-motion support.
- `src/gallery/` — the gallery interface, using those exact components.
- `scripts/` — build and verification only.
- `materials/` — original research, footage, attribution and recordings, not an alternate asset library.
- `export/` — generated delivery files. Do not edit these; rebuild them.

## Use the code

Extract `export/downloads/echo-code.zip`. Install React 18+ and React DOM in the consuming project, then copy `code/` into it:

```tsx
import {PortfolioGraphic} from './code/echo-graphics.js';

<PortfolioGraphic id="system-architecture" theme="light" />
```

`PortfolioGraphic` includes playback controls, pauses outside the viewport and in hidden tabs, and respects reduced motion. `ContentGraphic` accepts `id`, `theme`, and `time` in seconds for a custom clock or static SVG. Both themes use identical geometry. The ZIP includes original TypeScript source and declarations, with `echo-graphics.js` as the bundled entry point. No Remotion runtime is needed by consumers.

## Motion

All graphics share an eight-second period. Procedural motion uses whole-cycle phases; the recorded House phrase joins its pose coordinates smoothly at the boundary. Open-path signal dots fade out before wrapping. No duplicate-image crossfades or video playback are involved. The body movement remains an illustrative recording, not a claim of live classification.

SVG remains sharp at any scale. PNG exports are rendered at native 1080p. The old MP4/WebM gallery and film/presentation build pipelines have been removed. `npm run build` replaces all generated output together, so stale assets cannot remain in the library.

The build uses Node, Python 3's standard library (ZIP packaging), and Remotion's headless Chromium renderer (PNG capture). On first use, Chromium may need to download. No Python virtual environment, Pillow, media processing or API key is required.

## Interactive movement panel

`DancePanel` is a separately exported React component, shown above the asset gallery. It uses the recorded House phrase with Weight, Time, Flow and CI controls, persistent live/reference bounding boxes and circles on twelve joints. Time changes playback speed without resetting the phase. Weight adds downward emphasis, Flow adds held phrasing, and CI blends toward the original contracted demonstration pose. Circle area follows the selected motion, weight or flow proxy. These are illustrative controls, not the original live classifier.

```tsx
import {DancePanel} from './code/echo-graphics.js';
<DancePanel theme="light" />
```

The `contraction-index` asset restores the video's authored crouch-to-open pose as an eight-second cycle, with the live bounding box and fixed open-pose reference always visible. Both the asset and panel are included in the shared source/code export.
