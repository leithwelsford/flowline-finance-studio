import { cn } from '@/lib/utils'
import { useUIStore, type PageType } from '@/store'

// Re-export PageType for backwards compatibility
export type { PageType }

export interface NavigationProps {
  className?: string
}

const navItems: { id: PageType; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'data-entry', label: 'Data Entry' },
  { id: 'compare', label: 'Compare' },
  { id: 'track', label: 'Track' },
]

export function Navigation({ className }: NavigationProps) {
  const currentPage = useUIStore((state) => state.currentPage)
  const setCurrentPage = useUIStore((state) => state.setCurrentPage)
  return (
    <nav
      className={cn('hidden sm:flex items-center gap-1 px-4 bg-white border-b border-slate-200', className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
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
