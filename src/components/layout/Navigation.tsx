import { cn } from '@/lib/utils'

export type PageType = 'dashboard' | 'data-entry' | 'compare' | 'track'

export interface NavigationProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
  className?: string
}

const navItems: { id: PageType; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'data-entry', label: 'Data Entry' },
  { id: 'compare', label: 'Compare' },
  { id: 'track', label: 'Track' },
]

export function Navigation({ currentPage, onNavigate, className }: NavigationProps) {
  return (
    <nav
      className={cn('hidden sm:flex items-center gap-1 px-4 bg-white border-b border-slate-200', className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={cn(
            'relative px-4 py-3 text-sm font-medium transition-colors',
            'hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded-sm',
            currentPage === item.id
              ? 'text-teal-600'
              : 'text-slate-600'
          )}
          aria-current={currentPage === item.id ? 'page' : undefined}
        >
          {item.label}
          {currentPage === item.id && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
              aria-hidden="true"
            />
          )}
        </button>
      ))}
    </nav>
  )
}

export { navItems }
