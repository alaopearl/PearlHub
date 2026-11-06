import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, FileText, Wrench, ArrowRight, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ARTICLES, TOOLS } from "../mockData";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, id?: string) => void;
}

type FilterTab = "all" | "articles" | "tools";

export default function GlobalSearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setFilter("all");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const items: Array<{ type: "article" | "tool"; id: string; title: string; subtitle: string }> = [];

    if (filter === "all" || filter === "articles") {
      ARTICLES.forEach((a) => {
        if (
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.subcategory.toLowerCase().includes(q)
        ) {
          items.push({ type: "article", id: a.id, title: a.title, subtitle: a.subcategory });
        }
      });
    }

    if (filter === "all" || filter === "tools") {
      TOOLS.forEach((t) => {
        if (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        ) {
          items.push({ type: "tool", id: t.id, title: t.name, subtitle: t.category });
        }
      });
    }

    return items.slice(0, 10);
  }, [query, filter]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      const r = results[selectedIndex];
      onNavigate(r.type === "article" ? "article" : "tool-detail", r.id);
      onClose();
    }
  };

  const handleResultClick = (type: "article" | "tool", id: string) => {
    onNavigate(type === "article" ? "article" : "tool-detail", id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white dark:bg-navy-deep rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/10">
              <Search className="w-5 h-5 text-text-secondary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search articles, tools, topics..."
                className="flex-1 bg-transparent text-text-primary dark:text-white text-sm placeholder:text-gray-400 focus:outline-none"
              />
              <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 dark:border-white/10">
              {(["all", "articles", "tools"] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                    filter === tab
                      ? "bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/20"
                      : "text-text-secondary hover:text-text-primary dark:hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {query.trim() && results.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <Tag className="w-8 h-8 text-gray-300 dark:text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No results found for "{query}"</p>
                </div>
              )}
              {!query.trim() && (
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 text-gray-300 dark:text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Type to search articles and tools</p>
                </div>
              )}
              {results.map((r, i) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => handleResultClick(r.type, r.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    i === selectedIndex
                      ? "bg-brand-purple/5 dark:bg-brand-purple/10"
                      : "hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    r.type === "article"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                  }`}>
                    {r.type === "article" ? <FileText className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary dark:text-white truncate">{r.title}</p>
                    <p className="text-xs text-text-secondary">{r.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 dark:border-white/10 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 font-mono">&uarr;&darr;</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 font-mono">Enter</kbd> open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 font-mono">Esc</kbd> close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
