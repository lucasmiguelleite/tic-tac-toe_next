/**
 * Site-wide configuration — single source of truth consumed by metadata,
 * sitemap, robots, manifest, and the dynamic OG image / icon.
 *
 * Set NEXT_PUBLIC_SITE_URLS on Vercel with one or more comma- or
 * whitespace-separated URLs (e.g. https://tic-tac-toe.example.com,
 * https://www.tic-tac-toe.example.com). The first URL is canonical and is
 * used for metadata, sitemap entries and OpenGraph links.
 */
const DEFAULT_SITE_URL = "https://tic-tac-toe.vercel.app";

const siteUrls = (
  process.env.NEXT_PUBLIC_SITE_URLS?.split(/[\s,]+/) ?? [DEFAULT_SITE_URL]
)
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const urls = siteUrls.length > 0 ? siteUrls : [DEFAULT_SITE_URL];
const canonicalUrl = urls[0];

export const siteConfig = {
  /** Canonical URL — retained for consumers that need a single origin. */
  url: canonicalUrl,
  /** All configured public origins, with the canonical URL first. */
  urls,
  /** Absolute canonical URL helper, e.g. absoluteUrl("/single-player") */
  absoluteUrl: (path = "/") =>
    `${canonicalUrl}${path.startsWith("/") ? path : `/${path}`}`,
  /** An absolute URL for every configured public origin. */
  absoluteUrls: (path = "/") =>
    urls.map((url) => `${url}${path.startsWith("/") ? path : `/${path}`}`),
  name: "Tic-Tac-Toe",
  shortName: "Tic-Tac-Toe",
  titleDefault: "Tic-Tac-Toe — Play Free Online & Multiplayer Game",
  description:
    "Play Tic-Tac-Toe for free: challenge an AI with 3 difficulty levels, play 2 players locally, or match online. A gamified board with multiple styles and sounds.",
  keywords: [
    "tic tac toe",
    "tic-tac-toe",
    "jogo da velha",
    "tic tac toe online",
    "play tic tac toe",
    "tic tac toe multiplayer",
    "tic tac toe ai",
    "2 player tic tac toe",
    "free online game",
    "browser game",
  ],
  author: {
    name: "Lucas",
    url: "https://github.com/lucasmiguelleite",
  },
  locale: "en_US",
  alternateLocale: "pt_BR",
  /** Background colors from globals.css (`:root` light / `.dark`) */
  themeColor: { light: "#ffffff", dark: "#0a0a0a" },
  /** Brand accents reused by the generated OG image and icon */
  accent: { blue: "#2563eb", yellow: "#facc15", cyan: "#22d3ee" },
  /** Public routes surfaced in the sitemap */
  routes: ["/", "/single-player", "/two-players-local", "/online"] as const,
} as const;

export type SiteConfig = typeof siteConfig;
