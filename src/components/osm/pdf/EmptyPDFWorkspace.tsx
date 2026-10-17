import type { Tool } from "@/types/osm/annotation";
import { DEFAULT_STYLES } from "@/lib/osm/annotations/annotationFactory";
import AnnotationToolbar from "../annotations/AnnotationToolbar";
import Icon from "../ui/Icon";
import PortalShell from "../ui/PortalShell";
import WorkspaceHeading from "../ui/WorkspaceHeading";
import PDFToolbar from "./PDFToolbar";

const noop = () => {};
export default function EmptyPDFWorkspace({ name, error, onOpen, retry }: { name: string; error?: string; onOpen: () => void; retry: () => void }) {
  const tool: Tool = "pen";
  return <PortalShell onOpen={onOpen}><WorkspaceHeading name={name}/><div className="workspace-body">
    <div className="viewer-column"><fieldset disabled className="tool-fieldset"><PDFToolbar tool={tool} onTool={noop} scale={1} zoom={{ mode: "custom", scale: 1 }} onZoom={noop}
      canUndo={false} canRedo={false} onUndo={noop} onRedo={noop}/></fieldset>
      <div className="document-body"><aside className="thumbnail-sidebar empty-thumbnails" aria-label="Page thumbnails"><div className="thumbnail-heading"><h2>Pages (0)</h2></div><p>Open a PDF to view pages.</p></aside>
        <div className="empty-workspace"><div className="empty-icon"><Icon name="book" size={46}/></div><h2>{error ? "Open your answer script" : "Opening your document…"}</h2>
          <p role={error ? "alert" : "status"}>{error || "Loading PDF pages and preparing your tools."}</p>
          {error && <><div className="empty-actions"><button className="primary" onClick={onOpen}><Icon name="folder" size={18}/>Open a PDF</button><button onClick={retry}>Retry sample</button></div>
            <small>Choose an anonymized PDF. Local files stay in your browser.</small></>}
        </div></div>
    </div><fieldset disabled className="tool-fieldset empty-inspector"><AnnotationToolbar tool={tool} onTool={noop} style={DEFAULT_STYLES.pen} onStyle={noop}
      textStyle={DEFAULT_STYLES.text} onTextStyle={noop} options={{ commentText: "", stampText: "1", stampVariant: "circle" }}
      onOptions={noop} onQuickComment={noop} canDelete={false} onDelete={noop}/></fieldset>
    </div><footer className="workspace-footer"><span>Open a PDF to start annotating.</span></footer></PortalShell>;
}
