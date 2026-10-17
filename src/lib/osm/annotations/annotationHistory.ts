import type { Annotation, AnnotationsByPage } from "../../../types/osm/annotation";
export type History = { past: AnnotationsByPage[]; present: AnnotationsByPage; future: AnnotationsByPage[] };
export type HistoryAction =
  | { type: "ADD_ANNOTATION" | "UPDATE_ANNOTATION"; annotation: Annotation }
  | { type: "DELETE_ANNOTATION"; pageNumber: number; id: string }
  | { type: "REPLACE"; pages: AnnotationsByPage }
  | { type: "UNDO" | "REDO" };
export const initialHistory: History = { past: [], present: {}, future: [] };
export function historyReducer(state: History, action: HistoryAction): History {
  if (action.type === "UNDO") {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future] };
  }
  if (action.type === "REDO") {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) };
  }
  let present: AnnotationsByPage;
  if (action.type === "REPLACE") present = action.pages;
  else if (action.type === "DELETE_ANNOTATION") {
    const before = state.present[action.pageNumber] ?? [];
    const after = before.filter(a => a.id !== action.id);
    if (after.length === before.length) return state;
    present = { ...state.present, [action.pageNumber]: after };
  } else {
    const { annotation } = action;
    const before = state.present[annotation.pageNumber] ?? [];
    if (action.type === "UPDATE_ANNOTATION" && !before.some(a => a.id === annotation.id)) return state;
    present = { ...state.present, [annotation.pageNumber]: action.type === "ADD_ANNOTATION"
      ? [...before, annotation] : before.map(a => a.id === annotation.id ? annotation : a) };
  }
  return { past: [...state.past.slice(-99), state.present], present, future: [] };
}
