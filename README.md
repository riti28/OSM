# Breathe4School OSM

A focused Next.js PDF + Konva annotation foundation. No accounts, grading, database, or PDF export are included.

## Run

Use Node.js 22.13+ and pnpm 11 (or npm):

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000/osm/annotation-demo. Add your anonymized sample at `public/osm-demo/sample-answer-book.pdf`, or use **Open PDF** to choose a local file. Local PDFs stay in the browser and are ignored by Git.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Development and production builds copy the installed PDF.js worker, fonts, CMaps, and WASM assets into ignored `public/pdfjs/`. No CDN is used. Deploy that generated directory alongside the Next.js build. See [prototype documentation](docs/osm/README.md) for architecture, persistence, and the manual QA checklist.

See [verification results](docs/osm/verification.md) for the checks performed and remaining scanned-document QA.

## Cloudflare Pages

Run `pnpm build:pages` to export the app into `out/`. Both `/` and `/osm/annotation-demo/` open the annotation workspace. The export includes the installed PDF.js worker, fonts, CMaps, and WASM assets. It needs no Node.js server at runtime.

For a Git-connected Pages project, use:

- Production branch: `feature/osm-pdf-annotation`
- Build command: `pnpm build:pages`
- Build output directory: `out`
- Environment variable: `PNPM_VERSION=11.25.0`
- Node.js version: `24.19.0` (pinned in `.node-version`)

For a direct upload, upload the contents of `out/` or a ZIP with `index.html` at its root. Do not upload the repository, `.qa/`, or student PDFs. Use **Open PDF** on the deployed site to select a local document; documents and saved annotations remain in that browser. Localhost saves are separate from the deployed site's saves; use JSON export/import to transfer annotations.
