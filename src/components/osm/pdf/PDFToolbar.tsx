import type { Tool } from "@/types/osm/annotation";
import type { Zoom } from "@/types/osm/pdf";
import Icon from "../ui/Icon";
import { DrawingToolButtons, ToolButton } from "../annotations/AnnotationToolbar";

type Props = { scale: number; zoom: Zoom; onZoom: (zoom: Zoom) => void; tool: Tool; onTool: (tool: Tool) => void;
  canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void; };
export default function PDFToolbar(p: Props) {
  return <div className="pdf-toolbar" role="toolbar" aria-label="PDF and annotation controls">
    <ToolButton tool="select" label="Select" icon="select" active={p.tool === "select"} onTool={p.onTool}/>
    <ToolButton tool="pan" label="Pan" icon="pan" active={p.tool === "pan"} onTool={p.onTool}/>
    <div className="zoom-controls">
      <button title="Zoom out (X)" aria-label="Zoom out" disabled={p.scale <= 0.5} onClick={() => p.onZoom({ mode: "custom", scale: Math.max(0.5, p.scale - 0.25) })}><Icon name="minus" size={16}/></button>
      <select aria-label="Zoom percentage" value={p.zoom.mode === "custom" ? p.zoom.scale : "fit"} onChange={e => p.onZoom({ mode: "custom", scale: Number(e.target.value) })}>
        {p.zoom.mode !== "custom" && <option value="fit">{Math.round(p.scale * 100)}%</option>}
        {![0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].includes(p.scale) && p.zoom.mode === "custom" && <option value={p.scale}>{Math.round(p.scale * 100)}%</option>}
        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(value => <option key={value} value={value}>{value * 100}%</option>)}
      </select>
      <button title="Zoom in (Z)" aria-label="Zoom in" disabled={p.scale >= 2} onClick={() => p.onZoom({ mode: "custom", scale: Math.min(2, p.scale + 0.25) })}><Icon name="plus" size={16}/></button>
    </div>
    <DrawingToolButtons tool={p.tool} onTool={p.onTool}/>
    <button className="tool-button" title="Undo (Ctrl / ⌘ Z)" aria-label="Undo" disabled={!p.canUndo} onClick={p.onUndo}><Icon name="undo"/><span>Undo</span></button>
    <button className="tool-button" title="Redo (Ctrl / ⌘ Shift Z)" aria-label="Redo" disabled={!p.canRedo} onClick={p.onRedo}><Icon name="redo"/><span>Redo</span></button>
    <details className="fit-controls"><summary className={"tool-button " + (p.zoom.mode !== "custom" ? "fit-active" : "")} title="Page fit options"><Icon name="expand"/><span>Fit to Page</span></summary><div className="tool-menu fit-menu">
      <button aria-pressed={p.zoom.mode === "page"} onClick={e => { p.onZoom({ mode: "page" }); e.currentTarget.closest("details")?.removeAttribute("open"); }}><Icon name="expand" size={17}/>Fit Page</button>
      <button aria-pressed={p.zoom.mode === "width"} onClick={e => { p.onZoom({ mode: "width" }); e.currentTarget.closest("details")?.removeAttribute("open"); }}><Icon name="width" size={17}/>Fit Width</button>
    </div></details>
  </div>;
}
