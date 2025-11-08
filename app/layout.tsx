import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { RouteLoading } from "@/components/RouteLoading";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ApplAI",
  description: "Practice your interview skills with real-time AI coaching and feedback",
  icons: {
    icon: "/assets/images/logo.svg",
    apple: "/assets/images/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <RouteLoading />
          </Suspense>
          <Navbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

