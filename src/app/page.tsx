import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import HomeView from "./HomeView";

export const metadata: Metadata = {
  description: siteConfig.seo.en.home.description,
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
