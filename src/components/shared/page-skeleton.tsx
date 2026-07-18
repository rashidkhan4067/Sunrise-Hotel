export function PageSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-xl bg-muted/30" />
        ))}
      </div>
      <div className="h-14 rounded-xl bg-muted/20" />
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="h-10 bg-muted/30" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-t border-border bg-background opacity-50" />
        ))}
      </div>
    </div>
  )
}
