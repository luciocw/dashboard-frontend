import { memo } from 'react'

interface SkeletonTableProps {
  rows?: number
}

export const SkeletonTable = memo(function SkeletonTable({ rows = 8 }: SkeletonTableProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between">
        <div className="h-5 w-28 bg-slate-700 rounded" />
        <div className="h-4 w-16 bg-slate-700 rounded" />
      </div>

      {/* Table Header */}
      <div className="flex items-center p-4 border-b border-slate-800 bg-slate-900/50">
        <div className="w-12 h-4 bg-slate-700 rounded" />
        <div className="flex-1 ml-4 h-4 bg-slate-700 rounded w-24" />
        <div className="w-16 h-4 bg-slate-700 rounded mx-4" />
        <div className="w-12 h-4 bg-slate-700 rounded mx-4" />
        <div className="w-12 h-4 bg-slate-700 rounded" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center p-4 border-b border-slate-800">
          <div className="w-8 h-4 bg-slate-700 rounded" />
          <div className="flex items-center gap-3 flex-1 ml-4">
            <div className="w-8 h-8 rounded-full bg-slate-700" />
            <div className="h-4 bg-slate-700 rounded w-32" />
          </div>
          <div className="w-12 h-4 bg-slate-700 rounded mx-4" />
          <div className="w-14 h-4 bg-slate-700 rounded mx-4" />
          <div className="w-10 h-4 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  )
})
