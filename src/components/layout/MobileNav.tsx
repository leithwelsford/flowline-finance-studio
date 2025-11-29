import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { type PageType, navItems } from './Navigation'

interface MobileNavProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function MobileNav({
  currentPage,
  onNavigate,
  open,
  onOpenChange,
  className,
}: MobileNavProps) {
  const handleNavigate = (page: PageType) => {
    onNavigate(page)
    onOpenChange(false)
  }

  return (
    <div className={cn('sm:hidden', className)}>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <button
            className="p-2 text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 rounded-sm"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle className="text-left text-slate-900">Navigation</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1" role="navigation" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <SheetClose asChild key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors min-h-[44px]',
                    'hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-inset',
                    currentPage === item.id
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-slate-600'
                  )}
                  aria-current={currentPage === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              </SheetClose>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
