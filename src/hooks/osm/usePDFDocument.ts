"use client";

import { useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PageInfo } from "@/types/osm/pdf";

type Loaded = { key: string; document?: PDFDocumentProxy; documentId?: string; pages?: PageInfo[]; error?: string };
export function usePDFDocument(url: string) {
  const [attempt, setAttempt] = useState(0);
  const key = url + "|" + attempt;
  const [loaded, setLoaded] = useState<Loaded>({ key: "" });
  useEffect(() => {
    let disposed = false;
    let task: ReturnType<typeof import("pdfjs-dist")["getDocument"]> | undefined;
    async function load() {
      try {
        const pdfjs = await import("pdfjs-dist");
        if (disposed) return;
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/build/pdf.worker.min.mjs";
        task = pdfjs.getDocument({ url, cMapUrl: "/pdfjs/cmaps/", cMapPacked: true,
          standardFontDataUrl: "/pdfjs/standard_fonts/", wasmUrl: "/pdfjs/wasm/" });
        const document = await task.promise;
        const pages = await Promise.all(Array.from({ length: document.numPages }, async (_, index) => {
          const page = await document.getPage(index + 1);
          const viewport = page.getViewport({ scale: 1 });
          return { pageNumber: index + 1, width: viewport.width, height: viewport.height, rotation: viewport.rotation };
        }));
        const documentId = document.fingerprints[0] ?? Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(await document.getData()))), byte => byte.toString(16).padStart(2, "0")).join("");
        if (!disposed) setLoaded({ key, document, documentId, pages });
      } catch (error) {
        if (disposed) return;
        const missing = error instanceof Error && (error.name === "MissingPDFException" || /404|missing pdf/i.test(error.message));
        const message = missing && url === "/osm-demo/sample-answer-book.pdf"
          ? "Sample PDF not found. Add: public/osm-demo/sample-answer-book.pdf"
          : url.startsWith("blob:") ? "Unable to open this PDF. Choose the file again, or select another valid PDF."
          : "Unable to open this PDF. Check the file or URL, and retry. " + (error instanceof Error ? error.message : "");
        setLoaded({ key, error: message });
      }
    }
    void load();
    return () => { disposed = true; void task?.destroy(); };
  }, [url, key]);
  return { document: loaded.key === key ? loaded.document : undefined,
    documentId: loaded.key === key ? loaded.documentId : undefined,
    pages: loaded.key === key ? loaded.pages : undefined,
    error: loaded.key === key ? loaded.error : undefined,
    retry: () => setAttempt(value => value + 1) };
}
