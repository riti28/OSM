import { describe, expect, it } from "vitest";
import { denormalizePoint, denormalizePoints, denormalizeRect, normalizePoint, normalizePoints, normalizeRect, pageToScreen, screenToPage, type Rotation } from "../src/lib/osm/coordinates";

describe("page coordinates", () => {
  it("keeps a location stable across zoom and viewport resize", () => {
    const point = normalizePoint({ x: 500, y: 700 }, { width: 1000, height: 1400 });
    expect(point).toEqual({ x: 0.5, y: 0.5 });
    expect(denormalizePoint(point, { width: 1500, height: 2100 })).toEqual({ x: 750, y: 1050 });
    expect(denormalizePoint(point, { width: 750, height: 1050 })).toEqual({ x: 375, y: 525 });
  });
  it("normalizes backwards rectangles and clips boundaries", () => {
    const rect = normalizeRect({ x: 800, y: 900, width: -600, height: -600 }, { width: 1000, height: 1500 });
    expect(rect.x).toBeCloseTo(0.2); expect(rect.y).toBeCloseTo(0.2);
    expect(rect.width).toBeCloseTo(0.6); expect(rect.height).toBeCloseTo(0.4);
    expect(denormalizeRect(rect, { width: 2000, height: 3000 }).width).toBeCloseTo(1200);
    expect(normalizePoint({ x: -40, y: 1600 }, { width: 1000, height: 1500 })).toEqual({ x: 0, y: 1 });
    const clipped = normalizeRect({ x: 900, y: 900, width: 200, height: 200 }, { width: 1000, height: 1000 });
    expect(clipped.x + clipped.width).toBeCloseTo(1); expect(clipped.y + clipped.height).toBeCloseTo(1);
  });
  it("preserves freehand points independently of device pixel ratio", () => {
    const points = normalizePoints([{ x: 100, y: 140 }, { x: 230, y: 310 }], { width: 1000, height: 1400 });
    const rendered = denormalizePoints(points, { width: 1500, height: 2100 });
    expect(rendered[0]).toEqual({ x: 150, y: 210 });
    expect(rendered[1].x).toBeCloseTo(345); expect(rendered[1].y).toBeCloseTo(465);
  });
  it.each<Rotation>([0, 90, 180, 270])("round trips rotation %s", rotation => {
    const point = { x: 0.23, y: 0.67 }, size = { width: 1400, height: 1000 };
    const restored = screenToPage(pageToScreen(point, size, rotation), size, rotation);
    expect(restored.x).toBeCloseTo(point.x); expect(restored.y).toBeCloseTo(point.y);
  });
  it("rejects unusable dimensions", () => {
    for (const width of [0, -1, Infinity, NaN]) expect(() => normalizePoint({ x: 5, y: 2 }, { width, height: 1400 })).toThrow();
  });
});
