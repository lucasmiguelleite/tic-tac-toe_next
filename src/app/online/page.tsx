import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { isOnlineStorageAvailable } from "@/domain/onlineStorage";
import OnlineView from "./OnlineView";

export const dynamic = 'force-dynamic';

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

export default async function Page() {
  const onlineAvailable = await isOnlineStorageAvailable();

  return <OnlineView onlineAvailable={onlineAvailable} />;
}
