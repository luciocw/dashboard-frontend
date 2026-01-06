interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
}

const variants = {
  default: 'bg-slate-700 text-slate-200',
  success: 'bg-green-900/50 text-green-300 border border-green-800',
  warning: 'bg-yellow-900/50 text-yellow-300 border border-yellow-800',
  error: 'bg-red-900/50 text-red-300 border border-red-800',
  info: 'bg-blue-900/50 text-blue-300 border border-blue-800',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
