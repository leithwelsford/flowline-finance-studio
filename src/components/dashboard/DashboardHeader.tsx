import { formatDate } from '@/lib/format/date';

/**
 * DashboardHeader - Page header with title and current date
 *
 * Displays "Financial Health Dashboard" as the page title with
 * the current date formatted in SA format (DD/MM/YYYY).
 *
 * @example
 * ```tsx
 * <DashboardHeader />
 * ```
 */
export function DashboardHeader() {
  const today = new Date();
  const formattedDate = formatDate(today);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <h1 className="text-2xl font-semibold text-slate-900">
        Financial Health Dashboard
      </h1>
      <time
        dateTime={today.toISOString().split('T')[0]}
        className="text-sm text-slate-500"
      >
        {formattedDate}
      </time>
    </header>
  );
}
