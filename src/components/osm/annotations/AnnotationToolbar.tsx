import type { AnnotationStyle, Tool } from "@/types/osm/annotation";

const tools: { tool: Tool; label: string; icon: string; hint: string }[] = [
  { tool: "select", label: "Select", icon: "↖", hint: "Select, move, or resize an annotation" },
  { tool: "tick", label: "Tick", icon: "✓", hint: "Click to place a tick" },
  { tool: "cross", label: "Cross", icon: "×", hint: "Click to place a cross" },
  { tool: "circle", label: "Circle", icon: "○", hint: "Drag to draw an ellipse" },
  { tool: "pen", label: "Pen", icon: "✎", hint: "Draw a freehand stroke" },
  { tool: "highlight", label: "Highlight", icon: "▰", hint: "Drag to highlight an area" },
  { tool: "comment", label: "Comment", icon: "▤", hint: "Click to add a note" },
];
type Props = {
  tool: Tool; onTool: (tool: Tool) => void; style: AnnotationStyle; onStyle: (style: AnnotationStyle) => void;
  canDelete: boolean; onDelete: () => void; canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void;
};
export default function AnnotationToolbar(p: Props) {
  return <aside className="tool-panel" aria-label="Annotation tools">
    <div className="panel-heading"><span className="eyebrow">ANNOTATE</span><h2>Your toolkit</h2><p>Make every note count.</p></div>
    <div className="tool-list" role="toolbar" aria-label="Drawing tools">
      {tools.map(item => <button key={item.tool} type="button" title={item.hint} aria-label={item.label}
        aria-pressed={p.tool === item.tool} className={"tool-button " + (p.tool === item.tool ? "active" : "")}
        onClick={() => p.onTool(item.tool)}><span className="tool-icon" aria-hidden="true">{item.icon}</span>
        <span>{item.label}</span>{p.tool === item.tool && <span className="active-dot" aria-hidden="true">●</span>}</button>)}
    </div>
    <div className="style-controls">
      <label>Ink color <input aria-label="Annotation color" type="color" value={p.style.color}
        onChange={e => p.onStyle({ ...p.style, color: e.target.value })} /></label>
      <label>Stroke <select aria-label="Stroke width" value={p.style.strokeWidth || 0.0025}
        onChange={e => p.onStyle({ ...p.style, strokeWidth: Number(e.target.value) })}>
        <option value={0.0015}>Fine</option><option value={0.0025}>Regular</option>
        <option value={0.0035}>Medium</option><option value={0.005}>Bold</option></select></label>
      <label>Opacity <span>{Math.round(p.style.opacity * 100)}%</span></label>
      <input aria-label="Annotation opacity" type="range" min="0.1" max="1" step="0.05" value={p.style.opacity}
        onChange={e => p.onStyle({ ...p.style, opacity: Number(e.target.value) })} />
      <p>Style applies to new annotations.</p>
    </div>
    <div className="history-controls">
      <button title="Undo (Ctrl / ⌘ Z)" aria-label="Undo" disabled={!p.canUndo} onClick={p.onUndo}>↶ Undo</button>
      <button title="Redo (Ctrl / ⌘ Shift Z)" aria-label="Redo" disabled={!p.canRedo} onClick={p.onRedo}>↷ Redo</button>
    </div>
    <button className="delete-button" title="Delete selected annotation (Delete / Backspace)" disabled={!p.canDelete}
      onClick={p.onDelete}>Delete selected</button>
    <div className="tool-tip"><strong>A little guidance</strong><p>{tools.find(t => t.tool === p.tool)?.hint}.</p>
      <p>Use Select to edit a mark. Click a comment marker to read or edit it.</p></div>
  </aside>;
}
