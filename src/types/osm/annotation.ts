export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };
export type AnnotationType = "tick" | "cross" | "circle" | "pen" | "highlight" | "comment";
export type Tool = "select" | AnnotationType;
export type AnnotationStyle = { color: string; strokeWidth: number; opacity: number };
type Base = {
  id: string;
  pageNumber: number;
  bounds: Rect;
  style: AnnotationStyle;
  createdAt: string;
  updatedAt: string;
};
export type Annotation =
  | (Base & { type: "tick" | "cross" | "circle" | "highlight" })
  | (Base & { type: "pen"; points: Point[] })
  | (Base & { type: "comment"; text: string });
export type AnnotationsByPage = Record<number, Annotation[]>;
export type AnnotationFile = {
  schemaVersion: 1;
  documentId: string;
  pageCount: number;
  annotations: Annotation[];
};
export type DocumentInfo = { id: string; pageCount: number };
