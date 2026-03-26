import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DinoDigest — Feed your brain",
  description: "Paste a URL, let the dinosaur digest it into knowledge you can absorb.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-green-700 hover:text-green-800 transition-colors">
              DinoDigest
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/history" className="text-gray-600 hover:text-gray-900 transition-colors">
                History
              </Link>
              <Link href="/review" className="text-gray-600 hover:text-gray-900 transition-colors">
                Review
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
