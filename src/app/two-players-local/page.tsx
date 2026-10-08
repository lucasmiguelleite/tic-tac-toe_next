import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import TwoPlayersView from "./TwoPlayersLocalView";

export const metadata: Metadata = {
  title: siteConfig.seo.en.local.title,
  description: siteConfig.seo.en.local.description,
  alternates: { canonical: "/two-players-local" },
  openGraph: {
    url: siteConfig.absoluteUrl("/two-players-local"),
    title: siteConfig.seo.en.local.openGraphTitle,
    description: siteConfig.seo.en.local.openGraphDescription,
  },
};

export default function Page() {
  return <TwoPlayersView />;
}
