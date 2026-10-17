import { memo } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PageInfo } from "@/types/osm/pdf";
import { useNearby, usePageCanvas } from "@/hooks/osm/usePageCanvas";

const Thumbnail = memo(function Thumbnail({ document, page, current, navigate }: {
  document: PDFDocumentProxy; page: PageInfo; current: boolean; navigate: (page: number) => void;
}) {
  const { ref, nearby } = useNearby("200px");
  const width = 80, height = page.height * width / page.width;
  const { host, error } = usePageCanvas(document, page.pageNumber, width, nearby, true);
  return <div ref={ref} className="thumbnail-item">
    <button aria-label={"Go to page " + page.pageNumber} aria-current={current ? "page" : undefined}
      className={"thumbnail-button " + (current ? "current" : "")} onClick={() => navigate(page.pageNumber)}>
      <div className="thumbnail-paper" style={{ width, height }}><div ref={host} />
        {error && <span>Preview unavailable</span>}</div>
      <span className="thumbnail-label">{page.pageNumber}</span>
    </button>
  </div>;
});
export default function PDFThumbnailSidebar({ document, pages, current, navigate }: {
  document: PDFDocumentProxy; pages: PageInfo[]; current: number; navigate: (page: number) => void;
}) {
  return <aside className="thumbnail-sidebar" aria-label="Page thumbnails">
    <div className="thumbnail-heading"><h2>Pages ({pages.length})</h2></div>
    <div className="thumbnail-scroll" data-pdf-scroll-root="">{pages.map(page => <Thumbnail key={page.pageNumber} document={document} page={page}
      current={page.pageNumber === current} navigate={navigate} />)}</div>
  </aside>;
}
