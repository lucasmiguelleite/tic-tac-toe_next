import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import SinglePlayerView from "./SinglePlayerView";

export const metadata: Metadata = {
  title: siteConfig.seo.en.singlePlayer.title,
  description: siteConfig.seo.en.singlePlayer.description,
  alternates: { canonical: "/single-player" },
  openGraph: {
    url: siteConfig.absoluteUrl("/single-player"),
    title: siteConfig.seo.en.singlePlayer.openGraphTitle,
    description: siteConfig.seo.en.singlePlayer.openGraphDescription,
  },
};

export default function Page() {
  return <SinglePlayerView />;
}
