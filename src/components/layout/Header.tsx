import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center h-14 px-4 border-b border-slate-200 bg-white',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <svg
          className="w-8 h-8 text-teal-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <h1 className="text-lg font-semibold text-slate-900">
          Flowline Finance Studio
        </h1>
      </div>
    </header>
  )
}
