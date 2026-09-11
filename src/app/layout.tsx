import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SurviveFirst | No plantation without a survival plan",
  description: "Predictive + prescriptive tree survival decision intelligence platform.",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <header className="border-b bg-card">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center text-lg">SF</span>
              SurviveFirst
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
              <Link href="/my-trees" className="text-muted-foreground hover:text-foreground">My Trees</Link>
              <Link href="/tasks" className="text-muted-foreground hover:text-foreground">Tasks</Link>
              <Link href="/planning" className="text-muted-foreground hover:text-foreground">Planning</Link>
              <Link href="/admin/registrations" className="text-muted-foreground hover:text-foreground">Inbox</Link>
              <Link href="/impact" className="text-muted-foreground hover:text-foreground">Impact</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        </Providers>
      </body>
    </html>
  );
}
