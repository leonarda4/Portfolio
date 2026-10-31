# Brainy browser scenes

Adapted from the local `brainy-hq` checkout (`../video-hack`). Original character
SVGs, roster, body/eye recipes, silhouette-following tags, wordmarks, UI captures,
and laptop geometry are retained. No Remotion player or new runtime dependency.

- `BrainyCover.jsx`: cover uses `logo-flight.ts` / `passPose` entrances and exits,
  alternating direction in the upper/lower lanes around a stationary wordmark.
  Eight staggered passes repeat every 3.94 seconds; resets occur offscreen.
  Entry spacing is derived from the visible portion of each flight so roughly
  three agents remain in view, with brief partial silhouettes at the edges.
  Explicit portfolio direction overrides the skill's statement-to-logo orbit.
  The artwork fills the available cover canvas with proportional silhouettes.
  The outer cover remains owned by the portfolio's `66.666667svh` rule.
- The inline branding scene keeps the complete “Just talk” statement and the
  existing eight-second ensemble, at 1920 × 1080. It appears once in the study.
  Recia remains 84 authored pixels, tags 24; all scale with the artwork.
- Both brand scenes invert the page appearance at the user's request: light
  page → dark background/light lettering; dark page → gray background/dark
  lettering. Character colors and blue “shape.” remain the original colors.
- `BrainyWorkspace.jsx`: scene 10's cards and UI panels assemble using browser
  transforms, then the original MacBook frame appears and the card rail scrolls
  through all five ideas. The interface uses original 2× PNG layers, not video.
  The original clean transcript header replaces the captured Memo overlay, grouped
  with the panel throughout its entrance and fade.
  The viewport remains 1440 × 900 with the sourced 15/840 bezel geometry.
  Stage is 1920 × 1200, matching the existing 8:5 inline media footprint.
  The 10-second loop uses smooth ease-in/ease-out, with assembly, one smooth horizontal scroll, and a
  downward exit. The larger 1560px screen and original laptop base meet the
  stage bottom exactly. Reset happens offscreen against the restored gray background (#eaeae8).
  Assembly, scrolling and exit run 1.4× faster; the listening pulse keeps its
  original cadence.
  The listening dock has native SVG lobes driven by the scene clock, adapted
  from the app RecordingShape and 950ms alternate brand-listen motion. Reduced motion holds the laptop.
- `MotionCanvas.jsx`: ResizeObserver fit, 30 fps browser clock, IntersectionObserver
  and document visibility pause, plus live reduced-motion preference support.

Visual review: desktop cover before the final flight/theme correction, UI assembly
at .7/2.2/3.7 seconds, laptop at 6.4 seconds, and scroll holds at 8.5/12 seconds
were inspected in Safari. Native preview controls then timed out. Final corrected
cover/mobile/light-dark render checks and two continuous cycles remain unverified.

Transcript-header correction: inspected the rendered scene in Safari at 680px and
342px widths, during the panel entrance (3.7s) and card scroll (10.3s). The clean
header preserves the title and menu and removes Memo at both scales. Build passes.

2026-10-27: reviewed the enlarged laptop at 680px and 342px delivery widths,
including the downward exit and blue loop boundary. Corrected the lower screen
corner radius to match the sourced bezel and prevent blue corner gaps.

Pacing revision: restored gray, shortened the loop to 10 seconds, and applied
quintic ease-in/out to assembly, scroll and exit. Build passed. The final
playback recheck was interrupted by user activity in Safari; desktop/mobile
playback of this timing revision has not been visually verified.

Cover density revision: lowercase product naming across portfolio copy and labels.
Three in-view agent centers verified across 3,600 time/layout samples, with
matching loop positions. Desktop light and mobile dark frames inspected in Safari.

Transcript content revision: replaced the truncated screenshot body with six complete
speaker turns in native DOM text. The continuation is illustrative demo copy, not
a verbatim meeting record. Preserves the sourced clean header, native geometry,
Supreme 400/500 typography and avatar styling. Fonts are hosted locally with
source URLs and hashes in provenance.json. Inspected assembled and entrance
frames in Safari at 680px and 342px widths: all six turns fit inside the panel.
Build passed. Motion timing is unchanged; continuous playback was not re-reviewed.

Movement builder: two new article sections after identity, using the original
brainy-hq agents/family-preview.html controls and motion recipes. BuilderAgent
ports the contour-following badge, ear movement, and upright-eye rendering from
agents/characters.js; builder-shapes.json is the original agents/shapes.json.
One shared editor selects an agent; the family section shares its reactive store.
Recipes autosave separately per agent under portfolio-brainy-motion-v1. Stored
values are validated; unavailable storage falls back to memory. Tempo changes
preserve motion phase. Quick spins remain one-shot; reduced motion is respected.
Animation rendering stops offscreen and in hidden tabs.

Reviewed desktop light (680px content) and mobile dark (342px content) in Safari,
including editor, dropdowns, family cards, and selecting/restoring Finn's bounce.
A reload retained the edit and the family reflected it. Three store tests and
production build pass. Continuous two-cycle playback was not visually recorded.

Graphics playground: appended after the family section using the original
brainy-hq graphics/topics/workbench renderer and curated catalog. Includes 42
recipes, 18 color combinations plus each original palette, three color inputs,
and scale/spacing sliders. No action toolbar or locks. Edits remain independent
per recipe while browsing; graphics edits are in memory for the current visit.
The static inline SVG updates directly as controls change. The component loads
lazily and stays inside the existing article column.

Reviewed desktop light (680px content) and mobile dark (342px content) in Safari:
recipe strip, artwork, palettes, color inputs and sliders fit without page
overflow. Palette and scale changes update the artwork; switching away and back
retains both edits. All recipes and palette combinations pass rendering checks
at both slider extremes. Five graphics/store tests and production build pass.

Graphics motion revision: removed the three individual color inputs. All 42
recipes now use their original internal entrance animations on a shared playback
clock. Each entrance plays once, then holds the completed composition without fading or resetting.
Palette/geometry edits retain playback time. Playback pauses outside the viewport
and in hidden tabs; reduced motion displays the composed artwork. SVG mask IDs
are unique per preview. Agent-selection tabs now show animated character icons,
with accessible names and hover titles. The explicit icon-only selector request
overrides the motion skill's visible-name-tag default only for these controls;
preview and family tags remain. Eight columns become four on narrow screens.

Build and five tests pass, including motion markup for every recipe. Final visual
checks of this revision are blocked: Safari reports cgWindowNotFound, and both
Safari and Chrome UI access timed out. Desktop/mobile light/dark appearance and
two-cycle playback of the new loops have not been visually verified.
