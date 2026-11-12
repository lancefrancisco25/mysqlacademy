"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, BookOpen, GraduationCap, Trophy, Terminal, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/AuthButton";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="relative flex h-14 items-center justify-between px-4 md:px-6 max-w-screen-2xl mx-auto">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Database className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-bold tracking-tight">
              MySQL<span className="text-emerald-500">Academy</span>
            </span>
          </Link>
        </div>

        {/* Center: Nav (Curriculum, Dashboard, Leaderboard, Sandbox) */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/#curriculum">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 text-xs gap-1.5 font-medium transition-colors rounded-lg",
                pathname === "/"
                  ? "text-foreground bg-accent/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
              <span>Curriculum</span>
            </Button>
          </Link>
          <Link href="/learn">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 text-xs gap-1.5 font-medium transition-colors rounded-lg",
                pathname?.startsWith("/learn")
                  ? "text-foreground bg-accent/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              <GraduationCap className="h-3.5 w-3.5 text-sky-400" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 text-xs gap-1.5 font-medium transition-colors rounded-lg",
                pathname === "/leaderboard"
                  ? "text-foreground bg-accent/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Leaderboard</span>
            </Button>
          </Link>
          <Link href="/sql-sandbox">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-2.5 text-xs gap-1.5 font-medium transition-colors rounded-lg",
                pathname === "/sql-sandbox"
                  ? "text-foreground bg-accent/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              <Terminal className="h-3.5 w-3.5 text-purple-400" />
              <span>Sandbox</span>
            </Button>
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <AuthButton />
          <ThemeToggle />
          <Link href="/learn" className="hidden lg:block">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3.5 font-medium">
              Start Learning
            </Button>
          </Link>
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1">
          <Link href="/#curriculum" onClick={() => setMobileMenuOpen(false)}>
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              pathname === "/" ? "bg-accent/60 text-foreground font-semibold" : "text-muted-foreground hover:bg-accent/40"
            )}>
              <BookOpen className="h-4 w-4 text-emerald-500" />
              <span>Curriculum</span>
            </div>
          </Link>
          <Link href="/learn" onClick={() => setMobileMenuOpen(false)}>
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              pathname?.startsWith("/learn") ? "bg-accent/60 text-foreground font-semibold" : "text-muted-foreground hover:bg-accent/40"
            )}>
              <GraduationCap className="h-4 w-4 text-sky-400" />
              <span>Dashboard</span>
            </div>
          </Link>
          <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              pathname === "/leaderboard" ? "bg-accent/60 text-foreground font-semibold" : "text-muted-foreground hover:bg-accent/40"
            )}>
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Leaderboard</span>
            </div>
          </Link>
          <Link href="/sql-sandbox" onClick={() => setMobileMenuOpen(false)}>
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              pathname === "/sql-sandbox" ? "bg-accent/60 text-foreground font-semibold" : "text-muted-foreground hover:bg-accent/40"
            )}>
              <Terminal className="h-4 w-4 text-purple-400" />
              <span>In-Browser MySQL Sandbox</span>
            </div>
          </Link>
        </div>
      )}
    </header>
  );
}
