import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import SinglePlayerView from "./SinglePlayerView";

export const metadata: Metadata = {
  title: "Play vs AI",
  description:
    "Play tic-tac-toe against the computer. Choose your side (X or O) and take on three AI difficulty levels — Easy, Medium and a Hard mode that plays a perfect game.",
  alternates: { canonical: "/single-player" },
  openGraph: {
    url: siteConfig.absoluteUrl("/single-player"),
    title: "Play Tic-Tac-Toe vs AI — 3 Difficulty Levels",
    description:
      "Challenge the tic-tac-toe AI on Easy, Medium or Hard and pick your mark (X or O).",
  },
};

export default function Page() {
  return <SinglePlayerView />;
}
