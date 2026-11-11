# Portfolio implementation rules

## Preserve the established layout

- Always write the product name "brainy storm" in lowercase, including titles, body copy, captions, and accessibility labels.
- Add visible media captions only when they provide useful context. Omit captions that simply repeat the artwork, video title, or surrounding copy.
- Use descriptive phrases for titles and headings, not short full sentences or sequences of punchy sentences.
- Abbreviate timeline months (for example, Sep 2025) and keep each month and year on one line.
- Never add a left accent border to section cards, callouts, or quote cards.
- Never use dripping letterforms. All Lacquer accent text must use the clean lowercase glyphs through the shared `accent-type` class, which still look like capitals. Do not force Lacquer to uppercase or enable dripping alternates.

- Every case study must begin with its title, summary, and then the project metadata grid (Project type, Team, Tools, Timeline, or the project’s equivalent fields). The metadata must be the first content directly below the title and summary. Results, highlights, photographs, teasers, and all other sections come after it. Preserve the metadata grid’s existing styling and responsive behavior.
- Preserve existing project titles unless the user explicitly requests a title change. Echo’s title is "Echo: Audiovisual system reinforcing expressive movement".
- Never use em dashes (Unicode U+2014) in authored copy, titles, captions, documentation, or responses. Use a period, comma, colon, parentheses, or other appropriate punctuation instead.

- Follow the existing layout unless the user explicitly requests a layout change. Preserve the cover/banner footprint, article width, gutters, alignment, spacing, and responsive behavior when replacing content or media.
- Case-study covers start at the very top of the page, with no top gap. Above 760px, they occupy two thirds of the viewport height (`66.666667svh`). At 760px and below, use the same aspect ratio as homepage card covers (`--aspect-cover`, currently 1.4) with automatic height. Use the shared sidebar navigation with the same sticky top offset as the homepage. Do not restore a centered floating navbar. Image aspect ratios and graphic components must not override this outer area.
- Fit new artwork into its existing slot. Do not change a cover's height or aspect ratio to accommodate a graphic; scale the artwork proportionally and fill remaining space with the requested background.
- Keep inline images, videos, diagrams, and charts within the same content column as the surrounding text. Scale media proportionally to the available width. Do not extend it into the navigation or unused side columns.
- When photos appear side by side, use matching frame dimensions and a consistent presentation. Preserve image proportions within those frames.
- Preserve the typography hierarchy and original diagram labels. Do not force all text to one fixed screen-pixel size, enlarge labels for artificial consistency, or split words to make oversized labels fit. Text inside artwork scales with that artwork.
- Explicit user instructions take precedence over these defaults.

## Be the visual police before finishing

- Adopt the role of the “visual police”: inspect the actual rendered result before declaring a visual implementation complete. A successful build or code review alone is not visual verification.
- Check the changed area at desktop and narrow/mobile widths, and in light and dark appearances when relevant. Compare against the established layout and any user reference.
- Look for changed cover dimensions, misaligned content edges, overflow, clipping, distorted media, oversized or broken labels, overlapping text, and awkward spacing. For animation changes, inspect transitions and the loop seam.
- Fix observed visual defects and inspect again. If preview access is blocked, state exactly which visual checks could not be completed instead of claiming they passed.
