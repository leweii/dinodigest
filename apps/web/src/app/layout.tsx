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
  title: "乔治恐龙 — 喂饱你的大脑",
  description: "粘贴一个链接，让乔治恐龙把它消化成你能吸收的知识。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-green-700 hover:text-green-800 transition-colors">
              乔治恐龙
            </Link>
            <div className="flex gap-4 text-sm">
            <Link href="/history" className="text-gray-600 hover:text-gray-900 transition-colors">
              历史
            </Link>
            <Link href="/review" className="text-gray-600 hover:text-gray-900 transition-colors">
              复习
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
