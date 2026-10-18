# Breathe4School OSM

Open your PDFs, annotate them, and save your work on your device. Built with Next.js, PDF.js, and Konva.

## Run

Use Node.js 22.13+ and pnpm 11 (or npm):

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000/osm/annotations/ and choose **Open PDF**. No example document is bundled or requested. Your last valid PDF is remembered in IndexedDB and reopened after refresh. Saved annotations are restored separately for each document. **More → Close PDF** removes the remembered file; JSON export/import provides portable annotation backups. Documents are never uploaded.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Development and production builds copy the installed PDF.js worker, fonts, CMaps, and WASM assets into ignored `public/pdfjs/`. No CDN is used. Deploy that generated directory alongside the Next.js build. See [workspace documentation](docs/osm/README.md) for architecture, persistence, and the manual QA checklist.

See [verification results](docs/osm/verification.md) for the checks performed and remaining scanned-document QA.

## Cloudflare Pages

Run `pnpm build:pages` to export the app into `out/`. Both `/` and `/osm/annotations/` open the annotation workspace. Existing `/osm/annotation-demo/` links redirect on Pages through `public/_redirects`. The export includes the installed PDF.js worker, fonts, CMaps, and WASM assets. It needs no Node.js server at runtime.

For a Git-connected Pages project, use:

- Production branch: `feature/osm-pdf-annotation`
- Build command: `pnpm build:pages`
- Build output directory: `out`
- Environment variable: `PNPM_VERSION=11.25.0`
- Node.js version: `24.19.0` (pinned in `.node-version`)

For a direct upload, upload the contents of `out/` or a ZIP with `index.html` at its root. Do not upload the repository, `.qa/`, or student PDFs. Use **Open PDF** on the deployed site to select a local document; documents and saved annotations remain in that browser. Localhost saves are separate from the deployed site's saves; use JSON export/import to transfer annotations.
