"use client";

import { memo, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import type Konva from "konva";
import type { Annotation, AnnotationStyle, Point, Tool } from "@/types/osm/annotation";
import { boundsOfPoints, normalizePoint, normalizeRect } from "@/lib/osm/coordinates";
import { createAnnotation } from "@/lib/osm/annotations/annotationFactory";
import AnnotationRenderer from "./AnnotationRenderer";

type Props = {
  pageNumber: number; width: number; height: number; annotations: Annotation[]; tool: Tool; style: AnnotationStyle;
  selectedId: string | null; onSelect: (id: string | null) => void;
  onAdd: (annotation: Annotation) => void; onUpdate: (annotation: Annotation) => void;
  onComment: (annotation: Annotation) => void;
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
    if (event.evt.button !== 0 || !event.evt.isPrimary) return;
    const at = point();
    if (!at) return;
    if (p.tool === "select") {
      if (event.target === stage.current) p.onSelect(null);
      return;
    }
    event.evt.preventDefault();
    stage.current?.container().setPointerCapture(event.evt.pointerId);
    if (p.tool === "tick" || p.tool === "cross" || p.tool === "comment") {
      const annotation = createAnnotation(p.tool, p.pageNumber, { ...at, width: 0.045, height: 0.032 }, p.style);
      if (p.tool === "comment") p.onComment(annotation);
      else p.onAdd(annotation);
      return;
    }
    active.current = { start: at, points: [at], id: crypto.randomUUID(), draft: null };
  }
  function move() {
    const drawing = active.current, at = point();
    if (!drawing || !at || p.tool === "select" || p.tool === "tick" || p.tool === "cross" || p.tool === "comment") return;
    if (p.tool === "pen") {
      const previous = drawing.points[drawing.points.length - 1];
      if (Math.hypot((at.x - previous.x) * p.width, (at.y - previous.y) * p.height) < 1.5 || drawing.points.length >= 20000) return;
      drawing.points.push(at);
    }
    const bounds = p.tool === "pen" ? boundsOfPoints(drawing.points) :
      normalizeRect({ x: drawing.start.x * p.width, y: drawing.start.y * p.height,
        width: (at.x - drawing.start.x) * p.width, height: (at.y - drawing.start.y) * p.height }, size);
    const annotation = createAnnotation(p.tool, p.pageNumber, bounds, p.style, { points: [...drawing.points] });
    drawing.draft = { ...annotation, id: drawing.id };
    setDraft(drawing.draft);
  }
  function finish() {
    const complete = active.current?.draft;
    if (complete && ((complete.type === "pen" && complete.points.length >= 2) ||
        (complete.bounds.width * p.width >= 3 && complete.bounds.height * p.height >= 3))) p.onAdd(complete);
    active.current = null;
    setDraft(null);
  }
  return <div className="annotation-overlay" style={{ width: p.width, height: p.height, cursor: p.tool === "select" ? "default" : "crosshair" }}
    role="group" aria-label={"Annotation canvas for page " + p.pageNumber}>
    <Stage ref={stage} width={p.width} height={p.height} onPointerDown={start} onPointerMove={move}
      onPointerUp={finish} onPointerCancel={() => { active.current = null; setDraft(null); }}>
      <Layer listening={p.tool === "select"}>
        {p.annotations.map(annotation => <AnnotationRenderer key={annotation.id} annotation={annotation} width={p.width} height={p.height}
          selected={annotation.id === p.selectedId} selectable={p.tool === "select"} onSelect={p.onSelect}
          onUpdate={p.onUpdate} onComment={p.onComment} />)}
        {draft && <AnnotationRenderer annotation={draft} width={p.width} height={p.height} selected={false}
          selectable={false} onSelect={p.onSelect} onUpdate={p.onUpdate} onComment={p.onComment} />}
      </Layer>
    </Stage>
  </div>;
}
export default memo(AnnotationCanvas);
