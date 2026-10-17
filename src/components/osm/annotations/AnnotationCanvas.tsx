"use client";

import { memo, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import type Konva from "konva";
import type { Annotation, AnnotationStyle, Point, Tool, ToolOptions } from "@/types/osm/annotation";
import { boundsOfPoints, normalizePoint, normalizeRect } from "@/lib/osm/coordinates";
import { createAnnotation } from "@/lib/osm/annotations/annotationFactory";
import AnnotationRenderer from "./AnnotationRenderer";

type Props = {
  pageNumber: number; width: number; height: number; annotations: Annotation[]; tool: Tool; style: AnnotationStyle; options: ToolOptions;
  selectedId: string | null; onSelect: (id: string | null) => void;
  onAdd: (annotation: Annotation) => void; onUpdate: (annotation: Annotation) => void;
  onComment: (annotation: Annotation) => void; onErase: (annotation: Annotation) => void;
};
function AnnotationCanvas(p: Props) {
  const stage = useRef<Konva.Stage>(null);
  const active = useRef<{ start: Point; points: Point[]; id: string; draft: Annotation | null } | null>(null);
  const [draft, setDraft] = useState<Annotation | null>(null);
  const size = { width: p.width, height: p.height };
  function point(): Point | null {
    const screen = stage.current?.getPointerPosition();
    return screen ? normalizePoint(screen, size) : null;
  }
  function start(event: Konva.KonvaEventObject<PointerEvent>) {
    if (event.evt.button !== 0 || !event.evt.isPrimary || p.tool === "pan" || p.tool === "erase") return;
    const at = point();
    if (!at) return;
    if (p.tool === "select") {
      if (event.target === stage.current) p.onSelect(null);
      return;
    }
    event.evt.preventDefault();
    if (p.tool === "tick" || p.tool === "cross" || p.tool === "comment" || p.tool === "text" || p.tool === "stamp") {
      const annotation = createAnnotation(p.tool, p.pageNumber,
        { ...at, width: p.tool === "text" ? 0.28 : 0.05, height: p.tool === "text" ? 0.09 : 0.04 }, p.style,
        { text: p.tool === "stamp" ? p.options.stampText : p.tool === "comment" ? p.options.commentText : "", variant: p.options.stampVariant });
      if (p.tool === "comment" || p.tool === "text") p.onComment(annotation);
      else p.onAdd(annotation);
      return;
    }
    if (event.evt.target instanceof Element) event.evt.target.setPointerCapture(event.evt.pointerId);
    active.current = { start: at, points: [at], id: crypto.randomUUID(), draft: null };
  }
  function move() {
    const drawing = active.current, at = point();
    if (!drawing || !at || !["pen", "circle", "highlight", "rectangle", "line", "arrow"].includes(p.tool)) return;
    const type = p.tool as "pen" | "circle" | "highlight" | "rectangle" | "line" | "arrow";
    if (type === "pen") {
      const previous = drawing.points[drawing.points.length - 1];
      if (Math.hypot((at.x - previous.x) * p.width, (at.y - previous.y) * p.height) < 1.5 || drawing.points.length >= 20000) return;
      drawing.points.push(at);
    } else if (type === "line" || type === "arrow") drawing.points = [drawing.start, at];
    const bounds = type === "pen" || type === "line" || type === "arrow" ? boundsOfPoints(drawing.points) :
      normalizeRect({ x: drawing.start.x * p.width, y: drawing.start.y * p.height,
        width: (at.x - drawing.start.x) * p.width, height: (at.y - drawing.start.y) * p.height }, size);
    const annotation = createAnnotation(type, p.pageNumber, bounds, p.style, { points: [...drawing.points] });
    drawing.draft = { ...annotation, id: drawing.id };
    setDraft(drawing.draft);
  }
  function finish() {
    move();
    const complete = active.current?.draft;
    if (complete && (("points" in complete && complete.points.length >= 2 &&
        Math.hypot(complete.bounds.width * p.width, complete.bounds.height * p.height) >= 3) ||
        (complete.bounds.width * p.width >= 3 && complete.bounds.height * p.height >= 3))) p.onAdd(complete);
    active.current = null;
    setDraft(null);
  }
  return <div className="annotation-overlay" style={{ width: p.width, height: p.height, pointerEvents: p.tool === "pan" ? "none" : undefined,
      cursor: p.tool === "select" ? "default" : p.tool === "erase" ? "not-allowed" : p.tool === "text" ? "text" : "crosshair" }}
    role="group" aria-label={"Annotation canvas for page " + p.pageNumber}>
    <Stage ref={stage} width={p.width} height={p.height} onPointerDown={start} onPointerMove={move}
      onPointerUp={finish} onPointerCancel={() => { active.current = null; setDraft(null); }}>
      <Layer listening={p.tool === "select" || p.tool === "erase"}>
        {p.annotations.map(annotation => <AnnotationRenderer key={annotation.id} annotation={annotation} width={p.width} height={p.height}
          selected={annotation.id === p.selectedId} selectable={p.tool === "select"} erasable={p.tool === "erase"} onErase={p.onErase} onSelect={p.onSelect}
          onUpdate={p.onUpdate} onComment={p.onComment} />)}
        {draft && <AnnotationRenderer annotation={draft} width={p.width} height={p.height} selected={false}
          selectable={false} onErase={p.onErase} onSelect={p.onSelect} onUpdate={p.onUpdate} onComment={p.onComment} />}
      </Layer>
    </Stage>
  </div>;
}
export default memo(AnnotationCanvas);
