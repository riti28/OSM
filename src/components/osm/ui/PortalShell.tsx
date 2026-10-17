import Icon, { type IconName } from "./Icon";

const groups: { title?: string; links: { label: string; icon: IconName; active?: boolean }[] }[] = [
  { links: [{ label: "Dashboard", icon: "home" }] },
  { title: "EVALUATION", links: [
    { label: "My Answer Books", icon: "book" }, { label: "Marking Workspace", icon: "workspace" },
    { label: "Annotation Tools", icon: "pen", active: true }, { label: "Evaluation History", icon: "history" },
    { label: "Moderation Feedback", icon: "award" }, { label: "Messages & Notifications", icon: "messages" },
  ] },
  { title: "REPORTS", links: [{ label: "My Performance", icon: "chart" }, { label: "Download Resources", icon: "download" }] },
  { title: "ACCOUNT", links: [{ label: "Profile & Settings", icon: "settings" }, { label: "Help & Support", icon: "help" }, { label: "Logout", icon: "logout" }] },
];
function BrandMark() {
  return <svg viewBox="0 0 42 42" width="40" height="40" aria-hidden="true">
    <path d="M20 32C19 22 23 13 33 9M18 26C15 18 10 16 6 15" fill="none" stroke="#00bd83" strokeWidth="3" strokeLinecap="round"/>
    <path d="M4 5C14 3 21 8 19 18 8 19 3 14 4 5Z" fill="#0587f7"/>
    <path d="M39 5C28 3 21 8 23 18 33 19 39 13 39 5Z" fill="#00bd83"/>
    <path d="M18 38C12 30 16 22 25 22 31 29 26 38 18 38Z" fill="#00bd83"/>
  </svg>;
}
export default function PortalShell({ children, onOpen }: { children: React.ReactNode; onOpen: () => void }) {
  return <main className="workspace">
    <aside className="portal-sidebar" aria-label="Examiner portal navigation">
      <a className="brand" href="/osm/annotation-demo" aria-label="Breathe4School annotation workspace"><BrandMark />
        <span><strong>Breathe4School</strong><small>Unified AI-Powered Education Ecosystem</small></span></a>
      <nav>{groups.map((group, index) => <div className="nav-group" key={group.title ?? index}>
        {group.title && <h2>{group.title}</h2>}
        {group.links.map(link => link.active ? <a className="portal-nav-item active" key={link.label} href="/osm/annotation-demo" aria-current="page"><Icon name={link.icon}/>{link.label}</a>
          : <span className="portal-nav-item" key={link.label} aria-disabled="true" title="Available in a later development phase"><Icon name={link.icon}/>{link.label}</span>)}
      </div>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-promo"><Icon name="workspace" size={25}/><strong>Evaluate Anywhere</strong><small>Secure. Accurate. Impactful.</small>
        <svg viewBox="0 0 170 82" aria-hidden="true"><defs><linearGradient id="monitor" x2="1" y2="1"><stop stopColor="#c8eeff"/><stop offset="1" stopColor="#2075d7"/></linearGradient></defs>
          <rect x="97" y="9" width="50" height="37" rx="4" fill="#0054ae" opacity=".5"/><rect x="53" y="18" width="65" height="46" rx="4" fill="url(#monitor)"/><rect x="59" y="23" width="53" height="34" rx="2" fill="#eaf7ff"/><path d="M80 64v7h16v-7M70 74h35" stroke="#70c7ff" strokeWidth="4"/><rect x="49" y="36" width="16" height="27" rx="2" fill="#4b9be8"/><path d="M73 31h15M73 36h21M73 41h10M91 44h14v9H91z" stroke="#3c8bce" strokeWidth="3"/><circle cx="131" cy="54" r="13" fill="#00be83"/><path d="m125 54 4 4 8-9" fill="none" stroke="white" strokeWidth="3"/></svg>
      </div><p>Breathe4School v1.0</p><p>© 2026 XploreSense Pvt. Ltd.</p></div>
    </aside>
    <section className="portal-main">
      <header className="portal-header"><strong>OSM - Examiner Portal</strong>
        <div className="portal-header-actions"><button className="icon-button" aria-label="Open PDF" title="Open a local PDF" onClick={onOpen}><Icon name="folder"/></button>
          <span className="header-bell" title="Notifications"><Icon name="bell"/></span>
          <span className="profile-avatar">EX</span><div className="profile-copy"><strong>Examiner Workspace</strong><span>Examiner</span></div><Icon name="chevron" size={16}/></div>
      </header>
      <div className="portal-content">{children}</div>
    </section>
  </main>;
}
