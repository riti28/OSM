import type { Annotation, AnnotationFile, AnnotationsByPage, DocumentInfo } from "../../../types/osm/annotation";

const MAX_ANNOTATIONS = 10000;
const MAX_POINTS = 20000;
const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const unit = (value: unknown): value is number => finite(value) && value >= 0 && value <= 1;
const date = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
function validAnnotation(value: unknown, pageCount: number): value is Annotation {
  if (!object(value)) return false;
  const b = value.bounds, s = value.style;
  if (typeof value.id !== "string" || !value.id.length || value.id.length > 200 ||
      !Number.isInteger(value.pageNumber) || !finite(value.pageNumber) || value.pageNumber < 1 || value.pageNumber > pageCount ||
      !date(value.createdAt) || !date(value.updatedAt) || !object(b) || !object(s)) return false;
  if (!unit(b.x) || !unit(b.y) || !unit(b.width) || !unit(b.height) ||
      b.x + b.width > 1 + 1e-9 || b.y + b.height > 1 + 1e-9) return false;
  if (typeof s.color !== "string" || !/^#[0-9a-f]{6}$/i.test(s.color) ||
      !unit(s.opacity) || !finite(s.strokeWidth) || s.strokeWidth < 0 || s.strokeWidth > 0.05) return false;
  if (value.type === "pen") {
    if (!Array.isArray(value.points) || value.points.length < 2 || value.points.length > MAX_POINTS) return false;
    return value.points.every(p => object(p) && unit(p.x) && unit(p.y) &&
      p.x >= (b.x as number) - 1e-9 && p.y >= (b.y as number) - 1e-9 &&
      p.x <= (b.x as number) + (b.width as number) + 1e-9 && p.y <= (b.y as number) + (b.height as number) + 1e-9);
  }
  if (b.width <= 0 || b.height <= 0) return false;
  if (value.type === "comment") return typeof value.text === "string" && value.text.trim().length > 0 && value.text.length <= 5000;
  return ["tick", "cross", "circle", "highlight"].includes(String(value.type));
}
export function deserializeAnnotations(json: string, expected?: DocumentInfo): AnnotationFile {
  if (json.length > 20_000_000) throw new Error("Annotation file exceeds the 20 MB limit.");
  let data: unknown;
  try { data = JSON.parse(json); } catch { throw new Error("Invalid annotation JSON. Choose a valid JSON file."); }
  if (!object(data) || data.schemaVersion !== 1) throw new Error("Unsupported annotation schema. Expected version 1.");
  if (typeof data.documentId !== "string" || !data.documentId || !finite(data.pageCount) ||
      !Number.isInteger(data.pageCount) || data.pageCount < 1 ||
      !Array.isArray(data.annotations) || data.annotations.length > MAX_ANNOTATIONS)
    throw new Error("Annotation document metadata is invalid.");
  if (expected && (data.documentId !== expected.id || data.pageCount !== expected.pageCount))
    throw new Error("These annotations belong to a different PDF. Open the matching document first.");
  const ids = new Set<string>();
  for (const annotation of data.annotations) {
    if (!validAnnotation(annotation, data.pageCount)) throw new Error("Invalid annotation geometry, style, text, or page number.");
    if (ids.has(annotation.id)) throw new Error("Duplicate annotation IDs are not allowed.");
    ids.add(annotation.id);
  }
  // Rebuild allowed fields: never pass arbitrary imported properties into Konva.
  const annotations = (data.annotations as Annotation[]).map(a => {
    const base = { id: a.id, pageNumber: a.pageNumber, bounds: { x: a.bounds.x, y: a.bounds.y, width: a.bounds.width, height: a.bounds.height },
      style: { color: a.style.color, strokeWidth: a.style.strokeWidth, opacity: a.style.opacity }, createdAt: a.createdAt, updatedAt: a.updatedAt };
    if (a.type === "pen") return { ...base, type: a.type, points: a.points.map(p => ({ x: p.x, y: p.y })) };
    if (a.type === "comment") return { ...base, type: a.type, text: a.text };
    return { ...base, type: a.type };
  });
  return { schemaVersion: 1, documentId: data.documentId, pageCount: data.pageCount, annotations };
}
export function serializeAnnotations(pages: AnnotationsByPage, document: DocumentInfo): string {
  const result = JSON.stringify({ schemaVersion: 1, documentId: document.id, pageCount: document.pageCount,
    annotations: Object.values(pages).flat() });
  deserializeAnnotations(result, document);
  return result;
}
export function groupAnnotations(annotations: Annotation[]): AnnotationsByPage {
  const pages: AnnotationsByPage = {};
  for (const annotation of annotations) (pages[annotation.pageNumber] ??= []).push(annotation);
  return pages;
}
