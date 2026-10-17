import type { Zoom } from "@/types/osm/pdf";

export default function PDFToolbar({ page, count, navigate, scale, zoom, onZoom }: {
  page: number; count: number; navigate: (page: number) => void; scale: number; zoom: Zoom; onZoom: (zoom: Zoom) => void;
}) {
  return <div className="pdf-toolbar" role="toolbar" aria-label="PDF controls">
    <div className="page-controls">
      <button title="Previous page" aria-label="Previous page" disabled={page <= 1} onClick={() => navigate(page - 1)}>‹</button>
      <label>Page <input key={page} aria-label="Page number" type="number" min={1} max={count} defaultValue={page}
        onBlur={e => { const next = Number(e.target.value); if (Number.isInteger(next) && next >= 1 && next <= count) navigate(next); else e.target.value = String(page); }}
        onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }} /> <span>of {count}</span></label>
      <button title="Next page" aria-label="Next page" disabled={page >= count} onClick={() => navigate(page + 1)}>›</button>
    </div>
    <span className="toolbar-divider" />
    <div className="zoom-controls">
      <button title="Zoom out" aria-label="Zoom out" disabled={scale <= 0.5} onClick={() => onZoom({ mode: "custom", scale: Math.max(0.5, scale - 0.25) })}>−</button>
      <select aria-label="Zoom percentage" value={zoom.mode === "custom" ? zoom.scale : "fit"} onChange={e => onZoom({ mode: "custom", scale: Number(e.target.value) })}>
        {zoom.mode !== "custom" && <option value="fit">{Math.round(scale * 100)}%</option>}
        {![0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].includes(scale) && zoom.mode === "custom" && <option value={scale}>{Math.round(scale * 100)}%</option>}
        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(value => <option key={value} value={value}>{value * 100}%</option>)}
      </select>
      <button title="Zoom in" aria-label="Zoom in" disabled={scale >= 2} onClick={() => onZoom({ mode: "custom", scale: Math.min(2, scale + 0.25) })}>+</button>
    </div>
    <span className="toolbar-divider" />
    <button className={"fit-button " + (zoom.mode === "width" ? "pressed" : "")} aria-pressed={zoom.mode === "width"}
      title="Fit width" onClick={() => onZoom({ mode: "width" })}>↔ Fit width</button>
    <button className={"fit-button " + (zoom.mode === "page" ? "pressed" : "")} aria-pressed={zoom.mode === "page"}
      title="Fit page" onClick={() => onZoom({ mode: "page" })}>▣ Fit page</button>
    <span className="viewer-mode">PDF + annotations</span>
  </div>;
}
