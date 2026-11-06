import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark, FileText, Wrench, ArrowRight, Trash2 } from "lucide-react";
import type { Bookmark as BookmarkType } from "../types";

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkType[];
  onToggleBookmark: (id: string, title: string, type: "article" | "tool") => void;
  onNavigate: (view: string, id?: string) => void;
}

export default function BookmarksModal({ isOpen, onClose, bookmarks, onToggleBookmark, onNavigate }: BookmarksModalProps) {
  const open = (b: BookmarkType) => {
    onNavigate(b.type === "article" ? "article" : "tool-detail", b.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-navy-deep"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-brand-purple" />
                <h2 className="text-sm font-semibold text-text-primary dark:text-white">
                  Saved Items
                </h2>
                <span className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-[11px] font-medium text-brand-purple">
                  {bookmarks.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                aria-label="Close saved items"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {bookmarks.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <Bookmark className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-white/20" />
                  <p className="text-sm text-text-secondary">No saved items yet.</p>
                  <p className="mt-1 text-xs text-text-secondary/70">
                    Tap Save on any article or tool to keep it here.
                  </p>
                </div>
              )}

              {bookmarks.map((b) => (
                <div
                  key={`${b.type}-${b.id}`}
                  className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      b.type === "article"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}
                  >
                    {b.type === "article" ? <FileText className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                  </div>
                  <button onClick={() => open(b)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium text-text-primary dark:text-white">
                      {b.title}
                    </p>
                    <p className="text-xs capitalize text-text-secondary">
                      {b.type} &middot; {new Date(b.savedAt).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    onClick={() => onToggleBookmark(b.id, b.title, b.type)}
                    className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    aria-label={`Remove ${b.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-brand-purple" />
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}