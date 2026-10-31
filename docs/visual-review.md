# Echo visual review — 21 October 2026

## Findings and changes

| Issue | Change |
| --- | --- |
| 1,000px reading column encouraged long lines and oversized layouts | Shared content width of 68ch, capped at 680px; text, figures, and charts align |
| Sidebar pinned near the top; long labels wrapped | Vertically centered sticky desktop navigation; eight short labels |
| Back link interrupted the article opening | Moved above sidebar links and points to Home |
| Section padding compounded to 240px | 72px section separation, 40px internal grouping, 24px for related text and media |
| Research questions looked like unrelated oversized cards | One stacked group with 8px gaps, square corners, consistent numbering; primary question retains yellow emphasis |
| Five beige study cards were cramped and visually arbitrary | Numbered rows with hairline separators and aligned labels/descriptions |
| Heading sizes and naming competed | Defined title, section, subsection, body, and caption hierarchy; shortened navigation independently from headings |
| Duplicate feedback heading and decorative quotation marks | One section heading; actual quotation punctuation retained |
| Charts used unrelated tinted containers and rounded decoration | Flat charts, neutral tracks, shared muted data color, explicit counts |
| Permanent animation controls interrupted captions | Continuous looping while visible, without playback controls; reduced-motion preference renders a static diagram |
| Unfinished production notes appeared as public content | Pending blocks stay in source but are not rendered |
| Three identical graphic bundles | One lazily loaded shared bundle; original supplied assets retained |
| Case-study CSS accumulated contradictory overrides | Dedicated case-study.css, superseded layout declarations removed from index.css |

## Research and reference

- Jessica Hsu’s Uber case study: https://jessicahsu.design/uber — short section navigation, clear numbered research stages, editorial heading hierarchy.
- Government of Ireland typography guidance: https://ds.services.gov.ie/foundations/guidelines/typography/ — recommends 50–75 characters per line.
- GOV.UK layout guidance: https://design-system.service.gov.uk/styles/layout/ — usually no more than 75 characters per line.

68ch is a practical CSS measure, not a guarantee of exactly 68 characters in a proportional font. The 680px cap also constrains figures to the reading column.

## Verification and remaining observations

- Production build passes.
- Safari desktop: page renders, graphics load, sidebar navigation works, narrowed reading column and compact square question group verified visually. Feedback hierarchy also inspected.
- Responsive rules provide a horizontal navigation strip and single-column content on small screens; a physical mobile-device check is still outstanding.
- Existing photographic collage remains playful and draggable; its photographic styling is intentionally distinct from the research data.
- The supplied system diagram has dense internal labels. Its source artwork may need a simplified mobile variant at small widths.
- Sliders and authentic audiovisual samples remain pending in the content source.
- Global footer/profile content still contains unconfigured contact and social destinations; real values are needed before publishing.

## Sticky notes — 24 October 2026

- Reviewed the actual Safari rendering at desktop and a narrow window (approximately 574 CSS pixels), in light and dark appearances. The tray remains in the bottom-right corner and notes layer above it. The feature adds no layout styles to the case-study cover or article.
- Verified clean, flat notes at rest; color controls only on selection; no explanatory captions, counters, signatures, Post/Cancel controls, or empty-state messaging.
- Exercised pulling a new note from the stack, dragging an existing note, keyboard movement, recoloring, typing, automatic save on deselection, re-editing, and Delete/Backspace removal. Confirmed saved content through the API and removed the temporary interaction-test note.
- Verified a separate visitor’s note appears at its original Overview section when “Show others” is on and disappears when off.
- Drag/drop endpoints were visually inspected. Intermediate peel frames and physical mobile touch/keyboard behavior were not captured by the available native browser controls; reduced-motion behavior is implemented but was not visually emulated.
