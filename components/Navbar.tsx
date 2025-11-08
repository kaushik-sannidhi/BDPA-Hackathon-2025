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
    <nav className="sticky top-0 z-50 glass-effect border-b border-purple-800/50 shadow-glow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-purple-500 group-hover:animate-spin transition-transform" />
            <span className="text-xl font-bold bg-gradient-to-r from-ink to-purple-500 bg-clip-text text-transparent glow-text">
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
                      ? "bg-purple-500/30 text-foreground shadow-glow"
                      : "text-foreground/70 hover:text-foreground hover:bg-purple-500/20"
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

