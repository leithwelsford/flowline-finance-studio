import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        'flex-1 bg-slate-50 p-4 sm:p-6 lg:p-8',
        className
      )}
    >
      {children}
    </main>
  )
}
