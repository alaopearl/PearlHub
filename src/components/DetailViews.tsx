import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, ArrowLeft, BookOpen, Wrench, Clock, Calendar, Tag,
  ChevronRight, ChevronDown, ChevronUp, Copy, Share2,
  Percent, GraduationCap, Layers, Type, Hash, Clipboard, Calculator,
  Scale, ArrowLeftRight, QrCode, Lightbulb, Check, Bookmark, BookmarkCheck,
} from "lucide-react";
import { ARTICLES, TOOLS, AUTHORS } from "../mockData";
import type { ArticleSection, Bookmark as BookmarkType } from "../types";
import { QrStudio } from "./QrStudio";
import { StatisticsSuite } from "./StatisticsSuite";
import { calculateTool, type CalcResult } from "./ToolCalculations";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Percent, GraduationCap, Layers, Calendar, Type, Hash, Clipboard,
  Calculator, Scale, ArrowLeftRight, QrCode, Tag, BookOpen, Wrench,
};

/* ─── ARTICLE READER ─── */
function ContentBlock({ block }: { block: ArticleSection }) {
  if (block.type === "heading") {
    return <h2 className="mt-8 mb-3 text-xl font-bold text-foreground">{block.content}</h2>;
  }
  if (block.type === "code") {
    return (
      <pre className="my-4 overflow-x-auto rounded-lg bg-foreground/5 p-4 text-sm text-foreground border border-border">
        <code>{block.content}</code>
      </pre>
    );
  }
  if (block.type === "callout") {
    return (
      <div className="my-4 flex items-start gap-3 rounded-lg border-l-4 border-primary bg-primary/5 p-4">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-foreground">{block.content}</p>
      </div>
    );
  }
  if (block.type === "list") {
    const items = Array.isArray(block.content) ? block.content : block.items ?? [];
    return (
      <ul className="my-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="mb-4 leading-relaxed text-muted-foreground">{block.content}</p>;
}

interface DetailPageProps {
  navigate: (v: string, id?: string) => void;
  bookmarks: BookmarkType[];
  onToggleBookmark: (id: string, title: string, type: "article" | "tool") => void;
}

export function ArticleReaderPage({ articleId, navigate, bookmarks, onToggleBookmark }: { articleId: string } & DetailPageProps) {
  const article = ARTICLES.find((a) => a.id === articleId);
  const [copied, setCopied] = useState(false);
  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-40" />
        <h1 className="mb-2 text-xl font-semibold text-foreground">Article not found</h1>
        <button onClick={() => navigate("home")} className="mt-4 text-sm font-medium text-primary hover:underline">Back to Home</button>
      </div>
    );
  }
  const author = AUTHORS.find((a) => a.id === article.authorId);
  const related = ARTICLES.filter((a) => a.id !== article.id && a.subcategory === article.subcategory).slice(0, 3);
  const headings = article.content.filter((b) => b.type === "heading");
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("home")} className="hover:text-foreground transition-colors">Home</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate(article.category === "technology" ? "tech" : "education")} className="hover:text-foreground transition-colors capitalize">{article.category}</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate">{article.title}</span>
      </nav>

      {/* Header */}
      <div className={`mb-6 h-1.5 w-full rounded-full bg-gradient-to-r ${article.gradient}`} />
      <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{article.title}</h1>
      <p className="mb-6 text-lg text-muted-foreground">{article.excerpt}</p>

      {/* Meta */}
      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">{author?.name?.[0] ?? "P"}</div>
          <div>
            <div className="font-medium text-foreground">{author?.name}</div>
            <div className="text-xs">{author?.title}</div>
          </div>
        </div>
        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{article.date}</span>
        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{article.readTime} min read</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy link"}
          </button>
          <button onClick={() => onToggleBookmark(article.id, article.title, "article")} className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs transition-colors ${bookmarks.some((b) => b.id === article.id) ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>
            {bookmarks.some((b) => b.id === article.id) ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
            {bookmarks.some((b) => b.id === article.id) ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ title: article.title, url }).catch(() => {});
              } else {
                navigator.clipboard.writeText(url);
              }
            }}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors"
          >
            <Share2 className="h-3 w-3" /> Share
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
        {/* TOC Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Table of Contents</h3>
            <nav className="space-y-2">
              {headings.map((h, i) => (
                <a key={i} href={`#section-${i}`} className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                  {h.content}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="min-w-0">
          {article.content.map((block, i) => (
            <div key={i} id={block.type === "heading" ? `section-${headings.indexOf(block)}` : undefined}>
              <ContentBlock block={block} />
            </div>
          ))}

          {/* Tags */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
            {article.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <Tag className="h-3 w-3" />{tag}
              </span>
            ))}
          </div>
        </article>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Related Articles</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <button key={r.id} onClick={() => navigate("article", r.id)} className="group text-left rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                <div className={`mb-2 h-1 w-12 rounded-full bg-gradient-to-r ${r.gradient}`} />
                <h3 className="mb-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{r.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />{r.readTime} min
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Back */}
      <div className="mt-8 text-center">
        <button onClick={() => navigate(article.category === "technology" ? "tech" : "education")} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to {article.category === "technology" ? "Technology" : "Education"} Hub
        </button>
      </div>
    </div>
  );
}

/* ─── TOOL DETAIL ─── */
export function ToolDetailPage({ toolId, navigate, bookmarks, onToggleBookmark }: { toolId: string } & DetailPageProps) {
  const tool = TOOLS.find((t) => t.id === toolId);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSteps, setShowSteps] = useState(true);

  if (!tool) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <Wrench className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-40" />
        <h1 className="mb-2 text-xl font-semibold text-foreground">Tool not found</h1>
        <button onClick={() => navigate("tools")} className="mt-4 text-sm font-medium text-primary hover:underline">Back to Tools</button>
      </div>
    );
  }

  const Icon = ICON_MAP[tool.icon] || Wrench;
  const relatedArticles = ARTICLES.filter((a) => tool.relatedArticleIds.includes(a.id));

  const handleCalculate = () => {
    setResult(calculateTool(tool.id, values));
  };
  const _dead = () => {
    const setResult = (_s: string) => {};
    const v = values;
    let output = "";
    try {
      switch (tool.id) {
        case "tool1": {
          const part = parseFloat(v["Part Value"] || "0");
          const whole = parseFloat(v["Whole Value"] || "0");
          if (!whole) { setResult("Error: Whole value cannot be zero."); return; }
          const pct = (part / whole) * 100;
          output = `Percentage: ${part} / ${whole} × 100 = ${pct.toFixed(2)}%

${part} is ${pct.toFixed(2)}% of ${whole}`;
          break;
        }
        case "tool2": {
          const scale = v["Grading Scale"] || "5.0 Scale (Nigerian)";
          const grade = v["Course Grade"] || "A";
          const units = parseFloat(v["Credit Units"] || "0");
          if (!units) { setResult("Error: Credit units must be greater than zero."); return; }
          const pts5: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
          const pts4: Record<string, number> = { A: 4, B: 3, C: 2.5, D: 2, E: 1, F: 0 };
          const gp = scale.includes("4.0") ? (pts4[grade] ?? 0) : (pts5[grade] ?? 0);
          const qp = gp * units;
          output = `Grade: ${grade} → ${gp} points
Units: ${units}
Quality Points: ${gp} × ${units} = ${qp}

GPA for this course: ${gp.toFixed(1)}`;
          break;
        }
        case "tool3": {
          const qp = parseFloat(v["Semester Quality Points"] || "0");
          const tu = parseFloat(v["Semester Total Units"] || "0");
          if (!tu) { setResult("Error: Total units cannot be zero."); return; }
          const cgpa = qp / tu;
          let cls = "Fail";
          if (cgpa >= 4.50) cls = "First Class Honours";
          else if (cgpa >= 3.50) cls = "Second Class Upper (2:1)";
          else if (cgpa >= 2.40) cls = "Second Class Lower (2:2)";
          else if (cgpa >= 1.50) cls = "Third Class";
          else if (cgpa >= 1.00) cls = "Pass";
          output = `CGPA = ${qp} / ${tu} = ${cgpa.toFixed(2)}

Classification: ${cls}`;
          break;
        }
        case "tool4": {
          const dob = v["Date of Birth"] || "";
          if (!dob) { setResult("Error: Please enter your date of birth."); return; }
          const birth = new Date(dob);
          const ref = v["Reference Date"] ? new Date(v["Reference Date"]) : new Date();
          let years = ref.getFullYear() - birth.getFullYear();
          let months = ref.getMonth() - birth.getMonth();
          let days = ref.getDate() - birth.getDate();
          if (days < 0) { months--; days += new Date(ref.getFullYear(), ref.getMonth(), 0).getDate(); }
          if (months < 0) { years--; months += 12; }
          const totalDays = Math.floor((ref.getTime() - birth.getTime()) / 86400000);
          output = `Age: ${years} years, ${months} months, ${days} days
Total days lived: ${totalDays.toLocaleString()}
Total weeks: ${Math.floor(totalDays / 7).toLocaleString()}`;
          break;
        }
        case "tool5": {
          const text = v["Your Text"] || "";
          const words = text.trim() ? text.trim().split(/\s+/).length : 0;
          const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0;
          const nl = String.fromCharCode(10);
          const paragraphs = text.trim() ? text.trim().split(new RegExp(`${nl}\\s*${nl}`)).filter((p) => p.trim()).length : 0;
          const chars = text.length;
          const readMin = Math.ceil(words / 200);
          output = `Words: ${words}
Sentences: ${sentences}
Paragraphs: ${paragraphs}
Characters: ${chars}
Reading time: ~${readMin} min (at 200 WPM)`;
          break;
        }
        case "tool6": {
          const text = v["Your Text"] || "";
          const ws = text.length;
          const ns = text.replace(/\s/g, "").length;
          const tw = ws <= 280 ? "✓ Within 280 limit" : `✗ Over by ${ws - 280}`;
          const ig = ws <= 2200 ? "✓ Within 2,200 limit" : `✗ Over by ${ws - 2200}`;
          const sms = ws <= 160 ? "✓ Single SMS" : `⚠ ${Math.ceil(ws / 160)} SMS segments`;
          output = `Characters (with spaces): ${ws}
Characters (without spaces): ${ns}
Twitter (280): ${tw}
Instagram (2,200): ${ig}
SMS (160): ${sms}`;
          break;
        }
        case "tool7": {
          const text = v["Input Text"] || "";
          const tc = v["Target Case"] || "UPPERCASE";
          let res = text;
          if (tc === "UPPERCASE") res = text.toUpperCase();
          else if (tc === "lowercase") res = text.toLowerCase();
          else if (tc === "Title Case") res = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          else if (tc === "camelCase") res = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
          else if (tc === "snake_case") res = text.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
          else if (tc === "kebab-case") res = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
          output = `Input: "${text}"
Target: ${tc}

Result: ${res}`;
          break;
        }
        case "tool8": {
          const input = v["Numbers"] || "";
          const nums = input.split(/[,\s]+/).map(Number).filter((n) => !isNaN(n) && n !== 0 || n === 0);
          if (!nums.length) { setResult("Error: Enter valid numbers separated by commas."); return; }
          const sum = nums.reduce((a, b) => a + b, 0);
          const mean = sum / nums.length;
          const sorted = [...nums].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
          const freq: Record<string, number> = {};
          nums.forEach((n) => { freq[String(n)] = (freq[String(n)] || 0) + 1; });
          const maxF = Math.max(...Object.values(freq));
          const modes = Object.entries(freq).filter(([, c]) => c === maxF).map(([k]) => k);
          output = `Count: ${nums.length}
Sum: ${sum}
Mean: ${mean.toFixed(2)}
Median: ${median.toFixed(2)}
Mode: ${maxF > 1 ? modes.join(", ") : "No mode (all unique)"}
Min: ${sorted[0]}
Max: ${sorted[sorted.length - 1]}`;
          break;
        }
        case "tool9": {
          const price = parseFloat(v["Original Price"] || "0");
          const disc = parseFloat(v["Discount Percentage"] || "0");
          if (!price) { setResult("Error: Enter the original price."); return; }
          const savings = price * (disc / 100);
          const final = price - savings;
          output = `Original Price: ₦${price.toLocaleString()}
Discount: ${disc}%
You Save: ₦${savings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
Final Price: ₦${final.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
          break;
        }
        case "tool10": {
          const p = parseFloat(v["Loan Amount"] || "0");
          const ar = parseFloat(v["Annual Interest Rate (%)"] || "0");
          const n = parseFloat(v["Tenure (Months)"] || "0");
          if (!p || !n) { setResult("Error: Enter loan amount and tenure."); return; }
          const r = ar / 100 / 12;
          const mp = r === 0 ? p / n : p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
          const total = mp * n;
          const interest = total - p;
          output = `Loan: ₦${p.toLocaleString()}
Rate: ${ar}%/yr (${r.toFixed(4)}%/mo)
Tenure: ${n} months

Monthly Payment: ₦${mp.toLocaleString(undefined, { maximumFractionDigits: 2 })}
Total Repayment: ₦${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
Total Interest: ₦${interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
          break;
        }
        case "tool11": {
          const cat = v["Category"] || "";
          const val = parseFloat(v["Value"] || "0");
          const from = (v["From Unit"] || "").toLowerCase().trim();
          const to = (v["To Unit"] || "").toLowerCase().trim();
          if (!val || !from || !to) { setResult("Error: Fill all fields (Category, Value, From, To)."); return; }
          if (cat === "Temperature") {
            let c = from === "c" ? val : from === "f" ? (val - 32) * 5 / 9 : from === "k" ? val - 273.15 : NaN;
            if (isNaN(c)) { setResult("Error: Use C, F, or K for temperature."); return; }
            const r2 = to === "c" ? c : to === "f" ? c * 9 / 5 + 32 : to === "k" ? c + 273.15 : NaN;
            if (isNaN(r2)) { setResult("Error: Use C, F, or K for temperature."); return; }
            output = `${val}°${from.toUpperCase()} = ${r2.toFixed(2)}°${to.toUpperCase()}`;
          } else {
            const lf: Record<string, number> = { m: 1, km: 1000, cm: 0.01, mm: 0.001, miles: 1609.34, ft: 0.3048, in: 0.0254, yd: 0.9144 };
            const wf: Record<string, number> = { kg: 1, g: 0.001, mg: 0.000001, lbs: 0.453592, oz: 0.0283495, tons: 1000 };
            const df: Record<string, number> = { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 };
            const fac = cat === "Length" ? lf : cat === "Weight" ? wf : cat === "Data Storage" ? df : null;
            if (!fac) { setResult("Error: Select a valid category."); return; }
            const ff = fac[from], tf = fac[to];
            if (!ff || !tf) { setResult(`Error: Unknown unit. Valid: ${Object.keys(fac).join(", ")}`); return; }
            output = `${val} ${from.toUpperCase()} = ${(val * ff / tf).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to.toUpperCase()}`;
          }
          break;
        }
        case "tool12": {
          const text = v["URL or Text"] || "";
          const ec = v["Error Correction"] || "Medium (15%)";
          if (!text) { setResult("Error: Enter a URL or text to encode."); return; }
          output = `QR Code Configuration:

Content: ${text}
Error Correction: ${ec}
Encoding: UTF-8
Standard: ISO/IEC 18004

Note: Actual QR image rendering requires a server-side or canvas library.
This tool validates and configures your QR parameters.`;
          break;
        }
        default:
          output = `Formula: ${tool.formula}
Inputs: ${tool.inputs.map((i) => `${i.label}: ${v[i.label] || "(empty)"}`).join(", ")}`;
      }
    } catch {
      output = "Error: Invalid input. Please check your values and try again.";
    }
    void v; void output;
  };
  void _dead;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("home")} className="hover:text-foreground transition-colors">Home</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate("tools")} className="hover:text-foreground transition-colors">Tools</button>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{tool.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{tool.name}</h1>
          <p className="mt-1 text-muted-foreground">{tool.description}</p>
          <span className="mt-2 inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{tool.category}</span>
        </div>
        <button onClick={() => onToggleBookmark(tool.id, tool.name, "tool")} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${bookmarks.some((b) => b.id === tool.id) ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>
          {bookmarks.some((b) => b.id === tool.id) ? <BookmarkCheck className="mr-1 inline h-3.5 w-3.5" /> : <Bookmark className="mr-1 inline h-3.5 w-3.5" />}
          {bookmarks.some((b) => b.id === tool.id) ? "Saved" : "Save"}
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Calculator */}
        <div>
          {tool.id === "tool12" ? (
            <QrStudio />
          ) : tool.id === "tool8" ? (
            <StatisticsSuite />
          ) : (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Calculator</h2>
            <div className="space-y-4">
              {tool.inputs.map((inp) => (
                <div key={inp.label}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{inp.label}</label>
                  {inp.type === "select" ? (
                    <select
                      value={values[inp.label] || ""}
                      onChange={(e) => setValues({ ...values, [inp.label]: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">{inp.placeholder}</option>
                      {inp.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : inp.type === "textarea" ? (
                    <textarea
                      value={values[inp.label] || ""}
                      onChange={(e) => setValues({ ...values, [inp.label]: e.target.value })}
                      placeholder={inp.placeholder}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    />
                  ) : (
                    <input
                      type={inp.type}
                      value={values[inp.label] || ""}
                      onChange={(e) => setValues({ ...values, [inp.label]: e.target.value })}
                      placeholder={inp.placeholder}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  )}
                </div>
              ))}
              <button onClick={handleCalculate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Calculate <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="mb-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{result.headline}</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{result.headlineValue}</p>
                </div>
                {result.steps.length > 0 && (
                  <div className="mb-4">
                    <button onClick={() => setShowSteps(!showSteps)} className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      {showSteps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />} Step-by-Step Breakdown
                    </button>
                    {showSteps && (
                      <div className="mt-2 space-y-2">
                        {result.steps.map((step, i) => (
                          <div key={i} className="rounded-lg border border-border/50 bg-background p-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                              <span className="text-xs font-medium text-foreground">{step.label}</span>
                            </div>
                            <p className="mt-1 pl-7 text-[11px] text-muted-foreground">{step.expression}</p>
                            <p className="mt-0.5 pl-7 text-xs font-semibold text-foreground">{step.result}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {result.interpretation && (
                  <div className="mb-3 rounded-lg bg-background p-3">
                    <p className="text-xs font-semibold text-foreground">What this means</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{result.interpretation}</p>
                  </div>
                )}
                {result.tips.length > 0 && (
                  <div className="rounded-lg bg-background p-3">
                    <p className="flex items-center gap-1 text-xs font-semibold text-foreground"><Lightbulb className="h-3 w-3 text-amber-500" /> Tips & Context</p>
                    <ul className="mt-1.5 space-y-1">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>
          )}

          {/* How to Use */}
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">How to Use</h2>
            <ol className="space-y-3">
              {tool.howToUse.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <span className="text-sm text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* FAQ */}
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {tool.faq.map((faq, i) => (
                <div key={i} className="rounded-lg border border-border">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {faq.question}
                    {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden px-4 pb-3">
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Formula</h3>
            <code className="block rounded-lg bg-foreground/5 p-3 text-xs text-foreground break-all">{tool.formula}</code>
          </div>

          {relatedArticles.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Related Articles</h3>
              <div className="space-y-3">
                {relatedArticles.map((a) => (
                  <button key={a.id} onClick={() => navigate("article", a.id)} className="block w-full text-left group">
                    <div className={`mb-1.5 h-0.5 w-8 rounded-full bg-gradient-to-r ${a.gradient}`} />
                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors line-clamp-2">{a.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">More Tools</h3>
            <div className="space-y-2">
              {TOOLS.filter((t) => t.id !== tool.id && t.category === tool.category).slice(0, 4).map((t) => (
                <button key={t.id} onClick={() => navigate("tool-detail", t.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}