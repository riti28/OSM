# Verification record — 17 October 2026

Initial inspection: the local workspace and origin repository were empty (no commits, source files, or dependencies). The original local branch was main. Implementation uses Next.js App Router under src/app, React state/reducer, and plain CSS. Installed versions: Next.js 16.4.2, React/React DOM 19.3.1, TypeScript 5.9.3, PDF.js 6.4.299, Konva 10.9.0, react-konva 19.3.2, Vitest 3.2.7. No existing PDF/canvas/UI code was available to reuse.

## Automated checks
- ESLint: passed, no warnings or errors.
- TypeScript: passed.
- Vitest: 30 tests passed across coordinate and annotation suites.
- Next.js production build: passed; /osm/annotation-demo prerendered successfully.
- git diff --check: passed.

Checks executed the commands defined by the package scripts directly with Node. The sandbox's pnpm launcher used a different store directory than the elevated installation; direct CLI execution avoided an unnecessary dependency reinstall. The lockfile and explicit build-script approvals are committed for a normal pnpm install.

## Browser checks
Used PDF.js's existing public 14-page technical-paper PDF, downloaded only into ignored .qa/reference.pdf from https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf. No sample answer book was fabricated or committed.

Verified the missing-sample recovery message, loading a local PDF, thumbnails, page navigation, all six drawing tools, comment viewing/editing, tick movement, ellipse resizing, keyboard delete, undo and redo. Verified page isolation with six annotations on page 1, one on page 3, and none on page 4.

Zoomed 100 → 150 → 75 percent and resized 1440×1000 → 1280×900. Saved status remained unchanged. Refreshed, reselected the same local PDF, and loaded saved annotations. Exported JSON before and after this sequence compared exactly: all seven annotations, geometry, IDs, page assignments, styles, timestamps, and comment text were equal.

The production server also loaded all 14 pages using the local PDF.js worker, imported the validated JSON, and saved the restored annotations successfully. Unsupported-schema JSON was rejected while preserving all seven annotations. Fit Width and Fit Page worked; the PDF canvas and Konva overlay had identical x, y, width and height in Fit Width. No browser error/warning logs were recorded during these production checks.

## Remaining owner QA
Add anonymized sample-answer-book.pdf. Validate a real scanned answer book (including 10–50 pages and unusually large scans); browser QA used a public vector PDF. E03/E04 UX references have now been supplied and applied to the annotation workspace.

Local PDF selection must be repeated after refresh; saved annotation JSON is retained. Temporary localStorage has one document slot; use exported JSON for backups. Rotation UI and final PDF export remain outside this phase.


## E04 UX update - 17 October 2026
The owner confirmed the current annotation-workspace scope. E03/E04 were extracted from the supplied ZIP into docs/osm/ux/examiner. The route was rebuilt to match E04 at 1536 x 1024 and checked at 1366 x 900. No screenshot is used as a page background or production asset.

Added working Pan, object Eraser, Rectangle, Arrow, Line, formatted Text, circle/star stamps, panel tabs, quick-comment presets/management and keyboard shortcuts. Inspector styling also edits selected annotations. Existing JSON schema 1 remains readable; additional annotation types and optional normalized text-format fields are validated and serialized explicitly.

Final checks: ESLint passed, TypeScript passed, all 44 unit tests passed, and the production build passed. Browser QA covered every tool, backwards arrows, horizontal lines, bold/italic/underlined text, selected-text font editing and undo, eraser/undo/redo, panning by 150 px, the Pen shortcut, tab navigation and quick-comment management.

Created 12 annotations spanning all 11 annotation types (including both stamp variants). Exported JSON before and after selected-style edit/undo, zoom 150 to 75 percent, viewport resize, refresh, PDF reselect and Load Annotations compared exactly. Production import restored all 12 annotations and saved successfully; no warning/error logs were captured.

Actual production screenshot: ignored .qa/ux-e04-workspace.png. The sample PDF remains absent; the empty state retains the E04 layout with disabled tools and an explicit Open PDF action.

Lazy-rendering observers were scoped to their PDF/thumbnail scroll containers after preview capture exposed a window-intersection edge case. The production build and focused lint checks passed after this correction.
