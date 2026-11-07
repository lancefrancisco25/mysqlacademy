"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, Terminal, Split } from "lucide-react";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number; // percentage
  minLeftWidth?: number; // percentage
  maxLeftWidth?: number; // percentage
}

export function SplitPane({
  left,
  right,
  defaultLeftWidth = 38,
  minLeftWidth = 25,
  maxLeftWidth = 60,
}: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [mobileView, setMobileView] = useState<"curriculum" | "terminal" | "split">("terminal");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidth(Math.min(maxLeftWidth, Math.max(minLeftWidth, pct)));
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  return (
    <>
      {/* Desktop: resizable side-by-side split */}
      <div
        ref={containerRef}
        className={cn(
          "hidden md:flex h-full w-full",
          isDragging && "select-none cursor-col-resize"
        )}
      >
        <div style={{ width: `${leftWidth}%` }} className="h-full overflow-hidden">
          {left}
        </div>
        <div
          className="resize-handle shrink-0"
          onMouseDown={handleMouseDown}
        />
        <div style={{ width: `${100 - leftWidth}%` }} className="h-full overflow-hidden">
          {right}
        </div>
      </div>

      {/* Mobile: adaptive drawer / view toggle */}
      <div className="md:hidden flex flex-col h-full overflow-hidden">
        {/* Mobile Navigation Pill */}
        <div className="h-10 border-b border-border bg-muted/40 px-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
            Mobile Workspace
          </span>
          <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setMobileView("curriculum")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                mobileView === "curriculum"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="h-3 w-3" />
              <span>Lesson</span>
            </button>
            <button
              onClick={() => setMobileView("terminal")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                mobileView === "terminal"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Terminal className="h-3 w-3" />
              <span>CLI</span>
            </button>
            <button
              onClick={() => setMobileView("split")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                mobileView === "split"
                  ? "bg-zinc-700 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Split className="h-3 w-3" />
              <span>50/50</span>
            </button>
          </div>
        </div>

        {/* View Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mobileView === "curriculum" && (
            <div className="h-full overflow-hidden">{left}</div>
          )}
          {mobileView === "terminal" && (
            <div className="h-full overflow-hidden">{right}</div>
          )}
          {mobileView === "split" && (
            <>
              <div className="h-1/2 overflow-hidden border-b border-border">{left}</div>
              <div className="h-1/2 overflow-hidden">{right}</div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
