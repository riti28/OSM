"use client";

import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./pdf/PDFViewer"), {
  ssr: false,
  loading: () => <main className="boot-state">Opening annotation workspace…</main>,
});

export default function AnnotationDemo() {
  return <PDFViewer pdfUrl="/osm-demo/sample-answer-book.pdf" />;
}
