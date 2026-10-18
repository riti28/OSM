import { useState } from "react";
import type { AnnotationStyle, Tool, ToolOptions } from "@/types/osm/annotation";
import Icon, { type IconName } from "../ui/Icon";

type ToolControlProps = { tool: Tool; onTool: (tool: Tool) => void };
export function ToolButton({ tool, label, icon, active, onTool, className = "" }: {
  tool: Tool; label: string; icon: IconName; active: boolean; onTool: (tool: Tool) => void; className?: string;
}) {
  return <button className={"tool-button " + (active ? "active " : "") + className} title={label}
    aria-label={label} aria-pressed={active} onClick={() => onTool(tool)}><Icon name={icon}/><span>{label}</span></button>;
}
export function DrawingToolButtons(p: ToolControlProps) {
  return <>
    <ToolButton tool="pen" label="Pen" icon="pen" active={p.tool === "pen"} onTool={p.onTool}/>
    <ToolButton tool="highlight" label="Highlighter" icon="highlight" active={p.tool === "highlight"} onTool={p.onTool} className="yellow-icon"/>
    <ToolButton tool="erase" label="Eraser" icon="erase" active={p.tool === "erase"} onTool={p.onTool}/>
    <details className="tool-dropdown"><summary className={"tool-button " + (["rectangle", "circle", "arrow", "line"].includes(p.tool) ? "active" : "")} title="Shape tools"><span className="icon-with-chevron"><Icon name="rectangle"/><Icon name="chevron" size={13}/></span><span>Shape</span></summary>
      <div className="tool-menu" onClick={e => e.currentTarget.closest("details")?.removeAttribute("open")}>
        {([["rectangle", "Rectangle", "rectangle"], ["circle", "Oval", "circle"], ["arrow", "Arrow", "arrow"], ["line", "Line", "line"]] as const).map(([tool, label, icon]) =>
          <ToolButton key={tool} tool={tool} label={label} icon={icon} active={p.tool === tool} onTool={p.onTool}/>)}
      </div></details>
    <ToolButton tool="text" label="Text" icon="text" active={p.tool === "text"} onTool={p.onTool}/>
    <details className="tool-dropdown"><summary className={"tool-button " + (["tick", "cross", "stamp", "comment"].includes(p.tool) ? "active" : "")} title="Stamp tools"><span className="icon-with-chevron"><Icon name="stamp"/><Icon name="chevron" size={13}/></span><span>Stamp</span></summary>
      <div className="tool-menu" onClick={e => e.currentTarget.closest("details")?.removeAttribute("open")}>
        <ToolButton tool="tick" label="Tick" icon="tick" active={p.tool === "tick"} onTool={p.onTool}/>
        <ToolButton tool="cross" label="Cross" icon="cross" active={p.tool === "cross"} onTool={p.onTool}/>
        <ToolButton tool="stamp" label="Circle Mark" icon="circle" active={p.tool === "stamp"} onTool={p.onTool}/>
        <ToolButton tool="comment" label="Comment" icon="comment" active={p.tool === "comment"} onTool={p.onTool}/>
      </div></details>
  </>;
}
type Props = ToolControlProps & {
  style: AnnotationStyle; onStyle: (style: AnnotationStyle) => void;
  textStyle: AnnotationStyle; onTextStyle: (style: AnnotationStyle) => void;
  options: ToolOptions; onOptions: (options: ToolOptions) => void; onQuickComment: (text: string) => void;
  canDelete: boolean; onDelete: () => void;
};
const defaultComments = ["Well Done", "Good Attempt", "Check Steps", "Calculation Error", "Incorrect", "Incomplete", "Re-evaluate", "Needs Review"];
export default function AnnotationToolbar(p: Props) {
  const [tab, setTab] = useState("Annotation Tools");
  const [comments, setComments] = useState(defaultComments);
  const [manage, setManage] = useState(false), [newComment, setNewComment] = useState("");
  const stamps = <section className="tool-section stamps-section"><h3>Stamps</h3><div className="stamp-grid">
    <ToolButton tool="tick" label="Tick" icon="tick" active={p.tool === "tick"} onTool={p.onTool} className="green-icon"/>
    <ToolButton tool="cross" label="Cross" icon="cross" active={p.tool === "cross"} onTool={p.onTool} className="red-icon"/>
    <button className={"tool-button " + (p.tool === "stamp" && p.options.stampVariant === "circle" ? "active" : "")} title="Place a circle stamp" aria-label="Circle Mark" aria-pressed={p.tool === "stamp" && p.options.stampVariant === "circle"}
      onClick={() => { p.onOptions({ ...p.options, stampVariant: "circle" }); p.onTool("stamp"); }}><span className="circle-stamp-icon">{p.options.stampText}</span><span>Circle Mark</span></button>
    <button className={"tool-button " + (p.tool === "stamp" && p.options.stampVariant === "star" ? "active" : "")} title="Place a star stamp" aria-label="Custom stamp" aria-pressed={p.tool === "stamp" && p.options.stampVariant === "star"}
      onClick={() => { p.onOptions({ ...p.options, stampVariant: "star" }); p.onTool("stamp"); }}><Icon name="star" className="blue-icon"/><span>Custom</span></button>
    </div>{p.tool === "stamp" && p.options.stampVariant === "circle" && <label className="stamp-value">Stamp text<input aria-label="Stamp text" maxLength={6} value={p.options.stampText}
      onChange={e => p.onOptions({ ...p.options, stampText: e.target.value || "1" })}/></label>}</section>;
  const quick = <section className="tool-section quick-comments-section"><h3>Quick Comments<button className="text-link" onClick={() => setManage(!manage)}>{manage ? "Done" : "Manage"}</button></h3>
    <div className="quick-comment-grid">{comments.map((text, index) => <div className={"comment-chip-wrap chip-" + index % 8} key={text}>
      <button title={"Choose “" + text + "”, then click the page"} aria-pressed={p.tool === "comment" && p.options.commentText === text}
        onClick={() => p.onQuickComment(text)}>{text}</button>
      {manage && <button className="remove-chip" aria-label={"Remove quick comment " + text} onClick={() => setComments(comments.filter(value => value !== text))}>×</button>}
    </div>)}</div>
    {manage && <form className="manage-comments" onSubmit={e => { e.preventDefault(); const text = newComment.trim(); if (text && !comments.includes(text)) setComments([...comments, text]); setNewComment(""); }}>
      <input aria-label="New quick comment" placeholder="Add a quick comment" maxLength={80} value={newComment} onChange={e => setNewComment(e.target.value)}/><button type="submit" title="Add quick comment"><Icon name="plus" size={15}/></button></form>}
    {p.tool === "comment" && <p className="placement-hint">Click the page to add your comment.</p>}
  </section>;
  return <aside className="tool-panel" aria-label="Annotation tools">
    <div className="inspector-tabs" role="tablist" aria-label="Annotation panel">{["Annotation Tools", "Quick Comments", "Stamps"].map(label => <button key={label} role="tab" aria-selected={tab === label}
      aria-controls="annotation-tool-content" id={"tab-" + label.replaceAll(" ", "-")} onClick={() => setTab(label)}>{label}</button>)}</div>
    <div className="inspector-content" id="annotation-tool-content" role="tabpanel" aria-labelledby={"tab-" + tab.replaceAll(" ", "-")}>
      {tab === "Annotation Tools" && <>
        <section className="tool-section drawing-section"><h3>Drawing Tools</h3><div className="drawing-grid">
          <ToolButton tool="pen" label="Pen" icon="pen" active={p.tool === "pen"} onTool={p.onTool}/>
          <label className="color-tool-card" title="Annotation color"><span className="color-tool-swatch"><input type="color" aria-label="Annotation color" value={p.style.color} onChange={e => p.onStyle({ ...p.style, color: e.target.value })}/><Icon name="chevron" size={14}/></span><span>Color</span></label>
          <ToolButton tool="highlight" label="Highlighter" icon="highlight" active={p.tool === "highlight"} onTool={p.onTool} className="yellow-icon"/>
          <ToolButton tool="erase" label="Eraser" icon="erase" active={p.tool === "erase"} onTool={p.onTool}/>
        </div><label className="thickness-control"><span>Thickness</span><input type="range" aria-label="Stroke width" min="1" max="8" step="1"
          value={Math.max(1, Math.round((p.style.strokeWidth || 3 / 612) * 612))} onChange={e => p.onStyle({ ...p.style, strokeWidth: Number(e.target.value) / 612 })}/>
          <span>{Math.max(1, Math.round((p.style.strokeWidth || 3 / 612) * 612))} px</span></label>
          {p.tool === "highlight" && <label className="thickness-control"><span>Opacity</span><input type="range" aria-label="Annotation opacity" min=".1" max="1" step=".05" value={p.style.opacity}
            onChange={e => p.onStyle({ ...p.style, opacity: Number(e.target.value) })}/><span>{Math.round(p.style.opacity * 100)}%</span></label>}
        </section>
        <section className="tool-section shape-section"><h3>Shape &amp; Text Tools</h3><div className="shape-grid">
          {([["rectangle", "Rectangle", "rectangle"], ["circle", "Oval", "circle"], ["arrow", "Arrow", "arrow"], ["line", "Line", "line"], ["text", "Text", "text"]] as const).map(([tool, label, icon]) =>
            <ToolButton key={tool} tool={tool} label={label} icon={icon} active={p.tool === tool} onTool={p.onTool}/>)}
        </div><div className="text-format-controls"><label className="text-color-picker" title="Text color"><input type="color" aria-label="Text color" value={p.textStyle.color} onChange={e => p.onTextStyle({ ...p.textStyle, color: e.target.value })}/><Icon name="chevron" size={13}/></label>
          <select aria-label="Text font size" value={Math.round((p.textStyle.fontSize ?? 12 / 612) * 612)} onChange={e => p.onTextStyle({ ...p.textStyle, fontSize: Number(e.target.value) / 612 })}>
            {[10, 12, 14, 18, 24, 32].map(size => <option key={size} value={size}>{size}</option>)}</select>
          <div className="font-toggles"><button title="Bold text" aria-label="Bold text" aria-pressed={!!p.textStyle.bold} onClick={() => p.onTextStyle({ ...p.textStyle, bold: !p.textStyle.bold })}><b>B</b></button>
            <button title="Italic text" aria-label="Italic text" aria-pressed={!!p.textStyle.italic} onClick={() => p.onTextStyle({ ...p.textStyle, italic: !p.textStyle.italic })}><i>I</i></button>
            <button title="Underline text" aria-label="Underline text" aria-pressed={!!p.textStyle.underline} onClick={() => p.onTextStyle({ ...p.textStyle, underline: !p.textStyle.underline })}><u>U</u></button></div>
        </div></section>
      </>}
      {tab !== "Quick Comments" && stamps}
      {tab !== "Stamps" && quick}
      <section className="shortcuts-section"><h3>Annotation Shortcuts</h3><div className="shortcuts-grid">
        <span><kbd>P</kbd>Pen Tool</span><span><kbd>Z</kbd>Zoom In</span>
        <span><kbd>H</kbd>Highlighter</span><span><kbd>X</kbd>Zoom Out</span>
        <span><kbd>E</kbd>Eraser</span><span><kbd>Ctrl + Z</kbd>Undo</span>
        <span><kbd>T</kbd>Text Tool</span><span><kbd>Ctrl + Y</kbd>Redo</span>
      </div></section>
      <div className="selection-actions"><button title="Add a comment anywhere on the page" onClick={() => p.onQuickComment("")}><Icon name="comment" size={16}/>Add comment</button>
        <button title="Delete selected annotation (Delete / Backspace)" disabled={!p.canDelete} onClick={p.onDelete}><Icon name="cross" size={13}/>Delete selected</button></div>
    </div>
  </aside>;
}
