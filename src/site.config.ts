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
  seo: {
    /** English remains the default metadata until locale-specific URLs exist. */
    en: {
      home: {
        description:
          "Free tic-tac-toe you can play three ways: beat the AI across 3 difficulty levels, share a device for local 2-player, or match with a friend online. Gamified board styles and sounds.",
      },
      singlePlayer: {
        title: "Play vs AI",
        description:
          "Play tic-tac-toe against the computer. Choose your side (X or O) and take on three AI difficulty levels — Easy, Medium and a Hard mode that plays a perfect game.",
        openGraphTitle: "Play Tic-Tac-Toe vs AI — 3 Difficulty Levels",
        openGraphDescription:
          "Challenge the tic-tac-toe AI on Easy, Medium or Hard and pick your mark (X or O).",
      },
      local: {
        title: "2 Players Local",
        description:
          "Play tic-tac-toe with a friend on the same device. Pass-and-play local 2-player mode with instant restarts and gamified board styles.",
        openGraphTitle: "Tic-Tac-Toe — Local 2 Players on One Device",
        openGraphDescription:
          "Pass-and-play tic-tac-toe for two players on the same screen.",
      },
      online: {
        title: "Online Multiplayer",
        description:
          "Play tic-tac-toe online against a friend or a random opponent. Quick-match matchmaking, private room codes, live sync and instant rematches — no sign-up required.",
        openGraphTitle: "Tic-Tac-Toe — Online Multiplayer (Quick Match & Rooms)",
        openGraphDescription:
          "Match with a random opponent or create a private room and invite a friend. Real-time online tic-tac-toe.",
      },
    },
    ptBR: {
      home: {
        title: "Jogo da Velha Online Grátis — IA, 2 Jogadores e Multiplayer",
        description:
          "Jogue jogo da velha grátis de três formas: desafie a IA em 3 níveis, jogue localmente com 2 pessoas ou enfrente amigos online. Tabuleiros personalizados e sons.",
      },
      singlePlayer: {
        title: "Jogo da Velha contra a IA",
        description:
          "Jogue jogo da velha contra o computador. Escolha X ou O e desafie a IA nos níveis fácil, médio ou difícil — o modo difícil joga perfeitamente.",
        openGraphTitle: "Jogo da Velha contra a IA — 3 níveis de dificuldade",
        openGraphDescription:
          "Desafie a IA no jogo da velha nos níveis fácil, médio ou difícil e escolha sua peça: X ou O.",
      },
      local: {
        title: "Jogo da Velha para 2 Jogadores",
        description:
          "Jogue jogo da velha com um amigo no mesmo dispositivo. Modo local para 2 jogadores, reinício instantâneo e tabuleiros personalizados.",
        openGraphTitle: "Jogo da Velha — 2 Jogadores no Mesmo Dispositivo",
        openGraphDescription:
          "Jogo da velha para duas pessoas na mesma tela: jogue alternando as peças e reinicie na hora.",
      },
      online: {
        title: "Jogo da Velha Multiplayer Online",
        description:
          "Jogue jogo da velha online contra amigos ou adversários aleatórios. Busca rápida, salas privadas, sincronização em tempo real e revanche instantânea — sem cadastro.",
        openGraphTitle: "Jogo da Velha Multiplayer Online — Partida Rápida e Salas",
        openGraphDescription:
          "Encontre um adversário ou crie uma sala privada para convidar amigos e jogar jogo da velha online em tempo real.",
      },
    },
  },
  /** Background colors from globals.css (`:root` light / `.dark`) */
  themeColor: { light: "#ffffff", dark: "#0a0a0a" },
  /** Brand accents reused by the generated OG image and icon */
  accent: { blue: "#2563eb", yellow: "#facc15", cyan: "#22d3ee" },
  /** Public routes surfaced in the sitemap */
  routes: ["/", "/single-player", "/two-players-local", "/online"] as const,
} as const;

export type SiteConfig = typeof siteConfig;
