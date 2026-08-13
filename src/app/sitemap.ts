import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: siteConfig.absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: siteConfig.absoluteUrl("/single-player"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: siteConfig.absoluteUrl("/two-players-local"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: siteConfig.absoluteUrl("/online"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
