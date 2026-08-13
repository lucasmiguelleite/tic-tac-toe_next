import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import HomeView from "./HomeView";

export const metadata: Metadata = {
  description:
    "Free tic-tac-toe you can play three ways: beat the AI across 3 difficulty levels, share a device for local 2-player, or match with a friend online. Gamified board styles and sounds.",
  alternates: { canonical: "/" },
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.titleDefault,
    description: siteConfig.description,
  },
};

export default function Page() {
  return <HomeView />;
}
