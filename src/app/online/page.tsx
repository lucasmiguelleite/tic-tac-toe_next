import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import OnlineView from "./OnlineView";

export const metadata: Metadata = {
  title: "Online Multiplayer",
  description:
    "Play tic-tac-toe online against a friend or a random opponent. Quick-match matchmaking, private room codes, live sync and instant rematches — no sign-up required.",
  alternates: { canonical: "/online" },
  openGraph: {
    url: siteConfig.absoluteUrl("/online"),
    title: "Tic-Tac-Toe — Online Multiplayer (Quick Match & Rooms)",
    description:
      "Match with a random opponent or create a private room and invite a friend. Real-time online tic-tac-toe.",
  },
};

export default function Page() {
  return <OnlineView />;
}
