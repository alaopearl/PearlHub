import { useState, useEffect } from "react";
import { Search, Sun, Moon, Menu, X, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Home", view: "home" },
  { label: "Technology", view: "tech" },
  { label: "Education", view: "education" },
  { label: "Online Tools", view: "tools" },
  { label: "Study Space", view: "study" },
  { label: "About", view: "about" },
  { label: "Contact", view: "contact" },
  { label: "Admin", view: "admin" },
];

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenSearch: () => void;
  onOpenBookmarks: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  bookmarkCount: number;
}

export default function Navbar({ activeView, onNavigate, onOpenSearch, onOpenBookmarks, isDark, onToggleTheme, bookmarkCount }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-navy/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => { onNavigate("home"); setMobileOpen(false); }}
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="h-9 rounded-lg bg-black px-2 py-1 flex items-center shadow-md shadow-black/20 group-hover:scale-105 transition-transform">
              <img src="https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/attachments/2279f60b-da80-4165-b5eb-bcd80ff90107/1793990664534_PearlHub_Tech_Learning_Logo.webp" alt="PearlHub Tech Learning" className="h-7 w-auto" />
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.view}
                onClick={() => onNavigate(link.view)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeView === link.view
                    ? "bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/20 dark:text-brand-purple-light"
                    : "text-text-secondary hover:text-text-primary dark:hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-text-secondary hover:border-brand-purple/40 hover:text-brand-purple transition-colors text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-[10px] font-mono">
                Ctrl K
              </kbd>
            </button>
            <button
              onClick={onOpenSearch}
              className="sm:hidden p-2 rounded-lg text-text-secondary hover:text-brand-purple transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenBookmarks}
              className="relative p-2 rounded-lg text-text-secondary hover:text-brand-purple transition-colors"
              aria-label="Saved items"
            >
              <Bookmark className="w-5 h-5" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-brand-purple text-white text-[10px] font-bold leading-none">
                  {bookmarkCount}
                </span>
              )}
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-text-secondary hover:text-brand-purple transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-brand-purple transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white dark:bg-navy-deep border-t border-gray-100 dark:border-white/5 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.view}
                  onClick={() => { onNavigate(link.view); setMobileOpen(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === link.view
                      ? "bg-brand-purple/10 text-brand-purple"
                      : "text-text-secondary hover:text-text-primary dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}