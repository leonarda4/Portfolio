# Echo editorial revision : 26 October 2026

## Content and evidence

Rendered source: `src/content/project-one.json`. The Markdown editorial companion has been aligned with the revision.

- Opening: ownership and challenge, followed immediately by the project metadata, then a brief results section before the photographs. The complete three-row self-ratings chart uses the existing `BeforeAfterChart` and appears once in the opening results section.
- Decisions: physical sustainability, preserving brief arm-opening gestures, and stabilizing atmosphere transitions. No formulas or invented measured improvements.
- Testing: recognition and self-rating data preserved. Added the determination recognition/expression contrast and the relationship descriptions. The latter uses the same dot-row component and CSS as demographics.
- Feedback: three existing verbatim responses, prioritizing natural expression, uncertainty, and the audiovisual experience.
- Sound and visual examples follow the core case-study narrative.
- One visible placeholder for an eventual movement comparison. It is not presented as evidence or a completed before/after measurement.

Source: `/Users/leonarda/Downloads/Leonarda_Lovric_zavrsni_rad.pdf`.

| Evidence | Printed page / PDF page |
| --- | --- |
| Removing smoothing from body openness (CI) because it hid brief arm movements | 16 / 19 |
| Immediate switching for a stronger match; persistence for less decisive changes | 22 / 25 |
| Recognition counts: 9, 9, 9, 9, 8, 5 | Figure 3.5, 32 / 35 |
| Determination expression self-rating: 2.5/5 | Figure 3.8, 34 / 37 |
| Body awareness 2.4→4.1; happiness 3.2→4.4; confidence 3.5→4.1 | Figure 3.10, 35 / 38 |
| Partner 40%, guide 30%, unpredictable 20%, mirror 10%, n=10 | Figure 3.12, 37 / 40 |

The physical-effort/calibration iteration comes from the pre-existing authored case study. The PDF does not establish the exact before/after calibration adjustment or a quantified reduction in effort. The English quotations and their participant numbers likewise remain sourced to the original case-study content.

## Validation

- Production build passed.
- Content audit passed: existing chart data, selected quotations, photo teaser, and cover selection preserved; new counts total ten; section IDs unique; one explicit visual placeholder.
- Safari rendered the updated title and summary; the full accessibility tree confirmed the revised content and section order.
- Desktop 1440×900 measurements: cover 600px, article 680px, no horizontal page overflow, no checked chart/diagram/placeholder outside the article, results before photos.
- Full visual review remains incomplete: Safari repeatedly timed out and the computer-use session reset. The results chart, comparison placeholder, and relationship chart still need visual inspection at desktop and narrow widths in light and dark appearances. Mobile and dark checks are not claimed as passed.
- Cover, article layout, existing chart CSS, diagram labels, and animation code were not changed by this revision.

## Opening-order correction

Restored the original Echo title. The shared case-study renderer now places metadata immediately after the title and summary, before results and media. This order and the prohibition on em dashes are recorded in AGENTS.md and PROJECT_STRUCTURE.md.

The corrected title, summary, and metadata were visually inspected in Safari using actual page components at 1440px and 390px widths in light and dark appearances. The temporary review isolated the opening by hiding surrounding content. No clipping or overlapping metadata was observed. This verifies the opening-order correction; the earlier full-page chart review remains a separate outstanding check. Production build passed after the correction.

## Results consolidation: 2 November 2026

Moved the full self-ratings chart into the opening results section after metadata. Removed the single-row preview, later duplicate, and the two-column partner/guide and interaction-clarity summary. The chart values, component, and styling are unchanged. The Markdown companion matches the rendered content.

Production build and content checks passed. The actual results components were inspected at 1440px and 390px in an isolated local preview. Light appearance showed all three rows without clipping or overlap. Dark typography and spacing were visible, but the embedded preview remained in its initial animation state; the completed dark chart animation could not be verified. No animation code was changed.
