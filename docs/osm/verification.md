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
Add anonymized sample-answer-book.pdf and the two UX references described in README. Validate a real scanned answer book (including 10–50 pages and unusually large scans); this run used a public vector PDF. Visual matching awaits the supplied UX images.

Local PDF selection must be repeated after refresh; saved annotation JSON is retained. Temporary localStorage has one document slot; use exported JSON for backups. Rotation UI and final PDF export remain outside this phase.
