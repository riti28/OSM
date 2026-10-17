"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

export function useNearby(margin = "600px") {
  const ref = useRef<HTMLDivElement>(null);
  const [nearby, setNearby] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(entries => setNearby(entries[0].isIntersecting), { rootMargin: margin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [margin]);
  return { ref, nearby };
}
export function usePageCanvas(document: PDFDocumentProxy, pageNumber: number, width: number, active: boolean, thumbnail = false) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [renderedWidth, setRenderedWidth] = useState(0);
  useEffect(() => {
    const element = host.current;
    if (!active || !element) return;
    let disposed = false;
    let task: ReturnType<Awaited<ReturnType<PDFDocumentProxy["getPage"]>>["render"]> | undefined;
    const canvas = window.document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    element.replaceChildren(canvas);
    async function render() {
      try {
        const page = await document.getPage(pageNumber);
        if (disposed) return;
        const natural = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: width / natural.width });
        const ratio = thumbnail ? 1 : Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(viewport.width * ratio);
        canvas.height = Math.ceil(viewport.height * ratio);
        canvas.style.width = viewport.width + "px";
        canvas.style.height = viewport.height + "px";
        task = page.render({ canvas, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
        await task.promise;
        if (!disposed) { setError(""); setRenderedWidth(width); }
      } catch (cause) {
        if (!disposed && !(cause instanceof Error && cause.name === "RenderingCancelledException"))
          setError("Page " + pageNumber + " could not render. Retry the document.");
      }
    }
    void render();
    return () => { disposed = true; task?.cancel(); canvas.remove(); };
  }, [document, pageNumber, width, active, thumbnail]);
  return { host, error, loading: renderedWidth !== width };
}
