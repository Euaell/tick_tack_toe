import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tic Tac Toe - Online Multiplayer",
  description: "Play Tic Tac Toe online with friends or random opponents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="/env-config.js" strategy="beforeInteractive" />
      </head>
      <body className="antialiased bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Tic Tac Toe
              </Link>
              <div className="flex gap-4">
                <Link href="/lobby" className="text-gray-700 hover:text-blue-600 font-semibold">
                  Play
                </Link>
                <Link href="/leaderboard" className="text-gray-700 hover:text-blue-600 font-semibold">
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
