import { useState, useEffect, useCallback } from "react";
import {
  Shield, LogOut, LayoutDashboard, FileText, Wrench, Users, Mail, Inbox,
  Plus, Pencil, Trash2, Star, Search, Download, X, ArrowLeft, Loader2, Send
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

const LOGO_URL = "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/attachments/2279f60b-da80-4165-b5eb-bcd80ff90107/1793990664534_PearlHub_Tech_Learning_Logo.webp";

type Tab = "dashboard" | "articles" | "tools" | "authors" | "subscribers" | "newsletter" | "messages";
type ArticleStatus = "draft" | "published" | "archived";
type ArticleDifficulty = "all-levels" | "beginner" | "intermediate" | "advanced";

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: "technology" | "education";
  subcategory: string;
  author_id: string;
  published_at: string;
  read_time: number;
  featured: boolean;
  gradient: string;
  tags: string[];
  content: unknown;
  status: ArticleStatus;
  difficulty: ArticleDifficulty;
}

type ArticleTextField = "title" | "slug" | "excerpt" | "subcategory" | "author_id" | "published_at" | "read_time" | "tags";

export default function AdminPanel({ onBack }: { onBack: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");

  const checkAdminAccess = useCallback(async (userId?: string) => {
    if (!userId) {
      setAuthed(false);
      setLoggingIn(false);
      return;
    }
    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    const authorized = !error && Boolean(data);
    if (userId && !authorized) {
      await supabase.auth.signOut();
      toast.error("This account is not authorized for admin access.");
    }
    setAuthed(authorized);
    setLoggingIn(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      void checkAdminAccess(data.session?.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void checkAdminAccess(session?.user.id);
    });
    return () => listener.subscription.unsubscribe();
  }, [checkAdminAccess]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoggingIn(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      toast.error(error.message);
      setLoggingIn(false);
      return;
    }
    await checkAdminAccess(data.user?.id);
    if (!data.user) toast.error("Unable to verify this account.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    setPassword("");
  };

  if (loggingIn && !authed) {
    return <div className="min-h-[80vh] flex items-center justify-center"><Loader /></div>;
  }

  if (!authed) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="bg-black rounded-xl p-3"><img src={LOGO_URL} alt="PearlHub" className="h-12 w-auto" /></div>
        </div>
        <h2 className="text-xl font-bold text-center mb-2">Admin Portal</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">Sign in with an authorized PearlHub administrator account.</p>
        <form onSubmit={handleLogin}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-purple mb-3" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-purple mb-4" />
          <button type="submit" disabled={loggingIn} className="w-full py-3 rounded-lg bg-brand-purple text-white font-medium hover:bg-brand-purple-light transition-colors disabled:opacity-60">
            {loggingIn ? "Signing in..." : "Sign in to Dashboard"}
          </button>
        </form>
        <button onClick={onBack} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground">Back to site</button>
      </div>
    </div>
  );

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "articles", label: "Articles", icon: <FileText className="w-4 h-4" /> },
    { id: "tools", label: "Tools", icon: <Wrench className="w-4 h-4" /> },
    { id: "authors", label: "Authors", icon: <Users className="w-4 h-4" /> },
    { id: "subscribers", label: "Subscribers", icon: <Mail className="w-4 h-4" /> },
    { id: "newsletter", label: "Send email", icon: <Send className="w-4 h-4" /> },
    { id: "messages", label: "Messages", icon: <Inbox className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted"><ArrowLeft className="w-5 h-5" /></button>
            <div className="bg-black rounded-lg px-2 py-1"><img src={LOGO_URL} alt="PearlHub" className="h-7 w-auto" /></div>
            <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">Admin Panel</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-border">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap ${tab === t.id ? "bg-brand-purple/10 text-brand-purple border-b-2 border-brand-purple" : "text-muted-foreground hover:text-foreground"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "articles" && <ArticlesTab />}
        {tab === "tools" && <ToolsTab />}
        {tab === "authors" && <AuthorsTab />}
        {tab === "subscribers" && <SubscribersTab />}
        {tab === "newsletter" && <NewsletterTab />}
        {tab === "messages" && <MessagesTab />}
      </div>
    </div>
  );
}

function DashboardTab() {
  const [stats, setStats] = useState({ articles: 0, tools: 0, authors: 0, subscribers: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      supabase.from("articles").select("id", { count: "exact", head: true }),
      supabase.from("tools").select("id", { count: "exact", head: true }),
      supabase.from("authors").select("id", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    ]).then(([a, t, au, s, m]) => { setStats({ articles: a.count ?? 0, tools: t.count ?? 0, authors: au.count ?? 0, subscribers: s.count ?? 0, messages: m.count ?? 0 }); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  if (loading) return <Loader />;
  const cards = [
    { label: "Articles", value: stats.articles, icon: <FileText className="w-5 h-5" /> },
    { label: "Tools", value: stats.tools, icon: <Wrench className="w-5 h-5" /> },
    { label: "Authors", value: stats.authors, icon: <Users className="w-5 h-5" /> },
    { label: "Subscribers", value: stats.subscribers, icon: <Mail className="w-5 h-5" /> },
    { label: "Messages", value: stats.messages, icon: <Inbox className="w-5 h-5" /> },
  ];
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Overview</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple">{c.icon}</div>
            <span className="text-2xl font-bold">{c.value}</span>
            <span className="text-xs text-muted-foreground">{c.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 rounded-xl bg-card border border-border flex items-center gap-2 text-sm">
        <Shield className="w-4 h-4 text-emerald-500" /><span className="font-medium">Supabase Connected</span><span className="text-muted-foreground">- Live sync active</span>
      </div>
    </div>
  );
}

function Loader() { return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-brand-purple" /></div>; }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">{title}</h3><button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="w-5 h-5" /></button></div>
        {children}
      </div>
    </div>
  );
}

function ArticlesTab() {
  const [rows, setRows] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminArticle | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const fetch = useCallback(async () => { setLoading(true); const { data, error } = await supabase.from("articles").select("*").order("published_at", { ascending: false }); if (error) toast.error(error.message); else setRows(data ?? []); setLoading(false); }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const filtered = rows.filter((r) =>
    (!search || r.title?.toLowerCase().includes(search.toLowerCase()))
    && (statusFilter === "all" || (r.status ?? "published") === statusFilter),
  );
  const del = async (id: string) => { if (!confirm("Delete?")) return; const { error } = await supabase.from("articles").delete().eq("id", id); if (error) toast.error(error.message); else { toast.success("Deleted"); fetch(); } };
  const toggleFeat = async (a: AdminArticle) => { const { error } = await supabase.from("articles").update({ featured: !a.featured }).eq("id", a.id); if (error) toast.error(error.message); else fetch(); };
  const setStatus = async (article: AdminArticle, status: ArticleStatus) => {
    const { error } = await supabase.from("articles").update({ status }).eq("id", article.id);
    if (error) toast.error(`Could not update article status: ${error.message}`);
    else {
      toast.success(`Article ${status}.`);
      fetch();
    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter articles by status" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="all">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option><option value="archived">Archived</option>
          </select>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-purple text-white text-sm font-medium"><Plus className="w-4 h-4" /> New</button>
      </div>
      {loading ? <Loader /> : <div className="space-y-2">
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No articles.</p>}
        {filtered.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{a.title}</p><p className="text-xs text-muted-foreground">{a.category} · {a.published_at}</p></div>
            <select value={a.status ?? "published"} onChange={(event) => void setStatus(a, event.target.value as ArticleStatus)} aria-label={`Status for ${a.title}`} className="rounded-md border border-border bg-background px-2 py-1.5 text-xs">
              <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
            </select>
            <button onClick={() => toggleFeat(a)} className={`p-1.5 ${a.featured ? "text-amber-500" : "text-muted-foreground"}`}><Star className="w-4 h-4" fill={a.featured ? "currentColor" : "none"} /></button>
            <button onClick={() => setEditing(a)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => del(a.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>}
      {(creating || editing) && <ArticleForm article={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={fetch} />}
    </div>
  );
}

function ArticleForm({ article, onClose, onSaved }: { article: AdminArticle | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ id: article?.id ?? `art-${Date.now()}`, title: article?.title ?? "", slug: article?.slug ?? "", excerpt: article?.excerpt ?? "", category: article?.category ?? "technology", subcategory: article?.subcategory ?? "", author_id: article?.author_id ?? "a1", published_at: article?.published_at ?? new Date().toISOString().slice(0, 10), read_time: String(article?.read_time ?? 5), featured: article?.featured ?? false, gradient: article?.gradient ?? "from-brand-purple to-brand-purple-light", tags: Array.isArray(article?.tags) ? article.tags.join(", ") : "", content: article?.content ? JSON.stringify(article.content) : "[]", status: article?.status ?? "draft", difficulty: article?.difficulty ?? "all-levels" });
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const save = async () => {
    if (!f.title || !f.slug) { toast.error("Title and slug required"); return; }
    let contentParsed: unknown;
    try {
      contentParsed = JSON.parse(f.content);
    } catch {
      toast.error("Content must be valid JSON.");
      return;
    }
    if (!Array.isArray(contentParsed)) {
      toast.error("Content JSON must be an array of article sections.");
      return;
    }
    setSaving(true);
    const payload = { id: f.id, title: f.title, slug: f.slug, excerpt: f.excerpt, category: f.category, subcategory: f.subcategory, author_id: f.author_id, published_at: f.published_at, read_time: Number(f.read_time), featured: f.featured, gradient: f.gradient, tags: f.tags ? f.tags.split(",").map((t) => t.trim()).filter(Boolean) : [], content: contentParsed, status: f.status, difficulty: f.difficulty };
    const { error } = article ? await supabase.from("articles").update(payload).eq("id", article.id) : await supabase.from("articles").insert(payload);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success(article ? "Updated" : "Created"); onClose(); onSaved(); }
  };
  const inp = (label: string, key: ArticleTextField, type = "text") => (<div><label className="text-xs font-medium text-muted-foreground">{label}</label><input type={type} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>);
  return (
    <Modal title={article ? "Edit Article" : "New Article"} onClose={onClose}>
      <div className="space-y-3">{inp("Title", "title")}{inp("Slug", "slug")}{inp("Excerpt", "excerpt")}
        <div className="grid grid-cols-2 gap-3"><div><label className="text-xs font-medium text-muted-foreground">Category</label><select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as AdminArticle["category"] })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"><option value="technology">Technology</option><option value="education">Education</option></select></div>{inp("Subcategory", "subcategory")}</div>
        <div className="grid grid-cols-2 gap-3">{inp("Author ID", "author_id")}{inp("Date", "published_at", "date")}</div>
        <div className="grid grid-cols-2 gap-3">{inp("Read Min", "read_time", "number")}{inp("Tags", "tags")}</div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground">Publishing status</label><select value={f.status} onChange={(event) => setF({ ...f, status: event.target.value as ArticleStatus })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
          <div><label className="text-xs font-medium text-muted-foreground">Reading level</label><select value={f.difficulty} onChange={(event) => setF({ ...f, difficulty: event.target.value as ArticleDifficulty })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="all-levels">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
        </div>
        <div><label className="text-xs font-medium text-muted-foreground">Content JSON</label><textarea value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono h-20" /></div>
        <button type="button" onClick={() => setPreviewing((current) => !current)} className="w-full rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted">{previewing ? "Hide preview" : "Preview article"}</button>
        {previewing && (
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-background p-4">
            <p className="mb-1 text-xs uppercase text-muted-foreground">{f.category} · {f.difficulty}</p>
            <h3 className="text-lg font-bold">{f.title || "Article title"}</h3>
            <p className="my-2 text-sm text-muted-foreground">{f.excerpt}</p>
            <div className="space-y-2 text-sm">{(() => {
              try {
                const blocks = JSON.parse(f.content);
                return Array.isArray(blocks)
                  ? blocks.map((block, index) => <p key={index} className={block.type === "heading" ? "font-semibold" : "text-muted-foreground"}>{Array.isArray(block.content) ? block.content.join(", ") : String(block.content ?? "")}</p>)
                  : <p className="text-amber-600">Content must be an array of blocks.</p>;
              } catch {
                return <p className="text-amber-600">Content JSON is invalid.</p>;
              }
            })()}</div>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} className="rounded" />Featured</label>
      </div>
      <button onClick={save} disabled={saving} className="mt-4 w-full py-2.5 rounded-lg bg-brand-purple text-white font-medium disabled:opacity-50">{saving ? "Saving..." : f.status === "published" ? "Publish article" : "Save article"}</button>
    </Modal>
  );
}

function ToolsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const fetch = useCallback(async () => { setLoading(true); const { data, error } = await supabase.from("tools").select("*").order("name"); if (error) toast.error(error.message); else setRows(data ?? []); setLoading(false); }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const del = async (id: string) => { if (!confirm("Delete?")) return; const { error } = await supabase.from("tools").delete().eq("id", id); if (error) toast.error(error.message); else { toast.success("Deleted"); fetch(); } };
  if (loading) return <Loader />;
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Tools ({rows.length})</h3>
      <div className="space-y-2">{rows.map((t) => (
        <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{t.name}</p><p className="text-xs text-muted-foreground">{t.category}</p></div>
          <button onClick={() => setEditing(t)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => del(t.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}</div>
      {editing && <SimpleForm title="Edit Tool" initial={editing} fields={["name", "slug", "description", "category", "icon", "formula"]} table="tools" id={editing.id} onClose={() => setEditing(null)} onSaved={fetch} />}
    </div>
  );
}

function AuthorsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const fetch = useCallback(async () => { setLoading(true); const { data, error } = await supabase.from("authors").select("*").order("name"); if (error) toast.error(error.message); else setRows(data ?? []); setLoading(false); }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const del = async (id: string) => { if (!confirm("Delete?")) return; const { error } = await supabase.from("authors").delete().eq("id", id); if (error) toast.error(error.message); else { toast.success("Deleted"); fetch(); } };
  if (loading) return <Loader />;
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Authors ({rows.length})</h3>
      <div className="space-y-2">{rows.map((a) => (
        <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
          <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center text-xs font-bold text-brand-purple">{a.name?.charAt(0)}</div>
          <div className="flex-1 min-w-0"><p className="text-sm font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.title}</p></div>
          <button onClick={() => setEditing(a)} className="p-1.5 text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => del(a.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}</div>
      {editing && <SimpleForm title="Edit Author" initial={editing} fields={["name", "title", "avatar", "bio"]} table="authors" id={editing.id} onClose={() => setEditing(null)} onSaved={fetch} />}
    </div>
  );
}

function SimpleForm({ title, initial, fields, table, id, onClose, onSaved }: { title: string; initial: any; fields: string[]; table: string; id: string; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(Object.fromEntries(fields.map((k) => [k, initial[k] ?? ""])) as any);
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); const { error } = await supabase.from(table).update(f).eq("id", id); setSaving(false); if (error) toast.error(error.message); else { toast.success("Saved"); onClose(); onSaved(); } };
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-3">{fields.map((k) => (<div key={k}><label className="text-xs font-medium text-muted-foreground capitalize">{k.replace("_", " ")}</label><input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>))}</div>
      <button onClick={save} disabled={saving} className="mt-4 w-full py-2.5 rounded-lg bg-brand-purple text-white font-medium disabled:opacity-50">{saving ? "Saving..." : "Update"}</button>
    </Modal>
  );
}

function SubscribersTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => { setLoading(true); const { data, error } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }); if (error) toast.error(error.message); else setRows(data ?? []); setLoading(false); }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const del = async (id: string) => { const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id); if (error) toast.error(error.message); else { toast.success("Removed"); fetch(); } };
  const exportCSV = () => { const hdr = "email,created_at"; const lines = rows.map((r) => `${r.email},${r.created_at}`).join(String.fromCharCode(10)); const csv = hdr + String.fromCharCode(10) + lines; const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click(); URL.revokeObjectURL(url); };
  if (loading) return <Loader />;
  return (
    <div>
      <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Subscribers ({rows.length})</h3>{rows.length > 0 && <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"><Download className="w-4 h-4" /> CSV</button>}</div>
      {rows.length === 0 ? <p className="text-center text-muted-foreground py-8">No subscribers.</p> : <div className="space-y-2">{rows.map((s) => (
        <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"><Mail className="w-4 h-4 text-muted-foreground" /><span className="flex-1 text-sm truncate">{s.email}</span><span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span><button onClick={() => del(s.id)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>
      ))}</div>}
    </div>
  );
}

function NewsletterTab() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (!active) return;
        if (error) toast.error(`Could not load subscriber count: ${error.message}`);
        else setSubscriberCount(count ?? 0);
        setLoadingCount(false);
      });
    return () => { active = false; };
  }, []);

  const sendNewsletter = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    if (!trimmedSubject || !trimmedMessage) {
      toast.error("Add an email subject and message before sending.");
      return;
    }
    if (subscriberCount === 0) {
      toast.error("There are no subscribers to email.");
      return;
    }
    const recipientDescription = subscriberCount === null
      ? "all current subscribers"
      : `${subscriberCount} current subscriber${subscriberCount === 1 ? "" : "s"}`;
    if (!window.confirm(`Send this email to ${recipientDescription}? This action cannot be undone.`)) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: { subject: trimmedSubject, message: trimmedMessage },
      });
      if (error) {
        const response = error.context instanceof Response ? error.context : null;
        let detail = error.message;
        if (response) {
          try {
            const body = await response.clone().json() as { error?: unknown; sent?: unknown };
            if (typeof body.error === "string") detail = body.error;
            if (typeof body.sent === "number" && body.sent > 0) {
              detail = `The service stopped after sending ${body.sent} email${body.sent === 1 ? "" : "s"}. ${detail}`;
            }
          } catch {
            // Use the function invocation error when no readable response body is available.
          }
        }
        throw new Error(detail);
      }

      const sent = typeof data?.sent === "number" ? data.sent : 0;
      const failed = typeof data?.failed === "number" ? data.failed : 0;
      const notAttempted = typeof data?.notAttempted === "number" ? data.notAttempted : 0;
      if (failed > 0) {
        const detail = typeof data?.error === "string" ? ` ${data.error}` : "";
        toast.error(`Sent ${sent}; ${failed} failed${notAttempted ? `; ${notAttempted} not attempted` : ""}.${detail} Check Resend logs before retrying.`);
      } else if (notAttempted > 0 || typeof data?.error === "string") {
        toast.error(`Sent ${sent}; ${notAttempted} not attempted. ${typeof data.error === "string" ? data.error : "Check the Resend logs."}`);
      } else {
        toast.success(`Newsletter sent to ${sent} subscriber${sent === 1 ? "" : "s"}.`);
        setSubject("");
        setMessage("");
      }
    } catch (error) {
      toast.error(`Could not send newsletter: ${error instanceof Error ? error.message : "Unexpected error."}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <h3 className="text-lg font-bold">Email subscribers</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Compose one message for your newsletter list. Each subscriber receives an individual email; addresses are never exposed to other recipients.
        </p>
      </div>
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10 text-brand-purple"><Mail className="h-5 w-5" /></div>
        <div>
          <p className="text-sm font-medium">Audience</p>
          <p className="text-sm text-muted-foreground">
            {loadingCount ? "Checking subscriber list…" : subscriberCount === null ? "Subscriber count unavailable" : `${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>
      <form onSubmit={sendNewsletter} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <label htmlFor="newsletter-subject" className="mb-1.5 block text-sm font-medium">Subject</label>
          <input
            id="newsletter-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            maxLength={200}
            required
            placeholder="A clear subject for your newsletter"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="newsletter-message" className="mb-1.5 block text-sm font-medium">Message</label>
          <textarea
            id="newsletter-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={20000}
            required
            rows={10}
            placeholder="Write the message you want subscribers to receive…"
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">{message.length.toLocaleString()} / 20,000</p>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          Only send updates subscribers asked to receive. Include a way to unsubscribe; requests sent to pearlhubweb@gmail.com can be handled in the Subscribers tab.
        </p>
        <button
          type="submit"
          disabled={sending || loadingCount || subscriberCount === 0 || subscriberCount === null}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-purple-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Sending newsletter…" : "Review and send"}
        </button>
      </form>
    </div>
  );
}

function MessagesTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const fetch = useCallback(async () => { setLoading(true); const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false }); if (error) toast.error(error.message); else setRows(data ?? []); setLoading(false); }, []);
  useEffect(() => { fetch(); }, [fetch]);
  const del = async (id: string) => { const { error } = await supabase.from("contact_messages").delete().eq("id", id); if (error) toast.error(error.message); else { toast.success("Deleted"); fetch(); } };
  if (loading) return <Loader />;
  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Messages ({rows.length})</h3>
      {rows.length === 0 ? <p className="text-center text-muted-foreground py-8">No messages.</p> : <div className="space-y-2">{rows.map((m) => (
        <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border cursor-pointer hover:border-brand-purple/30" onClick={() => setSelected(m)}>
          <Inbox className="w-4 h-4 text-muted-foreground" /><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{m.subject || m.message?.slice(0, 60)}</p><p className="text-xs text-muted-foreground">{m.name} - {m.email}</p></div>
          <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</span>
          <button onClick={(e) => { e.stopPropagation(); del(m.id); }} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}</div>}
      {selected && <Modal title="Message" onClose={() => setSelected(null)}>
        <div className="space-y-3 text-sm"><p><span className="font-medium">From:</span> {selected.name} ({selected.email})</p>{selected.subject && <p><span className="font-medium">Subject:</span> {selected.subject}</p>}{selected.category && <p><span className="font-medium">Category:</span> {selected.category}</p>}<p><span className="font-medium">Date:</span> {new Date(selected.created_at).toLocaleString()}</p><div className="p-3 rounded-lg bg-muted/50 border border-border whitespace-pre-wrap">{selected.message}</div></div>
      </Modal>}
    </div>
  );
}
