export interface Author {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
}

export interface ArticleSection {
  type: "paragraph" | "heading" | "code" | "callout" | "list";
  content: string | string[];
  items?: string[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: ArticleSection[];
  category: "technology" | "education";
  subcategory: string;
  authorId: string;
  date: string;
  readTime: number;
  tags: string[];
  featured: boolean;
  gradient: string;
}

export interface ToolInput {
  label: string;
  type: "number" | "text" | "select" | "textarea" | "date";
  placeholder: string;
  options?: string[];
}

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  formula: string;
  howToUse: string[];
  inputs: ToolInput[];
  faq: ToolFAQ[];
  relatedArticleIds: string[];
}

export type ViewType =
  | "home"
  | "tech"
  | "education"
  | "tools"
  | "tool-detail"
  | "article"
  | "about"
  | "contact"
  | "privacy"
  | "terms"
  | "disclaimer";

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export interface Bookmark {
  id: string;
  title: string;
  type: "article" | "tool";
  savedAt: string;
}