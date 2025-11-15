import type { Metadata } from "next";
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
      <body className="antialiased bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-2xl font-bold text-blue-600">
                Tic Tac Toe
              </a>
              <div className="flex gap-4">
                <a href="/lobby" className="text-gray-700 hover:text-blue-600 font-semibold">
                  Play
                </a>
                <a href="/leaderboard" className="text-gray-700 hover:text-blue-600 font-semibold">
                  Leaderboard
                </a>
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
