# Portfolio implementation rules

## Preserve the established layout

- Always write the product name "brainy storm" in lowercase, including titles, body copy, captions, and accessibility labels.

- Every case study must begin with its title, summary, and then the project metadata grid (Project type, Team, Tools, Timeline, or the project’s equivalent fields). The metadata must be the first content directly below the title and summary. Results, highlights, photographs, teasers, and all other sections come after it. Preserve the metadata grid’s existing styling and responsive behavior.
- Preserve existing project titles unless the user explicitly requests a title change. Echo’s title is "Echo: Audiovisual system reinforcing expressive movement".
- Never use em dashes (Unicode U+2014) in authored copy, titles, captions, documentation, or responses. Use a period, comma, colon, parentheses, or other appropriate punctuation instead.

- Follow the existing layout unless the user explicitly requests a layout change. Preserve the cover/banner footprint, article width, gutters, alignment, spacing, and responsive behavior when replacing content or media.
- Case-study covers start at the very top of the page, with no top gap, and occupy two thirds of the viewport height (`66.666667svh`) at every breakpoint. Keep the floating navigation over the cover. Image aspect ratios and graphic components must not override this outer area.
- Fit new artwork into its existing slot. Do not change a cover's height or aspect ratio to accommodate a graphic; scale the artwork proportionally and fill remaining space with the requested background.
- Keep inline images, videos, diagrams, and charts within the same content column as the surrounding text. Scale media proportionally to the available width. Do not extend it into the navigation or unused side columns.
- Preserve the typography hierarchy and original diagram labels. Do not force all text to one fixed screen-pixel size, enlarge labels for artificial consistency, or split words to make oversized labels fit. Text inside artwork scales with that artwork.
- Explicit user instructions take precedence over these defaults.

## Be the visual police before finishing

- Adopt the role of the “visual police”: inspect the actual rendered result before declaring a visual implementation complete. A successful build or code review alone is not visual verification.
- Check the changed area at desktop and narrow/mobile widths, and in light and dark appearances when relevant. Compare against the established layout and any user reference.
- Look for changed cover dimensions, misaligned content edges, overflow, clipping, distorted media, oversized or broken labels, overlapping text, and awkward spacing. For animation changes, inspect transitions and the loop seam.
- Fix observed visual defects and inspect again. If preview access is blocked, state exactly which visual checks could not be completed instead of claiming they passed.
