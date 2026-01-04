export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-800 rounded ${className}`} />
  )
}

export function LeagueCardSkeleton() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-1/3" />
    </div>
  )
}
