"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { usePDFDocument } from "@/hooks/osm/usePDFDocument";
import type { Annotation, AnnotationsByPage, Tool, ToolOptions } from "@/types/osm/annotation";
import type { PageInfo, Zoom } from "@/types/osm/pdf";
import { DEFAULT_STYLES } from "@/lib/osm/annotations/annotationFactory";
import { historyReducer, initialHistory } from "@/lib/osm/annotations/annotationHistory";
import { deserializeAnnotations, groupAnnotations, serializeAnnotations } from "@/lib/osm/annotations/annotationSerializer";
import AnnotationToolbar from "../annotations/AnnotationToolbar";
import PDFPage from "./PDFPage";
import PDFToolbar from "./PDFToolbar";
import PDFThumbnailSidebar from "./PDFThumbnailSidebar";
import PortalShell from "../ui/PortalShell";
import WorkspaceHeading from "../ui/WorkspaceHeading";
import Icon from "../ui/Icon";
import EmptyPDFWorkspace from "./EmptyPDFWorkspace";

const STORAGE_KEY = "breathe4school-osm-demo-annotations";
const EMPTY: Annotation[] = [];
type Notice = { message: string; error?: boolean };
function CommentEditor({ annotation, onSave, onCancel }: { annotation: Annotation & { type: "comment" | "text" }; onSave: (text: string) => void; onCancel: () => void }) {
  const [text, setText] = useState(annotation.text);
  const dialog = useRef<HTMLDialogElement>(null), input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { dialog.current?.showModal(); input.current?.focus(); }, []);
  return <dialog ref={dialog} className="comment-dialog" onCancel={onCancel} aria-labelledby="comment-title">
    <form onSubmit={event => { event.preventDefault(); if (text.trim()) onSave(text.trim()); }}>
      <span className="eyebrow">PAGE {annotation.pageNumber}</span><h2 id="comment-title">{annotation.type === "text" ? "Text annotation" : "Your comment"}</h2>
      <label htmlFor="comment-text">{annotation.type === "text" ? "Text to place on this page" : "Add a note to this page"}</label>
      <textarea ref={input} id="comment-text" maxLength={5000} rows={5} value={text} onChange={e => setText(e.target.value)} />
      <div className="dialog-actions"><button type="button" onClick={onCancel}>Cancel</button><button className="primary" disabled={!text.trim()} type="submit">{annotation.type === "text" ? "Save text" : "Save comment"}</button></div>
    </form>
  </dialog>;
}
function Workspace({ document, documentId, pages, name, onOpen, retry, dirtyRef }: {
  document: PDFDocumentProxy; documentId: string; pages: PageInfo[]; name: string; onOpen: () => void; retry: () => void; dirtyRef: React.RefObject<boolean>;
}) {
  const [history, dispatch] = useReducer(historyReducer, initialHistory);
  const annotations = history.present;
  const [tool, setTool] = useState<Tool>("pen");
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const styleTool = tool === "select" || tool === "pan" || tool === "erase" ? "pen" : tool;
  const style = styles[styleTool];
  const [options, setOptions] = useState<ToolOptions>({ commentText: "", stampVariant: "circle", stampText: "1" });
  const pan = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState<Annotation | null>(null);
  const [current, setCurrent] = useState(1);
  const [zoom, setZoom] = useState<Zoom>({ mode: "width" });
  const [container, setContainer] = useState({ width: 800, height: 900 });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [savedJson, setSavedJson] = useState<string | null>(null);
  const viewer = useRef<HTMLDivElement>(null), jsonInput = useRef<HTMLInputElement>(null);
  const documentInfo = useMemo(() => ({ id: documentId, pageCount: document.numPages }), [document, documentId]);
  const json = useMemo(() => serializeAnnotations(annotations, documentInfo), [annotations, documentInfo]);
  const total = Object.values(annotations).reduce((sum, page) => sum + page.length, 0);
  const dirty = savedJson !== json;
  const hasChanges = dirty && (total > 0 || savedJson !== null);
  const selected = Object.values(annotations).flat().find(a => a.id === selectedId);
  const natural = useMemo(() => ({ width: Math.max(...pages.map(page => page.width)), height: Math.max(...pages.map(page => page.height)) }), [pages]);
  const scale = zoom.mode === "custom" ? zoom.scale : Math.max(0.1, zoom.mode === "width"
    ? (container.width - 24) / natural.width
    : Math.min((container.width - 24) / natural.width, (container.height - 40) / natural.height));

  useEffect(() => {
    dirtyRef.current = hasChanges;
    const beforeUnload = (event: BeforeUnloadEvent) => { if (hasChanges) event.preventDefault(); };
    window.addEventListener("beforeunload", beforeUnload);
    return () => { window.removeEventListener("beforeunload", beforeUnload); dirtyRef.current = false; };
  }, [hasChanges, dirtyRef]);
  useEffect(() => {
    const node = viewer.current;
    if (!node) return;
    const observer = new ResizeObserver(entries => { const rect = entries[0].contentRect; setContainer({ width: rect.width, height: rect.height }); });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const onAdd = useCallback((annotation: Annotation) => { dispatch({ type: "ADD_ANNOTATION", annotation }); }, []);
  const onUpdate = useCallback((annotation: Annotation) => { dispatch({ type: "UPDATE_ANNOTATION", annotation }); }, []);
  const onComment = useCallback((annotation: Annotation) => setComment(annotation), []);
  const chooseTool = useCallback((value: Tool) => { setTool(value); setSelectedId(null); }, []);
  const quickComment = useCallback((text: string) => { setOptions(previous => ({ ...previous, commentText: text })); setTool("comment"); setSelectedId(null); }, []);
  const onErase = useCallback((annotation: Annotation) => { dispatch({ type: "DELETE_ANNOTATION", pageNumber: annotation.pageNumber, id: annotation.id }); setSelectedId(null); }, []);
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);
  const remove = useCallback(() => {
    if (selected) { dispatch({ type: "DELETE_ANNOTATION", pageNumber: selected.pageNumber, id: selected.id }); setSelectedId(null); }
  }, [selected]);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const target = event.target;
      if (comment || target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
      else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); }
      else if (event.key === "Delete" || event.key === "Backspace") { if (selected) { event.preventDefault(); remove(); } }
      else if (event.key === "Escape") setSelectedId(null);
      else if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        const key = event.key.toLowerCase();
        if (key === "p") chooseTool("pen"); else if (key === "h") chooseTool("highlight"); else if (key === "e") chooseTool("erase"); else if (key === "t") chooseTool("text");
        else if (key === "v") chooseTool("select"); else if (key === "z") setZoom({ mode: "custom", scale: Math.min(2, scale + 0.25) }); else if (key === "x") setZoom({ mode: "custom", scale: Math.max(0.5, scale - 0.25) });
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [comment, selected, remove, undo, redo, chooseTool, scale]);
  const navigate = useCallback((number: number) => {
    if (number < 1 || number > pages.length) return;
    setCurrent(number);
    const element = viewer.current?.querySelector<HTMLElement>('[data-page="' + number + '"]');
    if (element && viewer.current) viewer.current.scrollTo({ top: element.offsetTop - 12, behavior: "instant" });
  }, [pages.length]);
  const scrollFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(scrollFrame.current), []);
  function trackPage() {
    cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      const node = viewer.current;
      if (!node) return;
      const center = node.getBoundingClientRect().top + Math.min(node.clientHeight * 0.35, 250);
      let closest = 1, distance = Infinity;
      node.querySelectorAll<HTMLElement>("[data-page]").forEach(page => {
        const box = page.getBoundingClientRect();
        const d = center >= box.top && center <= box.bottom ? 0 : Math.min(Math.abs(center - box.top), Math.abs(center - box.bottom));
        if (d < distance) { distance = d; closest = Number(page.dataset.page); }
      });
      setCurrent(closest);
    });
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, json); setSavedJson(json); setNotice({ message: "Annotations saved in this browser." }); }
    catch { setNotice({ error: true, message: "Save failed. Browser storage may be full or unavailable. Export JSON to keep a copy." }); }
  }
  function restore(text: string, persisted: boolean) {
    try {
      const data = deserializeAnnotations(text, documentInfo), pages: AnnotationsByPage = groupAnnotations(data.annotations);
      if (hasChanges && !window.confirm("Replace the current unsaved annotations?")) return;
      dispatch({ type: "REPLACE", pages }); setSelectedId(null);
      setSavedJson(persisted ? serializeAnnotations(pages, documentInfo) : null);
      setNotice({ message: persisted ? "Saved annotations loaded." : "JSON imported. Save to keep it in this browser." });
    } catch (cause) { setNotice({ error: true, message: cause instanceof Error ? cause.message : "Could not load annotations." }); }
  }
  function load() {
    try { const value = localStorage.getItem(STORAGE_KEY); if (value) restore(value, true); else setNotice({ message: "No saved annotations in this browser yet." }); }
    catch { setNotice({ error: true, message: "Browser storage is unavailable. Import a JSON backup instead." }); }
  }
  function exportJson() {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const anchor = window.document.createElement("a"); anchor.href = url; anchor.download = "osm-annotations-" + documentInfo.id + ".json"; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice({ message: "JSON exported. Browser save status is unchanged." });
  }
  return <PortalShell onOpen={onOpen}>
    <WorkspaceHeading name={name} page={current} count={pages.length} navigate={navigate} documentId={documentId}/>
    {notice && <div className={"notice " + (notice.error ? "error" : "")} role={notice.error ? "alert" : "status"}>{notice.message}<button title="Dismiss message" aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button></div>}
    <div className="workspace-body">
      <div className="viewer-column">
        <PDFToolbar scale={scale} zoom={zoom} onZoom={value => { setZoom(value); setSelectedId(null); }} tool={tool} onTool={chooseTool}
          canUndo={!!history.past.length} canRedo={!!history.future.length} onUndo={undo} onRedo={redo}/>
        <div className="document-body"><PDFThumbnailSidebar document={document} pages={pages} current={current} navigate={navigate} />
          <div className={"pdf-scroll " + (tool === "pan" ? "is-panning" : "")} ref={viewer} data-pdf-scroll-root="" onScroll={trackPage} aria-label="PDF document pages" tabIndex={0}
            onPointerDown={event => { if (tool !== "pan" || event.button !== 0) return; event.preventDefault(); const node = event.currentTarget;
              pan.current = { x: event.clientX, y: event.clientY, left: node.scrollLeft, top: node.scrollTop }; node.setPointerCapture(event.pointerId); }}
            onPointerMove={event => { if (!pan.current || tool !== "pan") return; const node = event.currentTarget;
              node.scrollLeft = pan.current.left - event.clientX + pan.current.x; node.scrollTop = pan.current.top - event.clientY + pan.current.y; }}
            onPointerUp={event => { pan.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onPointerCancel={() => { pan.current = null; }}>
            <div className="page-stack">{pages.map(page => <PDFPage key={page.pageNumber} document={document} page={page} scale={scale}
              annotations={annotations[page.pageNumber] ?? EMPTY} tool={tool} style={style} options={options} onErase={onErase}
              selectedId={selected?.pageNumber === page.pageNumber ? selectedId : null}
              onSelect={setSelectedId} onAdd={onAdd} onUpdate={onUpdate} onComment={onComment} />)}</div>
          </div>
        </div>
      </div>
      <AnnotationToolbar tool={tool} onTool={chooseTool} style={selected?.style ?? style}
        onStyle={value => { if (selected) onUpdate({ ...selected, style: value, updatedAt: new Date().toISOString() }); else setStyles(previous => ({ ...previous, [styleTool]: value })); }}
        textStyle={selected?.type === "text" ? selected.style : styles.text} onTextStyle={value => {
          if (selected?.type === "text") onUpdate({ ...selected, style: value, updatedAt: new Date().toISOString() });
          else setStyles(previous => ({ ...previous, text: value }));
        }}
        options={options} onOptions={setOptions} onQuickComment={quickComment}
        canDelete={!!selected} onDelete={remove}/>
    </div>
    <footer className="workspace-footer"><span className="annotation-status">{total} annotations <span>·</span> Page {current} of {pages.length}</span>
      <span className={"save-state " + (dirty ? "unsaved" : "saved")}>{dirty ? "Unsaved" : "Saved"}</span>
      <div className="footer-actions"><button title="Load saved annotations from this browser" onClick={load}>Load annotations</button>
        <details className="document-menu"><summary title="Document actions">More<Icon name="chevron" size={14}/></summary><div>
          <button onClick={onOpen}><Icon name="folder" size={16}/>Open PDF</button>
          <button title="Download annotation JSON" onClick={exportJson}><Icon name="download" size={16}/>Export JSON</button>
          <button title="Import annotation JSON" onClick={() => jsonInput.current?.click()}><Icon name="book" size={16}/>Import JSON</button>
          <button disabled={!total} onClick={() => { if (window.confirm("Clear all annotations? You can undo this action.")) { dispatch({ type: "REPLACE", pages: {} }); setSelectedId(null); } }}>Clear annotations</button>
          <button onClick={() => { if (!hasChanges || window.confirm("Reload the PDF and discard unsaved changes?")) retry(); }}>Reload PDF</button>
        </div></details>
        <button className="primary" title="Save annotations in this browser" onClick={save}><Icon name="save" size={16}/>Save annotations</button></div>
    </footer>
    <input ref={jsonInput} className="visually-hidden" type="file" accept=".json,application/json" aria-label="Import annotation JSON file"
      onChange={async e => { const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
        if (file.size > 20_000_000) { setNotice({ error: true, message: "Annotation file exceeds the 20 MB limit." }); return; }
        try { restore(await file.text(), false); } catch { setNotice({ error: true, message: "Unable to read this JSON file." }); } }} />
    {(comment?.type === "comment" || comment?.type === "text") && <CommentEditor annotation={comment} onCancel={() => setComment(null)} onSave={text => {
      const updated = { ...comment, text, updatedAt: new Date().toISOString() };
      if ((annotations[comment.pageNumber] ?? []).some(a => a.id === comment.id)) onUpdate(updated); else onAdd(updated);
      setComment(null);
    }} />}
  </PortalShell>;
}

export default function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
  const [local, setLocal] = useState<{ url: string; name: string } | null>(null);
  const input = useRef<HTMLInputElement>(null), dirty = useRef(false);
  const url = local?.url ?? pdfUrl;
  const { document, documentId, pages, error, retry } = usePDFDocument(url);
  const name = local?.name ?? pdfUrl.split("/").pop()?.split("?")[0] ?? "Answer book.pdf";
  const revokeTimers = useRef(new Map<string, number>());
  useEffect(() => {
    if (!local) return;
    const timers = revokeTimers.current, url = local.url;
    const pending = timers.get(url);
    if (pending !== undefined) { window.clearTimeout(pending); timers.delete(url); }
    // Fast Refresh reattaches the same URL; a real unmount still releases it.
    return () => { timers.set(url, window.setTimeout(() => { URL.revokeObjectURL(url); timers.delete(url); }, 0)); };
  }, [local]);
  const open = useCallback(() => input.current?.click(), []);
  return <>
    <input ref={input} className="visually-hidden" type="file" accept=".pdf,application/pdf" aria-label="Open local PDF file"
      onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
        if (dirty.current && !window.confirm("Open another PDF and discard unsaved annotations?")) return;
        setLocal({ url: URL.createObjectURL(file), name: file.name }); }} />
    {document && documentId && pages ? <Workspace key={documentId} document={document} documentId={documentId} pages={pages} name={name} onOpen={open} retry={retry} dirtyRef={dirty} /> :
      <EmptyPDFWorkspace name={name} error={error} onOpen={open} retry={retry}/>}
  </>;
}
