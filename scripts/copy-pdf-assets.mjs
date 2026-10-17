import { cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const source = dirname(require.resolve("pdfjs-dist/package.json"));
const target = join(process.cwd(), "public", "pdfjs");
await mkdir(target, { recursive: true });
for (const asset of ["build/pdf.worker.min.mjs", "cmaps", "standard_fonts", "wasm"]) {
  await cp(join(source, asset), join(target, asset), { recursive: true });
}
