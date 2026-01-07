import { memo } from 'react'

export const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 py-4 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏈</span>
          <span>Dynasty Dashboard</span>
        </div>
        
        <a 
          href="https://buymeacoffee.com/luciocw" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-yellow-400 transition"
        >
          ☕ Buy me a coffee
        </a>

        <div>
          Desenvolvido por{' '}
          <a 
            href="https://x.com/luciocw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition"
          >
            @luciocw
          </a>
        </div>
      </div>
    </footer>
  )
})
