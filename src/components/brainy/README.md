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
  stage bottom exactly. Reset happens offscreen against the restored gray background (#f5f5f3).
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

Case-study film: added a separate 67.4-second cut after the opening problem
section. Starts at full-film frame 426 (14.2 seconds), at Meet brainy storm.
The editable BrainyStormCaseStudy composition lives in the sibling video-hack
checkout. Its scripts/export_case_study.py exports from the retained 4K master
to 1080p H.264, with a poster, English WebVTT captions and hash manifest. The
original full film is preserved. The player autoplays muted, keeps native controls for pausing, seeking and
unmuting, and plays once. Reduced-motion preferences disable autoplay. Existing animated video block defaults remain.

Remotion type checking, portfolio build and full MP4 decode pass. Inspected the
rendered composition opening and exported opening, middle and ending frames.
Desktop light and mobile dark layouts were inspected in Safari: the poster and
player stay within the article column. Safari capture displays a gray surface
after starting playback, so continuous in-browser picture playback could not
be visually verified.

Live workspace revision: the user's new direction for this portfolio demo
overrides the skill's assembly and mockup defaults. The existing 8:5 article
slot now contains the full 1440 x 900 UI, without a stage or laptop. One eased
316px scroll moves the existing cards left, followed by the new networking
idea. Its discussion focus border/badge comes from the product implementation.
New card sections appear as the conversation develops. The scripted transcript
reveals words, follows the newest line, and changes the active speaker. Memo's
waveform and timer run throughout. A short dissolve returns the 16-second scene
to its opening conversation; reduced motion holds the completed card. No visible
caption is added. The separate narrative MP4 is unchanged.

Build passes. Inspected live desktop and narrow previews on light/dark surrounds
in Safari, plus fixed poses before/after the scroll, new-card arrival, completed
card, and return transition. Confirmed scrolling transcript and changing speaker
and waveform in sampled playback. Continuous two-cycle playback was not recorded.

Opaque UI motion revision: per user direction, the new idea card enters from
the right over 600ms, with approximately 4px of overshoot before settling.
The rail clips the moving card and its attached focus border. The navigation
entry and generated sections appear directly; the speaker dot pulses in scale.
The replay uses an opaque horizontal wipe instead of a dissolve. There are no
opacity transitions in this scene. The original UI geometry remains unchanged.
Build and diff checks pass. Browser capture returned blank images and repeated
active-window changes, so desktop/mobile visual checks and two-cycle playback
review of this revision could not be completed.

Laptop cover revision: replaced the central wordmark with the original laptop
frame and assembled default horizontal ideas view. The complete device fits
within 90% of the scene width and 72% of its height, preserving its 1440 x 900
display proportions and the existing cover footprint. The original agent
paths, timing, density, labels and theme backgrounds remain. The cover preview
is memoized independently of the agent playback clock.

Production build and diff checks pass. Safari accessibility confirms the new
cover description and title on the home page, but capture timed out and input
was interrupted by active-window changes. Desktop/mobile light/dark rendered
fit and two-cycle animation review could not be completed for this revision.

Cover sizing follow-up: enlarged the laptop and aligned the physical base with
the scene bottom using the original 563-unit display-to-base offset. Confirmed
the rendered desktop home card and case-study cover in Safari. Narrow light/dark
preview capture was interrupted by tab changes and could not be verified.
Production build passes. Agent motion is unchanged.

Live cover discussion: the laptop now shares the cover clock. Four scripted
turns alternate the original blue discussion border between the first two
visible cards, with word reveal, changing speakers and the original listening
waveform. Eight completed turns precede the current sentence so transcript
rotation removes only offscreen history. No fades or rail movement. The cover
cycle spans six original agent flight cycles, preserving agent speed/density.
The bottom-aligned laptop geometry and inline UI demo remain unchanged.

Production build passes. Inspected the live desktop card with the QR idea
focused, active waveform and current transcript. Full two-cycle and mobile
light/dark playback checks were interrupted by Safari active-tab changes and
remain unverified.

Idea-page agent sections: Prism, Archie, then Scout follow the workspace demo
and a brief developer-collaboration overview. The graphics use original project
research from product-source/data/ideas, with three product-focused pros, two cons, full
competitor comparisons, positioning and source links. Exact teammate quotes
come from the idea transcript; generated source context remains plain text.
The explicit request removes the application shell and mockup for this family.
Archie's map uses cyan nodes, magenta edge labels and database cylinders.

Original WorkingAgent shapes and name tags remain. These three agents have
150% body energy, 135% eye intensity and medium tempo. A broad figure-eight
crosses the output as an absolute, pointer-transparent overlay, without a
reserved column or mobile row. The 14.4-second clock closes the travel, body
and eye periods. Reduced-motion preference hides the overlay so a stationary
agent cannot cover a passage. Other WorkingAgent consumers retain defaults.

Graphics remain compact and centered within the established content column.
Checked Scout, Prism and Archie at 820px light and 375px dark viewport widths
in Safari, including mobile table labels, source expansion, bounds and map
connectors. Observed different travel positions over the content. Continuous
two-cycle playback and the exact loop seam were not visually verified.
Production build passes.

The agent graphics now fill the content column. Removed internal introductory
titles, summaries and the standalone positioning paragraph; table findings,
map labels and source disclosures remain. Verified Prism at desktop and mobile
widths. Safari lost its preview window before the final Archie/Scout recheck.

Portfolio agent-output refinement: name tags use 17px type with proportional
padding, overriding the video-sized 24px tags only in these graphics. The
figure-eight now takes 14.4 seconds, half its earlier travel speed. Body energy,
eye intensity and expression tempo remain unchanged.
Desktop Prism tag proportions inspected in the live case study. Mobile and
continuous two-cycle playback checks were interrupted by active browser changes.

Pros and cons omit numbering and the branding benefit. Every expanded source
uses the same neutral gray card, including paraphrased context. Only verbatim
transcript excerpts receive quotation marks. Desktop and mobile layouts were
visually checked with all sources expanded; build passes.

Idea-output agents now alternate four seconds of travel with a 1.8-second
signature emote. A smooth velocity ramp brakes and restarts each leg. Prism
weighs both sides, Archie builds and settles, and Scout scans the surroundings.
The 23.2-second loop advances the underlying body/eye clock by 14.4 seconds;
emotes blend back into the held pose before departure. Cover agents are unchanged.
Build and numerical hold, boundary and periodicity checks pass. Desktop/narrow
rendering and sampled emote poses were inspected in Safari. Continuous two-cycle
playback was not verified; loop continuity was checked numerically.

All five remaining pros/cons sources now use the quote-and-speaker card.
The two cons use verbatim excerpts from the product-source idea transcript,
replacing their paraphrased source_context display. Desktop and 375px source
cards were visually checked with disclosures expanded.
