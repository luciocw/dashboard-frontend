interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function Avatar({ src, alt, fallback = '?', size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover border border-slate-600`}
      />
    )
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300`}>
      {fallback.charAt(0).toUpperCase()}
    </div>
  )
}
