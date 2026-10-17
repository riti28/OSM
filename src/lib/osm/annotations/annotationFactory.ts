import type { Annotation, AnnotationStyle, AnnotationType, Point, Rect } from "../../../types/osm/annotation";
import { boundsOfPoints, fitRect } from "../coordinates";

export const DEFAULT_STYLES: Record<AnnotationType, AnnotationStyle> = {
  tick: { color: "#00a454", strokeWidth: 0.0035, opacity: 1 },
  cross: { color: "#ff3038", strokeWidth: 0.0035, opacity: 1 },
  circle: { color: "#ff3038", strokeWidth: 0.003, opacity: 1 },
  pen: { color: "#ff3038", strokeWidth: 3 / 612, opacity: 1 },
  highlight: { color: "#ffe600", strokeWidth: 0, opacity: 0.35 },
  comment: { color: "#005dff", strokeWidth: 0.002, opacity: 1 },
  rectangle: { color: "#ff3038", strokeWidth: 0.002, opacity: 1 },
  line: { color: "#ff3038", strokeWidth: 0.003, opacity: 1 },
  arrow: { color: "#ff3038", strokeWidth: 0.003, opacity: 1 },
  text: { color: "#ff3038", strokeWidth: 0, opacity: 1, fontSize: 12 / 612, bold: false, italic: false, underline: false },
  stamp: { color: "#00a454", strokeWidth: 0.003, opacity: 1 },
};
export function createAnnotation(
  type: AnnotationType, pageNumber: number, bounds: Rect,
  style: AnnotationStyle = DEFAULT_STYLES[type],
  extra: { points?: Point[]; text?: string; variant?: "circle" | "star" } = {},
): Annotation {
  const now = new Date().toISOString();
  const base = { id: crypto.randomUUID(), pageNumber, bounds: fitRect(bounds), style: { ...style }, createdAt: now, updatedAt: now };
  if (type === "pen" || type === "line" || type === "arrow") {
    const points = extra.points ?? [];
    return { ...base, bounds: boundsOfPoints(points), type, points };
  }
  if (type === "comment" || type === "text") return { ...base, type, text: extra.text ?? "" };
  if (type === "stamp") return { ...base, type, variant: extra.variant ?? "circle", text: extra.text ?? "1" };
  return { ...base, type };
}
export function transformAnnotation(annotation: Annotation, bounds: Rect): Annotation {
  const next = fitRect(bounds);
  const base = { ...annotation, bounds: next, updatedAt: new Date().toISOString() };
  if (annotation.type !== "pen" && annotation.type !== "line" && annotation.type !== "arrow") return base;
  const previous = annotation.bounds;
  return {
    ...base, type: annotation.type,
    points: annotation.points.map(point => ({
      x: next.x + (previous.width ? (point.x - previous.x) * next.width / previous.width : 0),
      y: next.y + (previous.height ? (point.y - previous.y) * next.height / previous.height : 0),
    })),
  };
}
