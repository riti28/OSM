import type { Annotation, AnnotationStyle, AnnotationType, Point, Rect } from "../../../types/osm/annotation";
import { boundsOfPoints, fitRect } from "../coordinates";

export const DEFAULT_STYLES: Record<AnnotationType, AnnotationStyle> = {
  tick: { color: "#16835d", strokeWidth: 0.0035, opacity: 1 },
  cross: { color: "#dc4655", strokeWidth: 0.0035, opacity: 1 },
  circle: { color: "#dc4655", strokeWidth: 0.003, opacity: 1 },
  pen: { color: "#315ad9", strokeWidth: 0.0025, opacity: 1 },
  highlight: { color: "#f6ce45", strokeWidth: 0, opacity: 0.35 },
  comment: { color: "#315ad9", strokeWidth: 0.002, opacity: 1 },
};
export function createAnnotation(
  type: AnnotationType, pageNumber: number, bounds: Rect,
  style: AnnotationStyle = DEFAULT_STYLES[type],
  extra: { points?: Point[]; text?: string } = {},
): Annotation {
  const now = new Date().toISOString();
  const base = { id: crypto.randomUUID(), pageNumber, bounds: fitRect(bounds), style: { ...style }, createdAt: now, updatedAt: now };
  if (type === "pen") {
    const points = extra.points ?? [];
    return { ...base, bounds: boundsOfPoints(points), type, points };
  }
  if (type === "comment") return { ...base, type, text: extra.text ?? "" };
  return { ...base, type };
}
export function transformAnnotation(annotation: Annotation, bounds: Rect): Annotation {
  const next = fitRect(bounds);
  const base = { ...annotation, bounds: next, updatedAt: new Date().toISOString() };
  if (annotation.type !== "pen") return base;
  const previous = annotation.bounds;
  return {
    ...base, type: "pen",
    points: annotation.points.map(point => ({
      x: next.x + (previous.width ? (point.x - previous.x) * next.width / previous.width : 0),
      y: next.y + (previous.height ? (point.y - previous.y) * next.height / previous.height : 0),
    })),
  };
}
