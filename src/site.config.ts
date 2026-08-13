/**
 * Site-wide configuration — single source of truth consumed by metadata,
 * sitemap, robots, manifest, and the dynamic OG image / icon.
 *
 * Set NEXT_PUBLIC_SITE_URL on Vercel (e.g. https://tic-tac-toe.example.com)
 * to get correct canonical URLs, sitemap entries and OpenGraph links.
 */
const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
  "https://tic-tac-toe.vercel.app";

export const siteConfig = {
  url: rawUrl,
  /** Absolute URL helper, e.g. absoluteUrl("/single-player") */
  absoluteUrl: (path = "/") =>
    `${rawUrl}${path.startsWith("/") ? path : `/${path}`}`,
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
