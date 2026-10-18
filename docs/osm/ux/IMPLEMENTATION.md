# E04 annotation-workspace alignment

The current annotation route follows E04 - Annotation Tools. At the 1536 x 1024 reference viewport, the portal sidebar is 242 px wide, the portal header is 56 px tall, the content starts at x=263, the thumbnail column is 138 px wide, and the inspector is 362 px wide. The PDF page starts below a 68 px horizontal tool strip. A narrower desktop layout is supported at 1366 x 900.

The interface uses real React elements, local SVG icons/brand artwork, and CSS. The supplied PNGs remain in docs; no screenshot, handwritten answer page, student name, or examiner identity is embedded as application content. Actual file name, page count, PDF fingerprint and selected page drive the header. The header states that files remain on the device; it does not present an examiner identity or account dropdown.

Working controls:
- Select and Pan.
- Pen and translucent Highlighter.
- Object Eraser: click an annotation to delete the whole object, with undo support.
- Rectangle, Oval, Arrow and Line (including horizontal and reversed endpoints).
- Text: plain-text editor with normalized font size, bold, italic and underline; double-click selected text to edit its content.
- Tick, Cross, configurable Circle Mark text, and a star stamp.
- Quick-comment presets and session-local preset management.
- Undo/redo, zoom, Fit Page and Fit Width.
- Saved/Unsaved state, browser persistence and JSON import/export.

Selected annotation color/thickness can be edited in the inspector. Selecting text also lets the formatting controls edit that annotation. Formatting changes enter the same logical undo history. With no selection, controls set defaults for new annotations.

Circle Mark is a visual stamp only; it does not award question marks or implement grading. Navigation shows only working Open PDF, Annotation Tools, and Help & Shortcuts controls. Save/Load/JSON controls remain in the footer; saves are isolated by PDF and restore automatically when the document opens.

The initial state preserves the annotation layout with drawing controls disabled until the user selects their own PDF. No bundled document, example file request, or missing-sample error is shown. The last valid PDF is remembered only on the device and can be removed with Close PDF.
