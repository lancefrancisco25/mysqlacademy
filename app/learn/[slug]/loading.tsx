import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ── 1. Top Global Header Skeleton ───────────────────────────── */}
      <div className="h-14 border-b border-border/60 bg-background/80 backdrop-blur px-4 md:px-6 flex items-center justify-between shrink-0">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* ── 2. Lesson Subheader Skeleton ────────────────────────────── */}
      <div className="h-11 border-b border-border bg-card/60 backdrop-blur px-3 sm:px-4 flex items-center justify-between gap-4 shrink-0">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded" />
          <span className="text-muted-foreground/40 text-xs">/</span>
          <Skeleton className="h-4 w-16 rounded" />
          <span className="text-muted-foreground/40 text-xs">/</span>
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        {/* Right: Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border/60 bg-muted/30">
          <Skeleton className="h-6 w-28 rounded" />
          <Skeleton className="h-6 w-28 rounded" />
        </div>
      </div>

      {/* ── 3. Main Workspace Split Skeleton ────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Tasks / Lesson Content Sidebar */}
        <div className="w-full md:w-[42%] lg:w-[38%] border-r border-border bg-card p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Tag & Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-7 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>

          {/* Analogy / Concept Box */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-4/5 rounded" />
          </div>

          {/* Task Checklist Items */}
          <div className="space-y-3 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border/70 bg-card p-3 space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
                <Skeleton className="h-3 w-5/6 rounded pl-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Terminal / Editor Panel */}
        <div className="hidden md:flex flex-1 flex-col bg-muted/10 dark:bg-[#09090b] border-l border-border/60">
          {/* Terminal Tabs Bar */}
          <div className="h-10 border-b border-border/60 bg-muted/30 dark:bg-zinc-900/40 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-6 w-28 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>

          {/* Terminal Content Area */}
          <div className="flex-1 p-5 space-y-4 font-mono">
            {/* Terminal Output Shimmer */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-48 rounded bg-muted/60 dark:bg-zinc-800/60" />
              <Skeleton className="h-4 w-64 rounded bg-muted/60 dark:bg-zinc-800/60" />
            </div>

            {/* Table Output Preview */}
            <div className="rounded-lg border border-border/60 bg-card/60 dark:bg-zinc-900/60 p-4 space-y-3 mt-6">
              <div className="flex gap-4 border-b border-border/40 pb-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              {[1, 2, 3].map((r) => (
                <div key={r} className="flex gap-4">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Input Bar */}
          <div className="p-3 border-t border-border/60 bg-card dark:bg-zinc-950/80 flex items-center gap-3">
            <Skeleton className="h-4 w-16 rounded font-mono" />
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
