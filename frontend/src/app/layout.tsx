import type { Metadata } from "next";
import { DM_Mono, IBM_Plex_Sans, Roboto_Mono } from "next/font/google";

import { AppProviders } from "@/components/layout/AppProviders";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { TopBar } from "@/components/layout/TopBar";

import "./globals.css";

const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-display" });
const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-data" });

export const metadata: Metadata = {
  title: "FintelOS",
  description: "AI-powered stock market intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmMono.variable} ${ibmPlexSans.variable} ${robotoMono.variable}`}>
        <AppProviders>
          <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <TopBar />
              <main className="min-h-0 flex-1 overflow-auto">{children}</main>
              <StatusBar />
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
