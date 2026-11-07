"use client";

import Link from "next/link";
import { Database, BookOpen, GraduationCap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 md:px-6 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Database className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-bold tracking-tight">
            MySQL<span className="text-emerald-500">Academy</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <BookOpen className="h-4 w-4" />
              Curriculum
            </Button>
          </Link>
          <Link href="/learn">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
              <GraduationCap className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/learn" className="hidden sm:block">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Start Learning
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
