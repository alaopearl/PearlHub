import { toast } from "sonner";
import { supabase } from "./client";
import { ARTICLES, AUTHORS, TOOLS } from "../../mockData";
import type {
  Article,
  ArticleSection,
  Author,
  ContactForm,
  ToolFAQ,
  ToolInput,
  ToolItem,
} from "../../types";

export type SyncState = "loading" | "live" | "fallback";

let syncState: SyncState = "loading";
export const getSyncState = (): SyncState => syncState;

type Row = Record<string, any>;

const mapAuthor = (r: Row): Author => ({
  id: String(r.id),
  name: r.name ?? "",
  title: r.title ?? "",
  avatar: r.avatar ?? "",
  bio: r.bio ?? "",
});

const mapArticle = (r: Row): Article => ({
  id: String(r.id),
  title: r.title ?? "",
  slug: r.slug ?? "",
  excerpt: r.excerpt ?? "",
  content: (Array.isArray(r.content) ? r.content : []) as ArticleSection[],
  category: r.category === "education" ? "education" : "technology",
  subcategory: r.subcategory ?? "",
  authorId: r.author_id ?? "",
  date: r.published_at ?? "",
  readTime: Number(r.read_time ?? 5),
  tags: Array.isArray(r.tags) ? r.tags : [],
  featured: Boolean(r.featured),
  gradient: r.gradient ?? "from-primary to-primary",
  difficulty: r.difficulty ?? "all-levels",
});

const mapTool = (r: Row): ToolItem => ({
  id: String(r.id),
  name: r.name ?? "",
  slug: r.slug ?? "",
  description: r.description ?? "",
  category: r.category ?? "",
  icon: r.icon ?? "Wrench",
  formula: r.formula ?? "",
  howToUse: Array.isArray(r.how_to_use) ? r.how_to_use : [],
  inputs: (Array.isArray(r.inputs) ? r.inputs : []) as ToolInput[],
  faq: (Array.isArray(r.faq) ? r.faq : []) as ToolFAQ[],
  relatedArticleIds: Array.isArray(r.related_article_ids) ? r.related_article_ids : [],
});

/**
 * Hydrates the local content store with live rows from Supabase.
 * Falls back to the bundled seed content when the network or tables are unavailable.
 */
export async function loadContent(): Promise<SyncState> {
  try {
    const [articlesRes, toolsRes, authorsRes] = await Promise.all([
      supabase.from("articles").select("*").order("published_at", { ascending: false }),
      supabase.from("tools").select("*").order("name", { ascending: true }),
      supabase.from("authors").select("*").order("name", { ascending: true }),
    ]);

    if (articlesRes.error) throw articlesRes.error;
    if (toolsRes.error) throw toolsRes.error;
    if (authorsRes.error) throw authorsRes.error;

    const articles = (articlesRes.data ?? []).map(mapArticle);
    const tools = (toolsRes.data ?? []).map(mapTool);
    const authors = (authorsRes.data ?? []).map(mapAuthor);

    if (articles.length === 0 || tools.length === 0) {
      syncState = "fallback";
      return syncState;
    }

    if (authors.length > 0) AUTHORS.splice(0, AUTHORS.length, ...authors);
    ARTICLES.splice(0, ARTICLES.length, ...articles);
    TOOLS.splice(0, TOOLS.length, ...tools);

    syncState = "live";
    return syncState;
  } catch (error) {
    syncState = "fallback";
    const message = error instanceof Error ? error.message : String(error);
    toast.error(`Live content unavailable: ${message}. Showing cached guides.`);
    return syncState;
  }
}

export async function submitContactMessage(payload: ContactForm): Promise<void> {
  const { error } = await supabase.from("contact_messages").insert({
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    category: payload.category,
    message: payload.message,
  });
  if (error) throw error;
}

export async function subscribeNewsletter(email: string): Promise<"subscribed" | "exists"> {
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });
  if (error) {
    if (error.code === "23505") return "exists";
    throw error;
  }
  return "subscribed";
}

export interface SiteStats {
  articles: number;
  tools: number;
  authors: number;
}

export function getSiteStats(): SiteStats {
  return { articles: ARTICLES.length, tools: TOOLS.length, authors: AUTHORS.length };
}