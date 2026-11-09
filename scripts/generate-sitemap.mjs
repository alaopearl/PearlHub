import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const env = loadEnv("production", root, "");
const configuredUrl = env.VITE_SITE_URL || process.env.SITE_URL || "https://pearlhub.com";
const siteUrl = new URL(configuredUrl);
if (!["http:", "https:"].includes(siteUrl.protocol)) {
  throw new Error("VITE_SITE_URL must use http or https.");
}
const origin = siteUrl.origin.replace(/\/+$/, "");
const source = await readFile(resolve(root, "src/mockData.ts"), "utf8");
const articleSection = source.split("export const ARTICLES")[1]?.split("export const TOOLS")[0];
const toolSection = source.split("export const TOOLS")[1];
if (!articleSection || !toolSection) {
  throw new Error("Could not locate article and tool data for sitemap generation.");
}

const slugsFrom = (section) => [...section.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
const routes = [
  "/",
  "/technology",
  "/education",
  "/tools",
  "/study",
  "/about",
  "/contact",
  ...slugsFrom(articleSection).map((slug) => `/articles/${encodeURIComponent(slug)}`),
  ...slugsFrom(toolSection).map((slug) => `/tools/${encodeURIComponent(slug)}`),
];
const xmlEscape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .map((route) => `  <url><loc>${xmlEscape(`${origin}${route}`)}</loc></url>`)
  .join("\n")}\n</urlset>\n`;
const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${origin}/sitemap.xml\n`;

await writeFile(resolve(root, "public/sitemap.xml"), sitemap, "utf8");
await writeFile(resolve(root, "public/robots.txt"), robots, "utf8");
console.log(`Generated sitemap with ${routes.length} routes for ${origin}.`);
