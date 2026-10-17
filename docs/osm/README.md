# PDF annotation prototype

## Workspace
Run `pnpm install` and `pnpm dev`, then open `/osm/annotation-demo`. The root route redirects here. Node.js 22.13+ is recommended.

Manually supply `public/osm-demo/sample-answer-book.pdf`. The missing sample shows a readable recovery screen with Retry and Open PDF. Local PDF files are opened with Blob URLs and are not uploaded. After a browser refresh, reselect a local PDF before loading its saved annotations. The reusable `PDFViewer` accepts a `pdfUrl: string`; remote URLs must allow browser CORS and PDF.js fetch/range requests.

The supplied E03/E04 UX references are stored in `docs/osm/ux/examiner/`. The annotation route follows E04: navy portal navigation, blue header, horizontal annotation toolbar, page thumbnails and grouped inspector cards. See [UX implementation notes](ux/IMPLEMENTATION.md). Reference screenshots are not embedded in the application.

## Tools
Select, Pan, Pen, Highlighter, Eraser, Rectangle, Oval, Arrow, Line, Text, Tick, Cross, Circle Mark, star stamp, Comment, Delete, Undo and Redo. Pen commits one whole stroke on pointer-up. Rectangle/Oval/Highlight are drag shapes; Line/Arrow preserve directional endpoints. Eraser deletes the clicked annotation as one undoable object action. Pan drags the PDF scroll container.

Text opens a plain-text editor and supports font size, bold, italic and underline. Double-click selected text to edit its content. Quick-comment chips prefill the comment editor after clicking the page. Manage adds/removes session-local presets. Circle Mark's text is a configurable visual stamp with no grading semantics.

Select supports movement and appropriate Konva Transformer resizing. Pen selection/movement operates on the whole stroke. The inspector edits color/thickness for the selected annotation and text formatting for selected text; with no selection it sets new-annotation defaults.

Delete/Backspace delete the selected mark when focus is outside a form control. Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z and Ctrl/Cmd+Y redo. P selects Pen, H Highlighter, E Eraser, T Text and V Select. Z/X zoom in/out. Escape deselects. Buttons have labels, titles, focus outlines and pressed states.

## Coordinates and rendering
Canonical geometry is normalized to [0,1] in the page's PDF.js intrinsic-rotation viewport. PDF and Konva use precisely the same CSS dimensions. Device pixel ratio changes only the PDF backing canvas; it never enters annotation data. Shape stroke widths are normalized to page width. Zoom and ResizeObserver change display dimensions without mutating annotation geometry. Fit modes use the largest page dimensions, so mixed page sizes do not change the zoom scale while scrolling.

`src/lib/osm/coordinates` centralizes normalization, denormalization, clipping and 0/90/180/270-degree point transforms. Rotation UI is deferred. A future user rotation must transform both the viewport and annotation geometry through these functions. Saved geometry is relative to each page's original displayed orientation.

The PDF layer is a separate PDF.js canvas below an absolutely positioned Konva stage. Full-size page canvases and stages mount only near their own PDF scroll viewport; thumbnail canvases render at 80 CSS pixels wide near the thumbnail scroll viewport. IntersectionObserver roots are the individual scroll containers, so embedded/background previews do not incorrectly unload visible pages. PDF render jobs are cancelled on dimension changes/unmount and receive a fresh canvas per job. Metadata is loaded for all pages, but high-resolution page rasterization is lazy. Page components are memoized; unchanged annotation arrays preserve their references. Active pointer points stay in local canvas state. History contains logical geometry snapshots with structural sharing (100 past actions), not bitmaps.

The local worker, WASM, CMaps and fonts are copied from the installed PDF.js package before dev/build by `scripts/copy-pdf-assets.mjs`. Generated assets are ignored in Git. Production deployments must include `public/pdfjs/`.

## JSON and temporary persistence
The application owns schema version 1, with `documentId` (PDF fingerprint, with SHA-256 fallback), `pageCount`, and an annotation array. Each annotation has an ID, page number, normalized bounds, style and timestamps; pen/line/arrow add normalized points; comment/text add plain text; stamps add a circle/star variant and stamp text. Font size is normalized to page width. Konva stage JSON is never used.

Save Annotations writes JSON to localStorage under `breathe4school-osm-demo-annotations`. Load Annotations restores it explicitly after refresh. Only one document's save occupies this prototype key; saving another PDF replaces that slot. PDF identity and page count are checked before restore. Export JSON downloads a portable backup; Import JSON validates and loads it, then Save persists it. Export alone does not change browser save status. Clear is undoable and does not overwrite the saved slot until Save is clicked.

Validation rejects malformed JSON, unsupported versions, mismatched documents, duplicate IDs, missing/out-of-bounds geometry, invalid pages/styles/text and excessive input sizes. Unknown fields are removed. No text is interpreted as HTML. Save status changes to Saved only after localStorage succeeds; save failures suggest JSON export. Unsaved changes warn on document switching and browser unload.

This is temporary browser persistence, not a backend. No MongoDB, R2, authentication, grading, submission, audit, OCR or flattened PDF export is included.

## Verification
```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Coordinate tests cover zoom/resize, rectangles, point arrays, boundaries, invalid dimensions and rotation round trips. Serialization tests cover every annotation type, document mismatch, schema and geometry validation. History tests cover add/edit/delete/undo/redo/clear and reference preservation.

## Manual QA with your supplied document
- Load a 10–50-page anonymized answer book; check low-resolution thumbnails and lazy page rendering.
- Navigate using thumbnails, Previous/Next, page input and scrolling; check current-page tracking.
- Add tick, cross, ellipse, rectangle, arrow, line, text, stamps, pen, highlight and a comment on page 3.
- Select/move a tick, resize an ellipse, move a stroke, edit text formatting and read/edit comments.
- Test Pan, object Eraser, toolbar menus, panel tabs, quick-comment management and shortcuts.
- Delete with toolbar and keyboard; undo and redo. Confirm input fields retain normal editing behavior.
- Zoom 100 → 150 → 75%; use Fit Width and Fit Page; resize the browser. Check overlay alignment.
- Go to page 4 and back to page 3; verify page-specific annotations.
- Save, refresh, Load Annotations; verify exact positions and comment text.
- Export/import JSON; try malformed JSON and JSON for another PDF. Confirm errors preserve current work.
- Clear annotations; undo clear. Verify Saved/Unsaved status and missing/invalid PDF recovery.
- Test the production server (`pnpm build && pnpm start`), including the local worker and assets.

Scanned-answer-book rendering and the full drawing checklist require the owner-supplied PDF. This repository does not generate a fake sample or commit student data.
