import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import TwoPlayersView from "./TwoPlayersLocalView";

export const metadata: Metadata = {
  title: "2 Players Local",
  description:
    "Play tic-tac-toe with a friend on the same device. Pass-and-play local 2-player mode with instant restarts and gamified board styles.",
  alternates: { canonical: "/two-players-local" },
  openGraph: {
    url: siteConfig.absoluteUrl("/two-players-local"),
    title: "Tic-Tac-Toe — Local 2 Players on One Device",
    description:
      "Pass-and-play tic-tac-toe for two players on the same screen.",
  },
};

export default function Page() {
  return <TwoPlayersView />;
}
