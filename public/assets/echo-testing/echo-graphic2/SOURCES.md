# ECHO system graphics — source and interpretation

Original research notes from 18 October 2026. The current asset library uses the architecture, feedback and installation graphics; the film and separate studio have been retired.

## Verified sources

- Public Echo repository, pinned to [f1d70e6b1d38fce2f4d63ce5ee38e6daa4848f83](https://github.com/leonarda4/Echo/tree/f1d70e6b1d38fce2f4d63ce5ee38e6daa4848f83).
- `modules/pose/run_pose.py`: MediaPipe landmarks pass through `LMAExtractor`, emotion classification, and soundscape selection; local screen publication and recording are separate outputs.
- `modules/features/emotion_mapping.py`: weighted prototype distance, per-emotion temporal windows, softmax, and switching stabilization. This is more elaborate than the studio body tab's explicitly simplified unweighted preset comparison.
- `modules/pose/live_screen.py`: local HTTP server; JSON state endpoint `/api/echo-screen-state`; browser page `/echo-screen`.
- Author-supplied thesis `/Users/leonarda/Downloads/Završni_rad.pdf`: extracted all 47 PDF pages with macOS PDFKit; visually inspected PDF pages 14, 15, and 31. Printed page numbers are three lower than PDF page numbers.
- Thesis Figure 2.1, printed p. 11: phone camera; M1 pose estimation; M2 movement-feature extraction; M3 emotion classification; M4 audiovisual selection; visual and sound preset libraries; control preview; CSV/JSON log; projector; wireless headphones.
- Thesis pp. 12–13: Python / NumPy / OpenCV / MediaPipe backend; React / TypeScript browser; WebGL / GLSL visuals; Tone.js sound; HTTP polling.
- Thesis pp. 19–22: four dimensions, prototype matching, temporal summarization, and stabilized classification.
- Thesis Figure 3.1, printed p. 28: gallery installation photographs, wall projection, ceiling projector, and participant movement.

## Graphic interpretation

Architecture uses rounded plates to summarize the pipeline. The landscape includes a logging branch; the exploded study groups the system into the four thesis modules. These are deliberately reduced views rather than a complete code dependency graph. HTTP is local polling, not WebSockets or a cloud inference service.

Feedback uses a moving pulse around capture, interpretation, audiovisual response, and the participant. The return path is human perception and adaptation. The animation is conceptual; its timing does not represent measured processing latency or a validated emotional response.

Installation places a phone camera, a ceiling projector, a projection wall, the participant with wireless headphones, and a control laptop. The spatial plan and cutaway are schematic. Dimensions, device positions, viewing cones, and movement-area ellipses are not surveyed or safety-calibrated. Sound is delivered through headphones, not invented room speakers. The projected wave drawing is an abstract monochrome substitute for the actual colorful audiovisual presets, suitable for explaining the arrangement.

## Visual reference

Original React/SVG geometry informed by the [Hairline visual rules](https://github.com/lucasmarkes/hairline/blob/main/skills/hairline-create/rules.md): restrained monochrome strokes, rounded isometric plates, quiet detail, bounded motion, and labels outside the principal forms. This is an adaptation for the existing ECHO studio and Remotion frame clock, not the upstream Hairline engine or a claim of compliance with its standalone plugin workflow. No source geometry was copied.

## Current outputs

Run `npm run build` to generate `export/index.html`, SVGs, PNGs and React code from `src/assets/`. Both themes share the same geometry. See the root README for integration.
