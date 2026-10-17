import { describe, expect, it } from "vitest";
import { createAnnotation, transformAnnotation } from "../src/lib/osm/annotations/annotationFactory";
import { deserializeAnnotations, groupAnnotations, serializeAnnotations } from "../src/lib/osm/annotations/annotationSerializer";
import { historyReducer, initialHistory } from "../src/lib/osm/annotations/annotationHistory";
import type { AnnotationType } from "../src/types/osm/annotation";

const documentInfo = { id: "test-document-fingerprint", pageCount: 4 };
const make = (type: AnnotationType = "tick", page = 3) => createAnnotation(type, page,
  { x: 0.2, y: 0.3, width: 0.1, height: 0.15 }, undefined,
  { points: [{ x: 0.2, y: 0.3 }, { x: 0.3, y: 0.45 }], text: "Please explain this step." });
describe("application-owned annotation JSON", () => {
  it.each<AnnotationType>(["tick", "cross", "circle", "pen", "highlight", "comment"])("round trips %s", type => {
    const annotation = make(type), json = serializeAnnotations({ 3: [annotation] }, documentInfo);
    expect(deserializeAnnotations(json, documentInfo).annotations).toEqual([annotation]);
    expect(JSON.parse(json).schemaVersion).toBe(1);
  });
  it("keeps pages distinct", () => {
    const annotations = [make("tick", 3), make("cross", 4)];
    const pages = groupAnnotations(deserializeAnnotations(serializeAnnotations(groupAnnotations(annotations), documentInfo)).annotations);
    expect(pages[3]).toEqual([annotations[0]]); expect(pages[4]).toEqual([annotations[1]]);
  });
  it("rejects malformed JSON, versions and wrong documents", () => {
    expect(() => deserializeAnnotations("{")).toThrow("Invalid");
    expect(() => deserializeAnnotations('{"schemaVersion":2}')).toThrow("Unsupported");
    const json = serializeAnnotations({ 3: [make()] }, documentInfo);
    expect(() => deserializeAnnotations(json, { id: "other", pageCount: 4 })).toThrow("different PDF");
    expect(() => deserializeAnnotations(json, { id: documentInfo.id, pageCount: 5 })).toThrow("different PDF");
  });
  it.each([
    { bounds: undefined }, { bounds: { x: -0.1, y: 0, width: 0.1, height: 0.1 } },
    { bounds: { x: 0.9, y: 0.1, width: 0.2, height: 0.1 } }, { pageNumber: 5 },
    { style: { color: "url(evil)", strokeWidth: 0.002, opacity: 1 } }, { type: "unknown" },
    { createdAt: "bad date" }, { type: "pen", points: [{ x: 2, y: 0 }] }, { type: "comment", text: "" },
  ])("rejects invalid geometry and metadata %j", patch => {
    const data = { schemaVersion: 1, documentId: documentInfo.id, pageCount: 4, annotations: [{ ...make(), ...patch }] };
    expect(() => deserializeAnnotations(JSON.stringify(data))).toThrow();
  });
  it("rejects duplicate IDs", () => {
    const a = make(); expect(() => serializeAnnotations({ 3: [a, a] }, documentInfo)).toThrow("Duplicate");
  });
  it("drops unknown imported properties", () => {
    const a = { ...make(), draggable: true, onClick: "bad" };
    const restored = deserializeAnnotations(JSON.stringify({ schemaVersion: 1, documentId: documentInfo.id, pageCount: 4, annotations: [a] }));
    expect(restored.annotations[0]).not.toHaveProperty("draggable");
  });
});
describe("editing and logical history", () => {
  it("moves complete pen geometry and survives JSON reload", () => {
    const moved = transformAnnotation(make("pen"), { x: 0.4, y: 0.5, width: 0.2, height: 0.3 });
    expect(moved.type).toBe("pen");
    if (moved.type === "pen") {
      expect(moved.points[0]).toEqual({ x: 0.4, y: 0.5 });
      expect(moved.points[1].x).toBeCloseTo(0.6); expect(moved.points[1].y).toBeCloseTo(0.8);
    }
    expect(deserializeAnnotations(serializeAnnotations({ 3: [moved] }, documentInfo)).annotations[0]).toEqual(moved);
  });
  it("undoes and redoes add, move, delete, clear and load", () => {
    const a = make(), b = make("cross", 4);
    let state = historyReducer(initialHistory, { type: "ADD_ANNOTATION", annotation: a });
    state = historyReducer(state, { type: "ADD_ANNOTATION", annotation: b });
    const untouched = state.present[4];
    const moved = transformAnnotation(a, { ...a.bounds, x: 0.4 });
    state = historyReducer(state, { type: "UPDATE_ANNOTATION", annotation: moved });
    expect(state.present[4]).toBe(untouched);
    state = historyReducer(state, { type: "DELETE_ANNOTATION", pageNumber: 3, id: a.id });
    expect(state.present[3]).toEqual([]);
    state = historyReducer(state, { type: "UNDO" }); expect(state.present[3]).toEqual([moved]);
    state = historyReducer(state, { type: "REDO" }); expect(state.present[3]).toEqual([]);
    state = historyReducer(state, { type: "REPLACE", pages: {} });
    state = historyReducer(state, { type: "UNDO" }); expect(state.present[4]).toEqual([b]);
    state = historyReducer(state, { type: "ADD_ANNOTATION", annotation: make("circle") });
    expect(state.future).toEqual([]);
  });
  it("has safe empty undo/redo", () => {
    expect(historyReducer(initialHistory, { type: "UNDO" })).toBe(initialHistory);
    expect(historyReducer(initialHistory, { type: "REDO" })).toBe(initialHistory);
  });
});
