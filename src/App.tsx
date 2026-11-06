import { useState, useEffect, useCallback } from "react";
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
} from "./components/PageViews";
import { ArticleReaderPage, ToolDetailPage } from "./components/DetailViews";
import AdminPanel from "./components/AdminPanel";
import { getSyncState, loadContent, type SyncState } from "./integrations/supabase/data";
import type { Bookmark } from "./types";

export default function App() {
  const [view, setView] = useState("home");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("pearlhub-theme");
    return saved === "dark";
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>(getSyncState());
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem("pearlhub-bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("pearlhub-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("pearlhub-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    let active = true;
    loadContent().then((state) => {
      if (active) setSyncState(state);
    });
    return () => { active = false; };
  }, []);

  const toggleBookmark = useCallback((id: string, title: string, type: "article" | "tool") => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.id === id);
      if (exists) return prev.filter((b) => b.id !== id);
      return [...prev, { id, title, type, savedAt: new Date().toISOString() }];
    });
  }, []);

  const navigate = (v: string, id?: string) => {
    setView(v);
    setSelectedId(id);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (view) {
      case "home":
        return <HomePage navigate={navigate} />;
      case "tech":
        return <TechnologyPage navigate={navigate} />;
      case "education":
        return <EducationPage navigate={navigate} />;
      case "tools":
        return <ToolsPage navigate={navigate} />;
      case "tool-detail":
        return <ToolDetailPage toolId={selectedId ?? ""} navigate={navigate} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />;
      case "article":
        return <ArticleReaderPage articleId={selectedId ?? ""} navigate={navigate} bookmarks={bookmarks} onToggleBookmark={toggleBookmark} />;
      case "about":
        return <AboutPage navigate={navigate} />;
      case "contact":
        return <ContactPage />;
      case "privacy":
        return <LegalPage type="privacy" />;
      case "terms":
        return <LegalPage type="terms" />;
      case "disclaimer":
        return <LegalPage type="disclaimer" />;
      case "admin":
        return <AdminPanel onBack={() => navigate("home")} />;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        activeView={view}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenBookmarks={() => setBookmarksOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        bookmarkCount={bookmarks.length}
      />
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={navigate}
      />
      <BookmarksModal
        isOpen={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        bookmarks={bookmarks}
        onToggleBookmark={toggleBookmark}
        onNavigate={navigate}
      />
      <main className="pt-16">{renderPage()}</main>
      {syncState !== "live" && (
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-border bg-card/95 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur">
          <span
            className={`h-2 w-2 rounded-full ${syncState === "loading" ? "animate-pulse bg-amber-500" : "bg-muted-foreground"}`}
          />
          {syncState === "loading" ? "Syncing content..." : "Offline cache · local guides"}
        </div>
      )}
      {view !== "admin" && <Footer onNavigate={navigate} />}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}