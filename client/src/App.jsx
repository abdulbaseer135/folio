import { useEffect, useRef, useState } from 'react';
import { FileText, Plus, Search, Upload, ArrowRight, LogOut, LayoutGrid, Users, Folder, ArrowLeft, Check, Loader2, AlertCircle, X, Share2, Download, Printer, Bold, Italic, Underline, List, ListOrdered, Undo2, Redo2, Heading1, Heading2, Pilcrow, MoreHorizontal, Clock, ShieldCheck } from 'lucide-react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { api, downloadText } from './api.js';
const readSession = () => { try { return JSON.parse(sessionStorage.getItem('folio-session')) || null; } catch { return null; } };
const routeId = () => location.hash.startsWith('#/documents/') ? location.hash.slice(12) : null;
function Avatar({ user, small = false }) { return <span className={`avatar ${small ? 'small' : ''}`} style={{ background: user?.color || '#64748b' }}>{user?.initials || '?'}</span>; }
function Notice({ children }) { return <div className="notice" role="alert"><AlertCircle size={17} /><span>{children}</span></div>; }
function Loading({ text = 'Opening your workspace…' }) { return <div className="loading" role="status"><Loader2 className="spin" size={22}/><span>{text}</span></div>; }
function Brand() { return <div className="brand"><span className="brand-icon"><FileText size={22}/></span><span>folio<span className="brand-dot">.</span></span></div>; }
function Login({ onLogin }) {
  const [users, setUsers] = useState([]), [error, setError] = useState(''), [busy, setBusy] = useState(''), [attempt, setAttempt] = useState(0);
  useEffect(() => { let alive = true; setError(''); api('/demo/users').then(u => alive && setUsers(u)).catch(e => alive && setError(e.message)); return () => { alive = false; }; }, [attempt]);
  async function login(user) { setBusy(user.id); setError(''); try { onLogin(await api('/demo/login', { method: 'POST', body: { userId: user.id } })); } catch (e) { setError(e.message); setBusy(''); } }
  return <div className="login-page"><header><Brand/><span className="pill">PRODUCT ENGINEERING DEMO</span></header><main className="login-layout"><section className="login-story"><span className="eyebrow">LESS FRICTION. MORE MOMENTUM.</span><h1>A little space.<br/>For your team’s<br/><em>next big idea.</em></h1><p>Create, shape, and share your documents.<br/>Everything you need. Nothing in your way.</p><div className="story-note"><ShieldCheck size={19}/> Built for focused, asynchronous collaboration.</div></section><section className="login-card"><span className="eyebrow">WELCOME TO FOLIO</span><h2>Pick a seat at the table.</h2><p>Choose a demo account to explore the workspace.</p><div className="demo-banner">Public sandbox · No password required.<br/>Do not upload personal or confidential information.</div>{error && <><Notice>{error}</Notice><button className="text-button" onClick={() => setAttempt(a => a + 1)}>Retry connection</button></>}{!users.length && !error && <Loading text="Connecting… Free hosting may take a moment."/>}<div className="account-list">{users.map((u, i) => <button className="account" key={u.id} disabled={!!busy} onClick={() => login(u)}><Avatar user={u}/><span><strong>{u.name}</strong><small>{u.email}</small></span>{busy === u.id ? <Loader2 className="spin" size={18}/> : <ArrowRight size={18}/>}<span className="sr-only">Sign in as {u.name}</span></button>)}</div><p className="login-footnote">Start as Abdul. Share with Maya. Switch accounts to verify access.</p></section></main><footer>Folio / A thoughtfully scoped document workspace</footer></div>;
}
function Dashboard({ session, users, onOpen, onLogout }) {
  const [docs, setDocs] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [filter, setFilter] = useState('all'), [search, setSearch] = useState('');
  const input = useRef(null);
  async function load() { setError(''); try { setDocs(await api('/documents', { token: session.token })); } catch (e) { setError(e.message); } }
  useEffect(() => { load(); }, []);
  async function create(file) {
    setBusy(true); setError('');
    try {
      let doc;
      if (file) {
        if (!/\.txt$/i.test(file.name) || file.size > 262144) throw new Error('Choose a UTF-8 .txt file, up to 256 KB.');
        const body = new FormData(); body.append('file', file);
        doc = await api('/documents/import', { token: session.token, method: 'POST', body });
      } else doc = await api('/documents', { token: session.token, method: 'POST', body: { title: 'Untitled document' } });
      onOpen(doc.id);
    } catch (e) { setError(e.message); } finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  const mine = docs?.filter(d => d.ownerId === session.user.id).length || 0;
  const visible = (docs || []).filter(d => (filter === 'all' || (filter === 'owned' ? d.ownerId === session.user.id : d.ownerId !== session.user.id)) && d.title.toLowerCase().includes(search.toLowerCase()));
  return <div className="workspace"><aside className="sidebar"><Brand/><div className="workspace-label">TEAM WORKSPACE</div><nav>{[['all', LayoutGrid, 'All documents', docs?.length || 0], ['owned', Folder, 'Owned by me', mine], ['shared', Users, 'Shared with me', (docs?.length || 0) - mine]].map(([id, Icon, label, count]) => <button key={id} className={`nav-item ${filter === id ? 'selected' : ''}`} onClick={() => setFilter(id)}><Icon size={18}/>{label}<span>{count}</span></button>)}</nav><div className="sidebar-tip"><Share2 size={20}/><h4>Better, together.</h4><p>Share a document by email, then switch accounts to see it from your teammate’s perspective.</p></div><div className="profile"><Avatar user={session.user} small/><div><strong>{session.user.name}</strong><small>Demo account</small></div><button className="icon-button" title="Switch account" aria-label="Switch account" onClick={onLogout}><LogOut size={17}/></button></div></aside><main className="main-area"><header className="topbar"><span>Workspace <span className="crumb">/ Documents</span></span><div className="topbar-right"><span className="demo-label">PUBLIC DEMO</span><button className="text-button" onClick={onLogout}>Switch account</button></div></header><div className="dashboard"><div className="page-heading"><div><span className="eyebrow">YOUR IDEAS, IN ONE PLACE</span><h1>{filter === 'shared' ? 'Shared with me' : filter === 'owned' ? 'Your documents' : 'All documents'}</h1><p>A clear space to think, write, and move work forward.</p></div><div className="actions"><input ref={input} type="file" accept=".txt,text/plain" className="sr-only" aria-label="Import text file" onChange={e => e.target.files?.[0] && create(e.target.files[0])}/><button className="secondary" disabled={busy} onClick={() => input.current.click()}><Upload size={17}/>Import .txt</button><button className="primary" disabled={busy} onClick={() => create()}>{busy ? <Loader2 className="spin" size={17}/> : <Plus size={18}/>}New document</button></div></div><section className="workspace-summary"><div className="summary-icon"><FileText size={25}/></div><div><h3>Make room for good work.</h3><p>Start with a blank page or bring your existing notes. Changes save as you go.</p></div><span className="pill">UTF-8 .TXT · UP TO 256 KB</span></section><div className="document-controls"><label className="search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…" aria-label="Search document titles"/></label><span>{visible.length} document{visible.length !== 1 ? 's' : ''}</span></div>{error && <div className="error-with-action"><Notice>{error}</Notice><button className="text-button" onClick={load}>Refresh documents</button></div>}{!docs && !error ? <Loading/> : visible.length ? <div className="document-grid">{visible.map(doc => { const owner = users.find(u => u.id === doc.ownerId); const owned = doc.ownerId === session.user.id; return <button className="document-card" key={doc.id} onClick={() => onOpen(doc.id)}><div className="card-preview"><div className="preview-sheet"><span className="preview-line title-line"/><span className="preview-line"/><span className="preview-line"/><span className="preview-line short"/><span className="preview-line gap"/><span className="preview-line"/><span className="preview-line short"/></div><span className={`ownership ${owned ? '' : 'shared'}`}>{owned ? 'Owned by you' : 'Shared with you'}</span></div><div className="card-body"><div className="card-title"><FileText size={17}/><h3>{doc.title}</h3></div><p>{doc.sourceName ? `Imported · ${doc.sourceName}` : `${owned ? 'You' : owner?.name || 'Teammate'} · ${doc.sharedWith.length ? 'Shared document' : 'Only you'}`}</p><div className="card-footer"><span><Clock size={13}/>{new Date(doc.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><span className="open-link">Open <ArrowRight size={14}/></span></div></div></button>; })}</div> : docs && <div className="empty-state"><FileText size={36}/><h3>{search ? 'No matching documents' : filter === 'shared' ? 'Nothing shared with you yet' : 'Your next idea starts here'}</h3><p>{search ? 'Try a different title.' : filter === 'shared' ? 'Switch to another account and share a document with your email.' : 'Create your first document or import a text file.'}</p>{!search && filter !== 'shared' && <button className="primary" onClick={() => create()} disabled={busy}><Plus size={17}/>Create document</button>}</div>}<div className="dashboard-footnote"><span className="status-dot"/>Changes persist in MongoDB · Sharing is asynchronous, not real-time</div></div></main></div>;
}
function Toolbar({ editor }) {
  useEditorState({ editor, selector: ({ editor: e }) => ({ bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), heading: e.getAttributes('heading').level, bullet: e.isActive('bulletList'), ordered: e.isActive('orderedList'), undo: e.can().undo(), redo: e.can().redo() }) });
  const items = [
    ['Undo', Undo2, () => editor.chain().focus().undo().run(), false, !editor.can().undo()],
    ['Redo', Redo2, () => editor.chain().focus().redo().run(), false, !editor.can().redo()],
    ['Paragraph', Pilcrow, () => editor.chain().focus().setParagraph().run(), editor.isActive('paragraph')],
    ['Heading 1', Heading1, () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive('heading', { level: 1 })],
    ['Heading 2', Heading2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 })],
    ['Bold', Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold')],
    ['Italic', Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic')],
    ['Underline', Underline, () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline')],
    ['Bulleted list', List, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList')],
    ['Numbered list', ListOrdered, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList')]
  ];
  return <div className="toolbar" role="toolbar" aria-label="Text formatting">{items.map(([label, Icon, run, active, disabled], i) => <button key={label} aria-label={label} title={label} aria-pressed={!!active} disabled={disabled} className={`tool ${active ? 'active' : ''} ${[2, 5, 8].includes(i) ? 'tool-divider' : ''}`} onMouseDown={e => e.preventDefault()} onClick={run}><Icon size={18}/></button>)}</div>;
}
function ShareDialog({ doc, users, session, onClose, onChange }) {
  const [email, setEmail] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const closeRef = useRef(null), panelRef = useRef(null);
  useEffect(() => {
    const before = document.activeElement; closeRef.current?.focus();
    function key(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = [...panelRef.current.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', key); return () => { document.removeEventListener('keydown', key); before?.focus(); };
  }, []);
  async function change(userId) {
    setError(''); setBusy(true);
    try {
      const data = await api(`/documents/${doc.id}/shares${userId ? `/${userId}` : ''}`, { token: session.token, method: userId ? 'DELETE' : 'POST', ...(userId ? {} : { body: { email } }) });
      onChange(data); setEmail('');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const owner = users.find(u => u.id === doc.ownerId);
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section ref={panelRef} className="modal" role="dialog" aria-modal="true" aria-labelledby="share-title"><div className="modal-heading"><div><span className="eyebrow">WORK BETTER TOGETHER</span><h2 id="share-title">Share document</h2></div><button ref={closeRef} className="icon-button" aria-label="Close sharing dialog" onClick={onClose}><X size={21}/></button></div><p className="muted">Invited teammates can open, rename, and edit this document. Only the owner can manage access.</p>{doc.ownerId === session.user.id && <form onSubmit={e => { e.preventDefault(); change(); }} className="share-form"><label className="sr-only" htmlFor="share-email">Teammate email</label><input id="share-email" type="email" placeholder="maya@demo.local" required value={email} onChange={e => setEmail(e.target.value)} list="teammates"/><datalist id="teammates">{users.filter(u => u.id !== session.user.id).map(u => <option key={u.id} value={u.email}/>)}</datalist><button className="primary" disabled={busy || !email.trim()}>{busy ? <Loader2 className="spin" size={17}/> : <Plus size={17}/>}Invite</button></form>}{error && <Notice>{error}</Notice>}<h4>People with access</h4><div className="access-row"><Avatar user={owner} small/><div><strong>{owner?.name || 'Owner'}</strong><small>{owner?.email}</small></div><span className="access-role">Owner</span></div>{doc.sharedWith.map(id => { const u = users.find(x => x.id === id); return <div className="access-row" key={id}><Avatar user={u} small/><div><strong>{u?.name || id}</strong><small>{u?.email}</small></div><span className="access-role">Editor</span>{doc.ownerId === session.user.id && <button className="text-button danger" disabled={busy} onClick={() => change(id)}>Remove<span className="sr-only"> {u?.name}</span></button>}</div>; })}<div className="sharing-note"><ShieldCheck size={17}/><span>Restricted to the owner and invited teammates.<br/>Demo identities are public and simulated, not production authentication.</span></div></section></div>;
}
function DocumentScreen({ id, session, users, onBack, onDirty, onLogout }) {
  const [doc, setDoc] = useState(null), [error, setError] = useState(''), [reload, setReload] = useState(0);
  useEffect(() => { let alive = true; setDoc(null); setError(''); api(`/documents/${id}`, { token: session.token }).then(d => alive && setDoc(d)).catch(e => alive && setError(e.message)); return () => { alive = false; }; }, [id, reload, session.token]);
  return doc ? <DocumentEditor key={`${id}-${reload}`} initial={doc} session={session} users={users} onBack={onBack} onDirty={onDirty} onLogout={onLogout} onReload={() => { if (confirm('Reload the server version? Unsaved local changes will be discarded. Download a copy first if needed.')) { onDirty(false); setReload(x => x + 1); } }}/> : <main className="center-page"><button className="secondary" onClick={onBack}><ArrowLeft size={17}/>Back to documents</button>{error ? <><Notice>{error}</Notice><button className="text-button" onClick={() => setReload(x => x + 1)}>Retry</button><button className="text-button" onClick={onLogout}>Switch account</button></> : <Loading text="Opening document…"/>}</main>;
}
function DocumentEditor({ initial, session, users, onBack, onDirty, onLogout, onReload }) {
  const [doc, setDoc] = useState(initial), [title, setTitle] = useState(initial.title), [status, setStatus] = useState('saved'), [message, setMessage] = useState(''), [sharing, setSharing] = useState(false);
  const draft = useRef({ title: initial.title, content: initial.content });
  const revision = useRef(0), savedRevision = useRef(0), version = useRef(initial.version), saving = useRef(false), blocked = useRef(false), timer = useRef(null), alive = useRef(true), saveFn = useRef(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; clearTimeout(timer.current); }; }, []);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false })],
    content: initial.content,
    editorProps: { attributes: { 'aria-label': 'Document content', spellcheck: 'true', class: 'document-prose' } },
    onUpdate: ({ editor: e }) => updateDraft({ content: e.getJSON() })
  });
  const editorStats = useEditorState({ editor, selector: ({ editor: e }) => { const text = e?.getText() || ''; return { words: text.trim() ? text.trim().split(/\s+/).length : 0, characters: text.length }; } });
  function updateDraft(patch) {
    draft.current = { ...draft.current, ...patch }; revision.current++; onDirty(true);
    if (!blocked.current) { setStatus('unsaved'); setMessage(''); clearTimeout(timer.current); timer.current = setTimeout(() => saveFn.current(), 900); }
  }
  saveFn.current = async () => {
    if (saving.current || blocked.current || savedRevision.current === revision.current) return;
    clearTimeout(timer.current); saving.current = true; setStatus('saving'); setMessage('');
    const submittedRevision = revision.current;
    const body = { ...draft.current, title: draft.current.title.trim() || 'Untitled document', version: version.current };
    let success = false;
    try {
      const result = await api(`/documents/${initial.id}`, { token: session.token, method: 'PATCH', body });
      version.current = result.version; savedRevision.current = submittedRevision; success = true;
      if (!alive.current) return;
      setDoc(result);
      const dirty = revision.current !== submittedRevision;
      if (!dirty) { draft.current.title = result.title; setTitle(result.title); }
      setStatus(dirty ? 'unsaved' : 'saved'); onDirty(dirty);
    } catch (e) {
      if (!alive.current) return;
      if (e.status === 409) { blocked.current = true; setStatus('conflict'); }
      else setStatus('error');
      setMessage(e.message);
    } finally {
      saving.current = false;
      if (alive.current && success && revision.current !== savedRevision.current && !blocked.current) timer.current = setTimeout(() => saveFn.current(), 900);
    }
  };
  useEffect(() => {
    function key(e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveFn.current(); } }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);
  const owner = users.find(u => u.id === doc.ownerId);
  const statusLabels = { saved: 'All changes saved', saving: 'Saving…', unsaved: 'Unsaved changes', error: 'Could not save', conflict: 'Version conflict' };
  function exportCopy() { downloadText(`${title.replace(/[^a-z0-9 _-]/gi, '').slice(0, 80) || 'document'}.txt`, `${title}\n\n${editor?.getText() || ''}`); }
  return <div className="editor-page"><header className="editor-header"><div className="editor-header-left"><button className="icon-button back-button" onClick={onBack} title="Back to documents" aria-label="Back to documents"><ArrowLeft size={21}/></button><span className="editor-file-icon"><FileText size={26}/></span><div className="document-meta"><input className="title-input" aria-label="Document title" maxLength={120} value={title} onChange={e => { setTitle(e.target.value); updateDraft({ title: e.target.value }); }}/><div className="save-meta"><span>{doc.ownerId === session.user.id ? 'Owned by you' : `Shared by ${owner?.name || 'teammate'}`}</span><span className="meta-separator">·</span><span className={`save-indicator ${status}`} role="status">{status === 'saving' ? <Loader2 className="spin" size={13}/> : status === 'saved' ? <Check size={13}/> : <AlertCircle size={13}/>} {statusLabels[status]}</span></div></div></div><div className="editor-header-actions"><button className="secondary save-button" disabled={status === 'saved' || status === 'saving' || status === 'conflict'} onClick={() => saveFn.current()}>Save now</button><button className="icon-button" onClick={() => window.print()} aria-label="Print or save as PDF via browser" title="Print / Save as PDF"><Printer size={19}/></button><button className="icon-button" onClick={exportCopy} aria-label="Download plain-text copy" title="Download plain-text copy"><Download size={19}/></button><button className="primary" onClick={() => setSharing(true)}><Share2 size={17}/>Share</button><button className="avatar-button" onClick={onLogout} title="Switch account" aria-label="Switch account"><Avatar user={session.user} small/></button></div></header><div className="toolbar-wrap">{editor && <Toolbar editor={editor}/>}<span className="editing-label">Editing · Async sharing</span></div>{message && <div className="editor-alert"><Notice>{message}</Notice><div className="actions"><button className="secondary" onClick={exportCopy}>Download local text</button>{status === 'conflict' ? <button className="secondary" onClick={onReload}>Reload server version</button> : <button className="secondary" onClick={() => saveFn.current()}>Retry save</button>}</div></div>}<main className="editor-canvas"><div className="page-context"><span><span className="status-dot"/>{doc.sharedWith.length ? `${doc.sharedWith.length + 1} people have access` : 'Private document'}</span><span>{doc.sourceName ? `Imported from ${doc.sourceName}` : 'A little space for your next idea'}</span></div><div className="print-title" aria-hidden="true"><h1>{title || 'Untitled document'}</h1></div><article className="document-paper">{editor && <EditorContent editor={editor}/>}</article></main><footer className="editor-footer"><span>{editorStats?.words || 0} words <span className="meta-separator">·</span> {editorStats?.characters || 0} characters</span><span>Version {version.current} <span className="meta-separator">·</span> Ctrl / ⌘ + S to save</span></footer>{sharing && <ShareDialog doc={doc} users={users} session={session} onClose={() => setSharing(false)} onChange={result => setDoc(current => ({ ...current, sharedWith: result.sharedWith }))}/>}</div>;
}
export default function App() {
  const [session, setSession] = useState(readSession), [users, setUsers] = useState([]), [id, setId] = useState(routeId);
  const dirty = useRef(false), acceptedHash = useRef(location.hash);
  useEffect(() => {
    const before = e => { if (dirty.current) { e.preventDefault(); e.returnValue = ''; } };
    const hash = () => {
      if (dirty.current && !confirm('Leave this document? Unsaved local changes will be discarded.')) {
        history.replaceState(null, '', `${location.pathname}${location.search}${acceptedHash.current}`); return;
      }
      dirty.current = false; acceptedHash.current = location.hash; setId(routeId());
    };
    window.addEventListener('beforeunload', before); window.addEventListener('hashchange', hash);
    return () => { window.removeEventListener('beforeunload', before); window.removeEventListener('hashchange', hash); };
  }, []);
  useEffect(() => { if (session) api('/users', { token: session.token }).then(setUsers).catch(() => {}); }, [session]);
  function navigate(next) {
    if (dirty.current && !confirm('Leave this document? Unsaved local changes will be discarded.')) return;
    dirty.current = false;
    const hash = next ? `#/documents/${next}` : '#/';
    history.pushState(null, '', hash); acceptedHash.current = hash; setId(next);
  }
  function logout() {
    if (dirty.current && !confirm('Switch accounts? Unsaved local changes will be discarded.')) return;
    dirty.current = false; sessionStorage.removeItem('folio-session'); setSession(null); setUsers([]);
    history.replaceState(null, '', '#/'); acceptedHash.current = '#/'; setId(null);
  }
  function login(data) { sessionStorage.setItem('folio-session', JSON.stringify(data)); setSession(data); }
  if (!session) return <Login onLogin={login}/>;
  return id ? <DocumentScreen key={id} id={id} session={session} users={users} onBack={() => navigate(null)} onDirty={value => { dirty.current = value; }} onLogout={logout}/> : <Dashboard session={session} users={users} onOpen={navigate} onLogout={logout}/>;
}
