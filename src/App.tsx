import { useState, useEffect, useCallback } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GlobalSearchModal from "./components/GlobalSearchModal";
import BookmarksModal from "./components/BookmarksModal";
import {
  HomePage,
  TechnologyPage,
  EducationPage,
  ToolsPage,
  AboutPage,
  ContactPage,
  LegalPage,
  StudentSpacePage,
} from "./components/PageViews";
import { ArticleReaderPage, ToolDetailPage } from "./components/DetailViews";
import AdminPanel from "./components/AdminPanel";
import { ARTICLES, TOOLS } from "./mockData";
import { getSyncState, loadContent, type SyncState } from "./integrations/supabase/data";
import type { Bookmark } from "./types";

function ArticleRoute({ navigate, bookmarks, onToggleBookmark }: {
  navigate: (view: string, id?: string) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (id: string, title: string, type: "article" | "tool") => void;
}) {
  const { slug = "" } = useParams();
  const article = ARTICLES.find((item) => item.slug === slug);
  return <ArticleReaderPage articleId={article?.id ?? ""} navigate={navigate} bookmarks={bookmarks} onToggleBookmark={onToggleBookmark} />;
}

function ToolRoute({ navigate, bookmarks, onToggleBookmark }: {
  navigate: (view: string, id?: string) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (id: string, title: string, type: "article" | "tool") => void;
}) {
  const { slug = "" } = useParams();
  const tool = TOOLS.find((item) => item.slug === slug);
  return <ToolDetailPage toolId={tool?.id ?? ""} navigate={navigate} bookmarks={bookmarks} onToggleBookmark={onToggleBookmark} />;
}

function AppLayout() {
  const navigateTo = useNavigate();
  const { pathname } = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("pearlhub-theme") === "dark");
  const [searchOpen, setSearchOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(getSyncState());
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem("pearlhub-bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("pearlhub-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("pearlhub-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", openSearch);
    return () => window.removeEventListener("keydown", openSearch);
  }, []);

  useEffect(() => {
    let active = true;
    loadContent().then((state) => {
      if (active) setSyncState(state);
    });
    return () => { active = false; };
  }, []);

  const toggleBookmark = useCallback((id: string, title: string, type: "article" | "tool") => {
    setBookmarks((previous) => {
      const exists = previous.find((bookmark) => bookmark.id === id);
      if (exists) return previous.filter((bookmark) => bookmark.id !== id);
      return [...previous, { id, title, type, savedAt: new Date().toISOString() }];
    });
  }, []);

  const navigate = useCallback((view: string, id?: string) => {
    const paths: Record<string, string> = {
      home: "/",
      tech: "/technology",
      education: "/education",
      tools: "/tools",
      study: "/study",
      about: "/about",
      contact: "/contact",
      privacy: "/privacy",
      terms: "/terms",
      disclaimer: "/disclaimer",
      admin: "/admin",
    };
    let target = paths[view] ?? "/";
    if (view === "article" && id) {
      const article = ARTICLES.find((item) => item.id === id);
      if (article) target = `/articles/${encodeURIComponent(article.slug)}`;
    } else if (view === "tool-detail" && id) {
      const tool = TOOLS.find((item) => item.id === id);
      if (tool) target = `/tools/${encodeURIComponent(tool.slug)}`;
    }
    navigateTo(target);
    window.scrollTo(0, 0);
  }, [navigateTo]);

  const activeView = (() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "articles") {
      const article = ARTICLES.find((item) => item.slug === parts[1]);
      return article?.category === "technology" ? "tech" : "education";
    }
    if (parts[0] === "tools") return "tools";
    const routeViews: Record<string, string> = {
      "": "home",
      technology: "tech",
      education: "education",
      study: "study",
      about: "about",
      contact: "contact",
      privacy: "privacy",
      terms: "terms",
      disclaimer: "disclaimer",
      admin: "admin",
    };
    return routeViews[parts[0]] ?? "";
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        activeView={activeView}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenBookmarks={() => setBookmarksOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark((current) => !current)}
        bookmarkCount={bookmarks.length}
      />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={navigate} />
      <BookmarksModal
        isOpen={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        bookmarks={bookmarks}
        onToggleBookmark={toggleBookmark}
        onNavigate={navigate}
      />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage navigate={navigate} />} />
          <Route path="/technology" element={<TechnologyPage navigate={navigate} />} />
          <Route path="/education" element={<EducationPage navigate={navigate} />} />
          <Route path="/tools" element={<ToolsPage navigate={navigate} />} />
          <Route path="/study" element={<StudentSpacePage />} />
          <Route path="/articles/:slug" element={<ArticleRoute navigate={navigate} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />} />
          <Route path="/tools/:slug" element={<ToolRoute navigate={navigate} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />} />
          <Route path="/about" element={<AboutPage navigate={navigate} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />
          <Route path="/admin" element={<AdminPanel onBack={() => navigate("home")} />} />
          <Route path="/tech" element={<Navigate to="/technology" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {syncState !== "live" && (
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card/95 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur">
          <span className={`h-2 w-2 rounded-full ${syncState === "loading" ? "animate-pulse bg-amber-500" : "bg-muted-foreground"}`} />
          {syncState === "loading" ? "Syncing content..." : "Offline cache · local guides"}
        </div>
      )}
      {activeView !== "admin" && <Footer onNavigate={navigate} />}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
