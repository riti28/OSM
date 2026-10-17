import type { Point, Rect } from "../../../types/osm/annotation";

export type Size = { width: number; height: number };
export type Rotation = 0 | 90 | 180 | 270;
export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
function assertSize(size: Size) {
  if (!Number.isFinite(size.width) || !Number.isFinite(size.height) || size.width <= 0 || size.height <= 0)
    throw new Error("Page dimensions must be positive finite numbers.");
}
export function normalizePoint(point: Point, size: Size): Point {
  assertSize(size);
  return { x: clamp(point.x / size.width), y: clamp(point.y / size.height) };
}
export function denormalizePoint(point: Point, size: Size): Point {
  assertSize(size);
  return { x: point.x * size.width, y: point.y * size.height };
}
export function normalizeRect(rect: Rect, size: Size): Rect {
  const start = normalizePoint({ x: Math.min(rect.x, rect.x + rect.width), y: Math.min(rect.y, rect.y + rect.height) }, size);
  const end = normalizePoint({ x: Math.max(rect.x, rect.x + rect.width), y: Math.max(rect.y, rect.y + rect.height) }, size);
  return { ...start, width: end.x - start.x, height: end.y - start.y };
}
export function denormalizeRect(rect: Rect, size: Size): Rect {
  return { ...denormalizePoint(rect, size), width: rect.width * size.width, height: rect.height * size.height };
}
export const normalizePoints = (points: Point[], size: Size) => points.map(point => normalizePoint(point, size));
export const denormalizePoints = (points: Point[], size: Size) => points.map(point => denormalizePoint(point, size));
export function rotatePoint(point: Point, rotation: Rotation): Point {
  switch (rotation) {
    case 90: return { x: 1 - point.y, y: point.x };
    case 180: return { x: 1 - point.x, y: 1 - point.y };
    case 270: return { x: point.y, y: 1 - point.x };
    default: return { ...point };
  }
}
export function pageToScreen(point: Point, size: Size, rotation: Rotation = 0): Point {
  return denormalizePoint(rotatePoint(point, rotation), size);
}
export function screenToPage(point: Point, size: Size, rotation: Rotation = 0): Point {
  return rotatePoint(normalizePoint(point, size), ((360 - rotation) % 360) as Rotation);
}
export function boundsOfPoints(points: Point[]): Rect {
  if (!points.length) throw new Error("A stroke needs points.");
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}
export function fitRect(rect: Rect): Rect {
  const width = clamp(rect.width), height = clamp(rect.height);
  return { x: clamp(rect.x, 0, 1 - width), y: clamp(rect.y, 0, 1 - height), width, height };
}
