"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, BookOpen, GraduationCap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/AuthButton";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

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

        {/* Center: Nav (Curriculum & Dashboard) - True Absolute Center */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/#curriculum">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-3 text-xs gap-1.5 font-medium transition-colors rounded-lg",
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
                "h-8 px-3 text-xs gap-1.5 font-medium transition-colors rounded-lg",
                pathname?.startsWith("/learn")
                  ? "text-foreground bg-accent/60 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
            >
              <GraduationCap className="h-3.5 w-3.5 text-sky-400" />
              <span>Dashboard</span>
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
        </div>
      </div>
    </header>
  );
}
