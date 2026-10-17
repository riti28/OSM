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
