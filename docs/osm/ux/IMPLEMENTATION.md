# E04 annotation-workspace alignment

The current annotation route follows E04 - Annotation Tools. At the 1536 x 1024 reference viewport, the portal sidebar is 242 px wide, the portal header is 56 px tall, the content starts at x=263, the thumbnail column is 138 px wide, and the inspector is 362 px wide. The PDF page starts below a 68 px horizontal tool strip. A narrower desktop layout is supported at 1366 x 900.

The interface uses real React elements, local SVG icons/brand artwork, and CSS. The supplied PNGs remain in docs; no screenshot, handwritten answer page, student name, or examiner identity is embedded as application content. Actual file name, page count, PDF fingerprint and selected page drive the header. The profile identifies the generic examiner workspace because authentication is outside this phase.

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

Circle Mark is a visual stamp only; it does not award question marks or implement grading. Navigation labels outside Annotation Tools are visual shell elements with no dashboard, account or workflow implementation. Manual Save/Load/JSON controls are retained in the footer to preserve the prototype's persistence workflow.

The missing-PDF state preserves the complete layout with annotation controls disabled and an Open PDF recovery action. An actual anonymized answer-book PDF still needs to be supplied at public/osm-demo/sample-answer-book.pdf.
