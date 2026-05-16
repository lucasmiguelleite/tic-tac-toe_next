import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Tic Tac Toe",
  description: "A basic Tic Tac Toe site in nextjs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeToggle />
        <main className="flex-1">{children}</main>
        <SpeedInsights />
        <Analytics />
        <Footer />
      </body>
    </html>
  );
}
