import { Skeleton } from "@/components/ui/skeleton";

export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Header Skeleton ─────────────────────────────────────────── */}
      <div className="h-14 border-b border-border/60 bg-background/80 backdrop-blur px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-10">
        {/* Top Header & Metrics Bar */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-9 w-64 rounded-lg" />
              <Skeleton className="h-4 w-96 max-w-full rounded" />
            </div>
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-border bg-card/60 flex items-center gap-4"
              >
                <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>

          {[1, 2, 3].map((track) => (
            <div
              key={track}
              className="rounded-xl border border-border bg-card/40 overflow-hidden shadow-xs"
            >
              {/* Track Header */}
              <div className="p-5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-3.5 w-64 max-w-full rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="space-y-1 text-right hidden sm:block">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-2.5 w-24 rounded" />
                  </div>
                  <Skeleton className="h-2 w-20 rounded-full" />
                </div>
              </div>

              {/* Lesson rows */}
              <div className="divide-y divide-border/40">
                {[1, 2].map((l) => (
                  <div key={l} className="p-4 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 flex-1">
                      <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-48 rounded" />
                        <Skeleton className="h-3 w-72 max-w-full rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
