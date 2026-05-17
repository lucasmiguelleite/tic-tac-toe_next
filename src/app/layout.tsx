import type { Metadata } from "next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { SettingsProvider } from "@/context/SettingsContext";
import SettingsBar from "@/components/SettingsBar";
import Footer from "@/components/Footer";
import ClickSoundProvider from "@/components/ClickSoundProvider";

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
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <SettingsProvider>
          <ClickSoundProvider />
          <SettingsBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SettingsProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
