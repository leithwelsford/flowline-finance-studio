import { CashFlowHealth } from './CashFlowHealth';
import { IncomeExpenseCard } from './IncomeExpenseCard';
import { TrueCostCard } from './TrueCostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

/**
 * Loading skeleton for the three numbers grid
 */
function ThreeNumbersGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      data-testid="three-numbers-grid-skeleton"
    >
      {[0, 1, 2].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="bg-slate-200 py-4">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="pt-6">
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export interface ThreeNumbersGridProps {
  isLoading?: boolean;
}

/**
 * ThreeNumbersGrid - Responsive grid container for the three financial health cards
 *
 * Displays CashFlowHealth, IncomeExpenseCard, and TrueCostCard in a responsive
 * grid layout with staggered entrance animations.
 *
 * Layout:
 * - Desktop (≥1024px): 3 columns
 * - Tablet (768px-1023px): 2 columns
 * - Mobile (<768px): 1 column
 *
 * @example
 * ```tsx
 * <ThreeNumbersGrid />
 * <ThreeNumbersGrid isLoading={true} />
 * ```
 */
export function ThreeNumbersGrid({ isLoading = false }: ThreeNumbersGridProps) {
  if (isLoading) {
    return <ThreeNumbersGridSkeleton />;
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      data-testid="three-numbers-grid"
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CashFlowHealth />
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <IncomeExpenseCard />
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <TrueCostCard />
      </div>
    </div>
  );
}
