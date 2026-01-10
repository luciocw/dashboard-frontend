import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 rounded-lg p-6 ${
        hoverable ? 'hover:border-blue-500 transition-colors cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
