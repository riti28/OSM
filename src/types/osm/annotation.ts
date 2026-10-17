export type Point = { x: number; y: number };
export type Rect = Point & { width: number; height: number };
export type AnnotationType = "tick" | "cross" | "circle" | "pen" | "highlight" | "comment" | "rectangle" | "arrow" | "line" | "text" | "stamp";
export type Tool = "select" | "pan" | "erase" | AnnotationType;
export type AnnotationStyle = { color: string; strokeWidth: number; opacity: number; fontSize?: number; bold?: boolean; italic?: boolean; underline?: boolean };
type Base = {
  id: string;
  pageNumber: number;
  bounds: Rect;
  style: AnnotationStyle;
  createdAt: string;
  updatedAt: string;
};
export type Annotation =
  | (Base & { type: "tick" | "cross" | "circle" | "highlight" | "rectangle" })
  | (Base & { type: "pen" | "line" | "arrow"; points: Point[] })
  | (Base & { type: "comment" | "text"; text: string })
  | (Base & { type: "stamp"; variant: "circle" | "star"; text: string });
export type AnnotationsByPage = Record<number, Annotation[]>;
export type AnnotationFile = {
  schemaVersion: 1;
  documentId: string;
  pageCount: number;
  annotations: Annotation[];
};
export type DocumentInfo = { id: string; pageCount: number };
export type ToolOptions = { commentText: string; stampVariant: "circle" | "star"; stampText: string };
