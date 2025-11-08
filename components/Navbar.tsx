"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase/auth";
import { 
  Home, 
  User, 
  BarChart3, 
  Video, 
  FileText, 
  BookOpen, 
  Briefcase,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navLinks = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/interview", label: "Interview", icon: Video },
    { href: "/resources", label: "Resources", icon: BookOpen },
    { href: "/review", label: "Review", icon: FileText },
  ];

  // Don't show navbar on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-purple-800/50" style={{ boxShadow: '0 4px 20px rgba(168, 85, 247, 0.5), 0 4px 40px rgba(168, 85, 247, 0.3)' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/assets/images/logo.svg" 
              alt="ApplAI Logo" 
              width={32} 
              height={32} 
              className="group-hover:animate-spin transition-transform"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent glow-text">
              ApplAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2",
                    isActive
                      ? "bg-purple-500/30 text-foreground shadow-glow"
                      : "text-foreground/70 hover:text-foreground hover:bg-purple-500/20"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <>
                <span className="text-sm text-foreground/70">{user.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-foreground/70 hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground/70 hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-3",
                    isActive
                      ? "bg-purple-500/30 text-foreground shadow-glow"
                      : "text-foreground/70 hover:text-foreground hover:bg-purple-500/20"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-purple-800/50">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-lg font-medium text-foreground/70 hover:text-foreground hover:bg-purple-500/20 flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg font-medium text-foreground/70 hover:text-foreground hover:bg-purple-500/20"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
