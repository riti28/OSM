import type { DocumentInfo } from "@/types/osm/annotation";
import { deserializeAnnotations } from "./annotationSerializer";

const PREFIX = "breathe4school-osm-annotations:";
const LEGACY_KEY = "breathe4school-osm-demo-annotations";
type BrowserStorage = Pick<Storage, "getItem" | "setItem">;

export function readSavedAnnotations(storage: BrowserStorage, document: DocumentInfo): string | null {
  const saved = storage.getItem(PREFIX + encodeURIComponent(document.id));
  if (saved !== null) { deserializeAnnotations(saved, document); return saved; }
  const legacy = storage.getItem(LEGACY_KEY);
  if (legacy === null) return null;
  try { deserializeAnnotations(legacy, document); return legacy; }
  catch { return null; }
}

export function saveAnnotations(storage: BrowserStorage, document: DocumentInfo, json: string) {
  deserializeAnnotations(json, document);
  storage.setItem(PREFIX + encodeURIComponent(document.id), json);
}
