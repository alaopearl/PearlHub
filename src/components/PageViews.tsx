import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, BookOpen, Wrench, Users, Globe, Sparkles,
  Clock, Calendar, Tag, ChevronRight, Send, Mail, Phone, MapPin,
  Heart, Star, Percent, GraduationCap, Layers, Type, Hash, Clipboard,
  Calculator, Scale, ArrowLeftRight, QrCode, Lightbulb, Target, Eye, Shield,
} from "lucide-react";
import { ARTICLES, TOOLS, AUTHORS, SITE_STATS } from "../mockData";
import { toast } from "sonner";
import { submitContactMessage } from "../integrations/supabase/data";
import type { Article, ToolItem } from "../types";
import StudentStudySpace from "./StudentStudySpace";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Percent, GraduationCap, Layers, Calendar, Type, Hash, Clipboard,
  Calculator, Scale, ArrowLeftRight, QrCode, Tag, BookOpen, Wrench,
};

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const author = AUTHORS.find((a) => a.id === article.authorId);
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-md"
      onClick={onClick}
    >
      <div className={`h-2 w-full bg-gradient-to-r ${article.gradient}`} />
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{article.subcategory}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime} min</span>
        </div>
        <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">{author?.name?.[0] ?? "P"}</span>
            {author?.name}
          </span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{article.date}</span>
        </div>
      </div>
    </motion.article>
  );
}

function ToolCard({ tool, onClick }: { tool: ToolItem; onClick: () => void }) {
  const Icon = ICON_MAP[tool.icon] || Wrench;
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/30"
      onClick={onClick}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h3>
      <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{tool.description}</p>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{tool.category}</span>
        <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

function PageHeader({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
      </div>
      <p className="text-muted-foreground max-w-2xl">{subtitle}</p>
    </div>
  );
}

function FilterPills({ items, active, onSelect }: { items: string[]; active: string; onSelect: (s: string) => void }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === item
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function ArticleDiscoveryFilters({ difficulty, onDifficultyChange, readTime, onReadTimeChange, publishedSince, onPublishedSinceChange }: {
  difficulty: string;
  onDifficultyChange: (value: string) => void;
  readTime: string;
  onReadTimeChange: (value: string) => void;
  publishedSince: string;
  onPublishedSinceChange: (value: string) => void;
}) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <select value={difficulty} onChange={(event) => onDifficultyChange(event.target.value)} aria-label="Filter by difficulty" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground outline-none">
        <option value="any">Any difficulty</option><option value="all-levels">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
      </select>
      <select value={readTime} onChange={(event) => onReadTimeChange(event.target.value)} aria-label="Filter by reading time" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground outline-none">
        <option value="any">Any reading time</option><option value="short">5 min or less</option><option value="medium">6–10 minutes</option><option value="long">Over 10 minutes</option>
      </select>
      <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
        Published since
        <input type="date" value={publishedSince} onChange={(event) => onPublishedSinceChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none" />
      </label>
    </div>
  );
}

function matchesArticleDiscovery(article: Article, difficulty: string, readTime: string, publishedSince: string) {
  const difficultyMatches = difficulty === "any" || (article.difficulty ?? "all-levels") === difficulty;
  const readTimeMatches = readTime === "any"
    || (readTime === "short" && article.readTime <= 5)
    || (readTime === "medium" && article.readTime >= 6 && article.readTime <= 10)
    || (readTime === "long" && article.readTime > 10);
  return difficultyMatches && readTimeMatches && (!publishedSince || article.date >= publishedSince);
}

/* ─── HOME ─── */
export function HomePage({ navigate }: { navigate: (v: string, id?: string) => void }) {
  const featured = ARTICLES.filter((a) => a.featured).slice(0, 4);
  const popularTools = TOOLS.slice(0, 4);
  const [recentArticles] = useState(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("pearlhub-recent-articles") ?? "[]");
      return Array.isArray(ids)
        ? ids.map((id) => ARTICLES.find((article) => article.id === id)).filter(Boolean).slice(0, 4) as Article[]
        : [];
    } catch {
      return [];
    }
  });
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Nigeria's Premier Learning Platform
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Learn Smarter.{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Build Better.</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Technology guides, educational resources, and free online tools designed for Nigerian students, professionals, and lifelong learners.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate("tech")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
                Explore Technology <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("tools")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground hover:bg-muted transition-colors">
                Browse Tools <Wrench className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card px-4 py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { label: "Articles", value: `${SITE_STATS.articles}+`, icon: BookOpen },
            { label: "Free Tools", value: `${SITE_STATS.tools}+`, icon: Wrench },
            { label: "Study Guides", value: `${SITE_STATS.guides}+`, icon: GraduationCap },
            { label: "Countries Reached", value: `${SITE_STATS.countries}+`, icon: Globe },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore by category */}
      <section className="px-4 pt-16">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          {[
            { title: "Technology", text: "AI, programming, gadgets, and software guides.", view: "tech", icon: BookOpen },
            { title: "Education", text: "Study resources, scholarships, and academic tools.", view: "education", icon: GraduationCap },
            { title: "Online Tools", text: "Fast calculators and utilities that work on any device.", view: "tools", icon: Wrench },
          ].map((category) => (
            <button
              key={category.title}
              onClick={() => navigate(category.view)}
              className="group rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <category.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-bold text-foreground">{category.title}</h3>
              <p className="mb-4 text-sm text-muted-foreground">{category.text}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </button>
          ))}
        </div>
      </section>

      {recentArticles.length > 0 && (
        <section className="px-4 pt-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">Recently Viewed</h2>
              <p className="mt-1 text-muted-foreground">Pick up where you left off</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} onClick={() => navigate("article", article.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Articles */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Featured Articles</h2>
              <p className="mt-1 text-muted-foreground">Handpicked guides and tutorials</p>
            </div>
            <button onClick={() => navigate("tech")} className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((a) => (
              <ArticleCard key={a.id} article={a} onClick={() => navigate("article", a.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Popular Tools</h2>
              <p className="mt-1 text-muted-foreground">Free calculators and utilities</p>
            </div>
            <button onClick={() => navigate("tools")} className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex">
              All tools <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularTools.map((t) => (
              <ToolCard key={t.id} tool={t} onClick={() => navigate("tool-detail", t.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-primary to-accent p-8 text-center text-white sm:p-12">
          <Lightbulb className="mx-auto mb-4 h-8 w-8" />
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl">Start Learning Today</h2>
          <p className="mb-6 text-white/80">Access hundreds of guides, tools, and resources — completely free.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("education")} className="rounded-lg bg-white px-6 py-3 font-medium text-primary hover:bg-white/90 transition-colors">
              Education Hub
            </button>
            <button onClick={() => navigate("tools")} className="rounded-lg border border-white/30 px-6 py-3 font-medium text-white hover:bg-white/10 transition-colors">
              Free Tools
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── TECHNOLOGY ─── */
export function TechnologyPage({ navigate }: { navigate: (v: string, id?: string) => void }) {
  const techArticles = ARTICLES.filter((a) => a.category === "technology");
  const subs = ["All", ...Array.from(new Set(techArticles.map((a) => a.subcategory)))];
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [difficulty, setDifficulty] = useState("any");
  const [readTime, setReadTime] = useState("any");
  const [publishedSince, setPublishedSince] = useState("");
  const filtered = techArticles
    .filter((a) => filter === "All" || a.subcategory === filter)
    .filter((a) => `${a.title} ${a.excerpt} ${a.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .filter((a) => matchesArticleDiscovery(a, difficulty, readTime, publishedSince))
    .sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "newest") return b.date.localeCompare(a.date);
      return Number(b.featured) - Number(a.featured);
    });
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Technology Hub" subtitle="In-depth guides, tutorials, and reviews covering AI, programming, software, and gadgets." icon={BookOpen} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search technology guides..." className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort technology articles" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground outline-none">
          <option value="featured">Featured first</option><option value="newest">Newest first</option><option value="title">Title A-Z</option>
        </select>
      </div>
      <ArticleDiscoveryFilters
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        readTime={readTime}
        onReadTimeChange={setReadTime}
        publishedSince={publishedSince}
        onPublishedSinceChange={setPublishedSince}
      />
      <FilterPills items={subs} active={filter} onSelect={setFilter} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <ArticleCard key={a.id} article={a} onClick={() => navigate("article", a.id)} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-40" />
          <p>No articles found in this category.</p>
        </div>
      )}
    </div>
  );
}

/* ─── EDUCATION ─── */
export function EducationPage({ navigate }: { navigate: (v: string, id?: string) => void }) {
  const eduArticles = ARTICLES.filter((a) => a.category === "education");
  const subs = ["All", ...Array.from(new Set(eduArticles.map((a) => a.subcategory)))];
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [difficulty, setDifficulty] = useState("any");
  const [readTime, setReadTime] = useState("any");
  const [publishedSince, setPublishedSince] = useState("");
  const filtered = eduArticles
    .filter((a) => filter === "All" || a.subcategory === filter)
    .filter((a) => `${a.title} ${a.excerpt} ${a.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .filter((a) => matchesArticleDiscovery(a, difficulty, readTime, publishedSince))
    .sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "newest") return b.date.localeCompare(a.date);
      return Number(b.featured) - Number(a.featured);
    });
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Education Hub" subtitle="Study guides, exam preparation, scholarship resources, and academic tools for Nigerian students." icon={GraduationCap} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search education guides..." className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort education articles" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground outline-none">
          <option value="featured">Featured first</option><option value="newest">Newest first</option><option value="title">Title A-Z</option>
        </select>
      </div>
      <ArticleDiscoveryFilters
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        readTime={readTime}
        onReadTimeChange={setReadTime}
        publishedSince={publishedSince}
        onPublishedSinceChange={setPublishedSince}
      />
      <FilterPills items={subs} active={filter} onSelect={setFilter} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <ArticleCard key={a.id} article={a} onClick={() => navigate("article", a.id)} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <GraduationCap className="mx-auto mb-3 h-8 w-8 opacity-40" />
          <p>No articles found in this category.</p>
        </div>
      )}
    </div>
  );
}

/* ─── TOOLS DIRECTORY ─── */
export function ToolsPage({ navigate }: { navigate: (v: string, id?: string) => void }) {
  const cats = ["All", ...Array.from(new Set(TOOLS.map((t) => t.category)))];
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");
  const filtered = TOOLS
    .filter((t) => filter === "All" || t.category === filter)
    .filter((t) => `${t.name} ${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === "category" ? a.category.localeCompare(b.category) : a.name.localeCompare(b.name));
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="Online Tools" subtitle="Free calculators, converters, and utilities for students, professionals, and everyday tasks." icon={Wrench} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools..." className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort tools" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground outline-none">
          <option value="name">Name A-Z</option><option value="category">Category</option>
        </select>
      </div>
      <FilterPills items={cats} active={filter} onSelect={setFilter} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <ToolCard key={t.id} tool={t} onClick={() => navigate("tool-detail", t.id)} />
        ))}
      </div>
    </div>
  );
}

/* ─── STUDENT SPACE ─── */
export function StudentSpacePage() {
  return <StudentStudySpace />;
}

/* ─── ABOUT ─── */
export function AboutPage({ navigate }: { navigate: (v: string, id?: string) => void }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader title="About PearlHub" subtitle="Empowering Nigerian learners with world-class educational resources and practical technology tools." icon={Users} />
      <div className="space-y-8">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Target className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Our Mission</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            PearlHub was founded with a simple belief: quality education and practical technology knowledge should be accessible to everyone, regardless of location or economic background. We create in-depth guides, free tools, and learning resources tailored for Nigerian students and professionals while serving a global audience.
          </p>
        </section>
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Eye className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Our Vision</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            To become Africa's most trusted platform for technology education and academic resources, bridging the knowledge gap between global opportunities and local learners.
          </p>
        </section>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Shield, title: "Trusted Content", desc: "Every article is researched, reviewed, and updated regularly." },
            { icon: Globe, title: "Global Reach", desc: "Serving learners in 25+ countries with locally relevant content." },
            { icon: Heart, title: "Free Forever", desc: "All tools and guides remain completely free for everyone." },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-card p-5 text-center">
              <v.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <h3 className="mb-1 font-semibold text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Meet the Team</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {AUTHORS.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{a.name[0]}</div>
                <div>
                  <div className="font-medium text-foreground">{a.name}</div>
                  <div className="text-sm text-muted-foreground">{a.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{a.bio}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="text-center">
          <button onClick={() => navigate("contact")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Get in Touch <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CONTACT ─── */
export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContactMessage({
        name: form.name,
        email: form.email,
        subject: form.subject,
        category: "General",
        message: form.message,
      });
      toast.success("Message sent! We will respond within 24-48 hours.");
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again in a moment.";
      toast.error(`Could not send message: ${message}`);
    }
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader title="Contact Us" subtitle="Have questions, suggestions, or partnership inquiries? We would love to hear from you." icon={Mail} />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {submitted ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
              <Star className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">Message Sent!</h3>
              <p className="text-muted-foreground">Thank you for reaching out. We will respond within 24-48 hours.</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-sm font-medium text-primary hover:underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
                <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="What is this about?" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Tell us more..." />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Send Message <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
        <div className="space-y-4 lg:col-span-2">
          {[
            { icon: Mail, label: "Email", value: "pearlhubweb@gmail.com" },
            { icon: Phone, label: "Phone", value: "+234 808 948 9320" },
            { icon: MapPin, label: "Location", value: "Lagos, Oyo, Nigeria" },
            { icon: Clock, label: "Response Time", value: "Within 24-48 hours" },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{c.label}</div>
                <div className="text-sm text-muted-foreground">{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── LEGAL ─── */
const LEGAL_CONTENT: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      { heading: "Information We Collect", body: "PearlHub collects minimal information to improve your experience. We use anonymized analytics to understand how content is consumed. We do not sell personal data to third parties." },
      { heading: "How We Use Data", body: "Data collected helps us improve content quality, personalize recommendations, and maintain platform security. Contact form submissions are used solely to respond to your inquiry." },
      { heading: "Cookies", body: "We use essential cookies for theme preference and basic functionality. Third-party analytics cookies help us understand usage patterns. You can manage cookie preferences in your browser settings." },
      { heading: "Data Security", body: "We implement industry-standard security measures to protect your information. All data transmission is encrypted using TLS/SSL protocols." },
      { heading: "Your Rights", body: "You have the right to access, correct, or delete any personal information we hold about you. Contact us at hello@pearlhub.ng to exercise these rights." },
    ],
  },
  terms: {
    title: "Terms of Service",
    sections: [
      { heading: "Acceptance of Terms", body: "By accessing PearlHub, you agree to these terms. If you do not agree, please discontinue use of the platform." },
      { heading: "Use of Content", body: "All articles, guides, and tools are provided for educational and informational purposes. You may reference our content with proper attribution. Commercial redistribution requires written permission." },
      { heading: "Intellectual Property", body: "PearlHub content is protected by copyright. The platform name, logo, and original illustrations are trademarks of PearlHub." },
      { heading: "Disclaimer", body: "Tools and calculators are provided as-is for reference purposes. We strive for accuracy but do not guarantee results. Always verify critical calculations independently." },
      { heading: "Limitation of Liability", body: "PearlHub shall not be liable for any damages arising from the use or inability to use our platform or content." },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    sections: [
      { heading: "Educational Purpose", body: "All content on PearlHub is for educational and informational purposes only. It should not be considered professional advice in technology, finance, law, or medicine." },
      { heading: "Accuracy", body: "While we strive for accuracy, technology and academic standards evolve rapidly. Some information may become outdated. Always cross-reference critical information with official sources." },
      { heading: "External Links", body: "PearlHub may contain links to external websites. We are not responsible for the content, accuracy, or practices of linked sites." },
      { heading: "Tool Results", body: "Online calculators and tools provide estimates for reference. Results should not be the sole basis for academic, financial, or professional decisions." },
      { heading: "Affiliate Disclosure", body: "Some links on PearlHub may be affiliate links. We may earn a commission at no additional cost to you. This helps support our free content." },
    ],
  },
};

export function LegalPage({ type }: { type: string }) {
  const content = LEGAL_CONTENT[type] ?? LEGAL_CONTENT.privacy;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader title={content.title} subtitle="Last updated: January 2025" icon={Shield} />
      <div className="space-y-6">
        {content.sections.map((s, i) => (
          <section key={i} className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-2 font-semibold text-foreground">{s.heading}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}