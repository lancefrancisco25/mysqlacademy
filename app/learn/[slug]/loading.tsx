export default function LessonLoading() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header skeleton */}
      <div className="h-14 border-b border-border/40 bg-muted/20 animate-pulse" />

      {/* Main split skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left skeleton */}
        <div className="w-[40%] border-r border-border p-6 space-y-6 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
            <div className="h-3 bg-muted rounded w-4/6" />
          </div>
          <div className="h-32 bg-muted/50 rounded-lg" />
          <div className="space-y-3 pt-6 border-t border-border">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-16 bg-muted/50 rounded-lg" />
            <div className="h-16 bg-muted/50 rounded-lg" />
          </div>
        </div>

        {/* Right skeleton */}
        <div className="flex-1 bg-[#09090b] p-4 flex flex-col justify-between animate-pulse">
          <div className="h-9 bg-zinc-900 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-zinc-900 rounded w-1/2" />
            <div className="h-4 bg-zinc-900 rounded w-1/3" />
          </div>
          <div className="h-8 bg-zinc-900 rounded w-full" />
        </div>
      </div>
    </div>
  );
}
