"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/resume", label: "Resume" },
    { href: "/interview", label: "Interview" },
    { href: "/review", label: "Review" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-sky-200/50 shadow-glow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-sky-500 group-hover:animate-spin transition-transform" />
            <span className="text-xl font-bold bg-gradient-to-r from-ink to-sky-600 bg-clip-text text-transparent glow-text">
              ApplAI
            </span>
          </Link>
          <div className="flex items-center gap-6">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-300",
                    isActive
                      ? "bg-sky-400/30 text-ink shadow-glow animate-glow-pulse"
                      : "text-ink/70 hover:text-ink hover:bg-sky-200/30"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

