import { siteConfig } from "@/site.config";

/**
 * JSON-LD structured data for rich results.
 * Server component — rendered once in the root layout.
 */
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": `${siteConfig.url}/#author` },
    },
    {
      "@type": "WebApplication",
      "@id": `${siteConfig.url}/#webapp`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      applicationCategory: "GameApplication",
      operatingSystem: "Any (Web Browser)",
      browserRequirements: "Requires JavaScript",
      inLanguage: ["en", "pt"],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Single player vs AI (Easy, Medium, Hard)",
        "Two players on the same device",
        "Online multiplayer with quick match and room codes",
        "Multiple board styles: classic, paper, neon, chalk",
        "Synthesized game sounds",
      ],
      author: { "@id": `${siteConfig.url}/#author` },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#author`,
      name: siteConfig.author.name,
      url: siteConfig.author.url,
    },
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // Safe: graph is a static, server-authored object (no user input).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
