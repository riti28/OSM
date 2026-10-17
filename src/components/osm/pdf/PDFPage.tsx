import { memo } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { Annotation, AnnotationStyle, Tool, ToolOptions } from "@/types/osm/annotation";
import type { PageInfo } from "@/types/osm/pdf";
import { useNearby, usePageCanvas } from "@/hooks/osm/usePageCanvas";
import AnnotationCanvas from "../annotations/AnnotationCanvas";

type Props = {
  document: PDFDocumentProxy; page: PageInfo; scale: number; annotations: Annotation[];
  tool: Tool; style: AnnotationStyle; options: ToolOptions; selectedId: string | null;
  onSelect: (id: string | null) => void; onAdd: (annotation: Annotation) => void;
  onUpdate: (annotation: Annotation) => void; onErase: (annotation: Annotation) => void; onComment: (annotation: Annotation) => void;
};
function PDFPage(p: Props) {
  const width = p.page.width * p.scale, height = p.page.height * p.scale;
  const { ref, nearby } = useNearby();
  const { host, error, loading } = usePageCanvas(p.document, p.page.pageNumber, width, nearby);
  return <section ref={ref} className="page-section" data-page={p.page.pageNumber} aria-label={"PDF page " + p.page.pageNumber}>
    <div className="page-caption"><span>Page {p.page.pageNumber}</span>
      <span>{p.annotations.length} {p.annotations.length === 1 ? "annotation" : "annotations"}</span></div>
    <div className="pdf-page" style={{ width, height }}>
      <div ref={host} className="pdf-render-layer" />
      {nearby && loading && !error && <span className="page-loading">Rendering page…</span>}
      {nearby && !error && <AnnotationCanvas pageNumber={p.page.pageNumber} width={width} height={height}
        annotations={p.annotations} options={p.options} onErase={p.onErase} tool={p.tool} style={p.style} selectedId={p.selectedId}
        onSelect={p.onSelect} onAdd={p.onAdd} onUpdate={p.onUpdate} onComment={p.onComment} />}
      {error && <div className="page-render-error" role="alert">{error}</div>}
    </div>
  </section>;
}
export default memo(PDFPage);
