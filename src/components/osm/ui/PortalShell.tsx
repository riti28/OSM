"use client";

import { useRef } from "react";
import Icon from "./Icon";
function BrandMark() {
  return <svg viewBox="0 0 42 42" width="40" height="40" aria-hidden="true">
    <path d="M20 32C19 22 23 13 33 9M18 26C15 18 10 16 6 15" fill="none" stroke="#00bd83" strokeWidth="3" strokeLinecap="round"/>
    <path d="M4 5C14 3 21 8 19 18 8 19 3 14 4 5Z" fill="#0587f7"/>
    <path d="M39 5C28 3 21 8 23 18 33 19 39 13 39 5Z" fill="#00bd83"/>
    <path d="M18 38C12 30 16 22 25 22 31 29 26 38 18 38Z" fill="#00bd83"/>
  </svg>;
}
export default function PortalShell({ children, onOpen }: { children: React.ReactNode; onOpen: () => void }) {
  const help = useRef<HTMLDialogElement>(null);
  return <main className="workspace">
    <aside className="portal-sidebar" aria-label="Workspace navigation">
      <a className="brand" href="/osm/annotations/" aria-label="Breathe4School annotation workspace"><BrandMark />
        <span><strong>Breathe4School</strong><small>Unified AI-Powered Education Ecosystem</small></span></a>
      <nav><div className="nav-group"><h2>WORKSPACE</h2>
        <button className="portal-nav-item sidebar-action" onClick={onOpen}><Icon name="folder"/>Open PDF</button>
        <a className="portal-nav-item active" href="/osm/annotations/" aria-current="page"><Icon name="pen"/>Annotation Tools</a>
        <button className="portal-nav-item sidebar-action" onClick={() => help.current?.showModal()}><Icon name="help"/>Help & Shortcuts</button>
      </div></nav>
      <div className="sidebar-bottom"><div className="sidebar-promo"><Icon name="workspace" size={25}/><strong>Your document workspace</strong><small>Your PDFs stay on this device.</small>
        <svg viewBox="0 0 170 82" aria-hidden="true"><defs><linearGradient id="monitor" x2="1" y2="1"><stop stopColor="#c8eeff"/><stop offset="1" stopColor="#2075d7"/></linearGradient></defs>
          <rect x="97" y="9" width="50" height="37" rx="4" fill="#0054ae" opacity=".5"/><rect x="53" y="18" width="65" height="46" rx="4" fill="url(#monitor)"/><rect x="59" y="23" width="53" height="34" rx="2" fill="#eaf7ff"/><path d="M80 64v7h16v-7M70 74h35" stroke="#70c7ff" strokeWidth="4"/><rect x="49" y="36" width="16" height="27" rx="2" fill="#4b9be8"/><path d="M73 31h15M73 36h21M73 41h10M91 44h14v9H91z" stroke="#3c8bce" strokeWidth="3"/><circle cx="131" cy="54" r="13" fill="#00be83"/><path d="m125 54 4 4 8-9" fill="none" stroke="white" strokeWidth="3"/></svg>
      </div><p>Breathe4School v1.0</p><p>© 2026 XploreSense Pvt. Ltd.</p></div>
    </aside>
    <section className="portal-main">
      <header className="portal-header"><strong>OSM - Annotation Workspace</strong>
        <div className="portal-header-actions"><button className="icon-button" aria-label="Open PDF" title="Open a local PDF" onClick={onOpen}><Icon name="folder"/></button>
          <span className="device-label">Files stay on this device</span></div>
      </header>
      <div className="portal-content">{children}</div>
    </section>
    <dialog ref={help} className="comment-dialog" aria-labelledby="workspace-help-title">
      <h2 id="workspace-help-title">Using your workspace</h2>
      <p>Open a PDF from your device, then choose a tool and mark the page. Select a mark to move, resize, or delete it.</p>
      <p><strong>Save annotations</strong> keeps this document’s marks in this browser. Your last PDF reopens here automatically. Each PDF has its own saved annotations.</p>
      <p>Use <strong>More → Export JSON</strong> to keep a backup or move annotations to another browser with Import JSON. Your original PDF is unchanged.</p>
      <p><strong>Shortcuts:</strong> P pen · H highlighter · E eraser · T text · V select · Z/X zoom · Ctrl/⌘ Z undo · Ctrl/⌘ Shift Z redo · Delete removes the selected mark.</p>
      <p><strong>More → Close PDF</strong> removes the remembered PDF from this device. Saved annotations remain available when you reopen the matching PDF.</p>
      <form method="dialog" className="dialog-actions"><button className="primary">Got it</button></form>
    </dialog>
  </main>;
}
