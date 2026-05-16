import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import ThemeToggle from "./components/ThemeToggle";

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
      <body>
        <ThemeToggle />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
