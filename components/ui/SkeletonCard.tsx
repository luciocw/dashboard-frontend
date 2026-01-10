import { memo } from 'react'

export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-lg bg-slate-700" />
        <div className="flex-1">
          <div className="h-5 bg-slate-700 rounded w-3/4 mb-2" />
          <div className="flex gap-1">
            <div className="h-5 w-16 bg-slate-700 rounded" />
            <div className="h-5 w-12 bg-slate-700 rounded" />
            <div className="h-5 w-10 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-6 w-10 bg-slate-700 rounded mb-1" />
          <div className="h-4 w-12 bg-slate-700 rounded" />
        </div>
      </div>

      {/* Lineup */}
      <div className="mb-3">
        <div className="h-3 w-14 bg-slate-800 rounded mb-2" />
        <div className="flex gap-1">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-6 w-10 bg-slate-700 rounded" />
          ))}
        </div>
      </div>

      {/* Counters */}
      <div className="flex gap-3 mb-3">
        <div className="h-4 w-12 bg-slate-700 rounded" />
        <div className="h-4 w-10 bg-slate-700 rounded" />
        <div className="h-4 w-14 bg-slate-700 rounded" />
      </div>

      {/* Positions */}
      <div className="flex gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-5 w-12 bg-slate-700 rounded" />
        ))}
      </div>
    </div>
  )
})
