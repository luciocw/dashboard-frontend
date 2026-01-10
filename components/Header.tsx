import { memo } from 'react'
import { Button } from './ui/Button'

interface HeaderProps {
  user?: {
    display_name?: string
    username: string
    avatar?: string
  } | null
  onLogout?: () => void
}

export const Header = memo(function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">🏈 Dynasty Dashboard</h1>
        <p className="text-slate-400">Visualize todas suas ligas Sleeper</p>
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            {user.avatar && (
              <img
                src={`https://sleepercdn.com/avatars/thumbs/${user.avatar}`}
                alt={user.display_name || user.username}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="font-medium">
              {user.display_name || user.username}
            </span>
          </div>
          {onLogout && (
            <Button variant="secondary" onClick={onLogout}>
              🚪 Sair
            </Button>
          )}
        </div>
      )}
    </header>
  )
})
