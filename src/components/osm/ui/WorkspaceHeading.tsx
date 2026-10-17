import Icon from "./Icon";

export default function WorkspaceHeading({ name, page = 1, count = 0, navigate, documentId }: {
  name: string; page?: number; count?: number; navigate?: (page: number) => void; documentId?: string;
}) {
  return <header className="workspace-heading">
    <div className="workspace-title"><h1>Annotation Tools</h1><p>Mark, annotate and provide feedback on the answer script</p>
      <div className="document-meta"><span title={name}>{name}</span><span>PDF Document</span><span>{count ? count + " pages" : "No document loaded"}</span>
        {documentId && <strong title={documentId}>Document ID: {documentId.slice(0, 8).toUpperCase()}</strong>}</div>
    </div>
    {navigate && <div className="page-navigation"><button aria-label="Previous page" title="Previous page" disabled={page <= 1} onClick={() => navigate(page - 1)}><Icon name="left" size={17}/>Previous</button>
      <label>Page <input key={page} aria-label="Page number" type="number" min={1} max={count} defaultValue={page}
        onBlur={e => { const next = Number(e.target.value); if (Number.isInteger(next) && next >= 1 && next <= count) navigate(next); else e.target.value = String(page); }}
        onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}/> of {count}</label>
      <button aria-label="Next page" title="Next page" disabled={page >= count} onClick={() => navigate(page + 1)}>Next<Icon name="right" size={17}/></button></div>}
  </header>;
}
