import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ApplAI",
  description: "Practice your interview skills with real-time AI coaching and feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-hidden h-full">
      <body className={`${inter.className} overflow-hidden h-full`}>
        <Navbar />
        <main className="h-screen overflow-auto">{children}</main>
      </body>
    </html>
  );
}

