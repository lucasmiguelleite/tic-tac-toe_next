import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import OnlineView from "./OnlineView";

export const metadata: Metadata = {
  title: siteConfig.seo.en.online.title,
  description: siteConfig.seo.en.online.description,
  alternates: { canonical: "/online" },
  openGraph: {
    url: siteConfig.absoluteUrl("/online"),
    title: siteConfig.seo.en.online.openGraphTitle,
    description: siteConfig.seo.en.online.openGraphDescription,
  },
};

export default function Page() {
  return <OnlineView />;
}
