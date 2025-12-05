import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading indicator for strategy calculations
 *
 * Displays a skeleton loading state while strategies are being calculated.
 * Uses shadcn/ui Skeleton with subtle pulse animation.
 */
export function CalculationLoading() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <span className="text-sm text-slate-600">Calculating strategies...</span>
      </div>

      <div className="space-y-3">
        {/* Strategy cards skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="mt-3 flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
