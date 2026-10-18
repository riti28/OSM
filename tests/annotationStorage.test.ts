import { describe, expect, it } from "vitest";
import { createAnnotation } from "../src/lib/osm/annotations/annotationFactory";
import { serializeAnnotations } from "../src/lib/osm/annotations/annotationSerializer";
import { readSavedAnnotations, saveAnnotations } from "../src/lib/osm/annotations/annotationStorage";

const first = { id: "first-pdf", pageCount: 2 }, second = { id: "second-pdf", pageCount: 3 };
function storage() {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
const marks = { 1: [createAnnotation("tick", 1, { x: 0.2, y: 0.3, width: 0.05, height: 0.05 })] };

describe("saved annotations for multiple PDFs", () => {
  it("keeps the first PDF's marks after saving a different PDF", () => {
    const store = storage(), firstJson = serializeAnnotations(marks, first), secondJson = serializeAnnotations({}, second);
    saveAnnotations(store, first, firstJson); saveAnnotations(store, second, secondJson);
    expect(readSavedAnnotations(store, first)).toBe(firstJson);
    expect(readSavedAnnotations(store, second)).toBe(secondJson);
  });
  it("never saves another PDF's annotations into the requested slot", () => {
    const store = storage(), json = serializeAnnotations(marks, first);
    expect(() => saveAnnotations(store, second, json)).toThrow(/different PDF/);
    expect(store.values.size).toBe(0);
  });
  it("preserves a matching older save without loading it for a different PDF", () => {
    const store = storage(), json = serializeAnnotations(marks, first);
    store.setItem("breathe4school-osm-demo-annotations", json);
    expect(readSavedAnnotations(store, first)).toBe(json);
    expect(readSavedAnnotations(store, second)).toBeNull();
    expect(store.getItem("breathe4school-osm-demo-annotations")).toBe(json);
  });
  it("prefers the document's current save over the old shared slot", () => {
    const store = storage(), empty = serializeAnnotations({}, first);
    store.setItem("breathe4school-osm-demo-annotations", serializeAnnotations(marks, first));
    saveAnnotations(store, first, empty);
    expect(readSavedAnnotations(store, first)).toBe(empty);
  });
  it("reports corrupted saved JSON without overwriting it", () => {
    const store = storage(); store.setItem("breathe4school-osm-annotations:first-pdf", "invalid");
    expect(() => readSavedAnnotations(store, first)).toThrow(/Invalid annotation JSON/);
    expect(store.getItem("breathe4school-osm-annotations:first-pdf")).toBe("invalid");
  });
  it("reports storage failures so the UI cannot claim a successful save", () => {
    const store = { getItem: () => null, setItem: () => { throw new Error("Storage full"); } };
    expect(() => saveAnnotations(store, first, serializeAnnotations(marks, first))).toThrow("Storage full");
  });
});
