import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SnapshotMetricVariant = 'default' | 'positive' | 'negative' | 'neutral';

export interface SnapshotMetricCardProps {
  /** Label describing the metric */
  label: string;
  /** Formatted value to display */
  value: string;
  /** Visual variant affecting color styling */
  variant?: SnapshotMetricVariant;
  /** Optional icon to display with the value */
  icon?: LucideIcon;
}

const variantStyles: Record<SnapshotMetricVariant, string> = {
  default: 'text-slate-900',
  positive: 'text-green-500',
  negative: 'text-red-500',
  neutral: 'text-slate-600',
};

/**
 * Individual metric display card for financial snapshot
 *
 * Displays a labeled value with optional icon and variant-based styling.
 * Used within FinancialSnapshot component for consistent metric display.
 */
export function SnapshotMetricCard({
  label,
  value,
  variant = 'default',
  icon: Icon,
}: SnapshotMetricCardProps) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon
            className={cn('h-4 w-4', variantStyles[variant])}
            aria-hidden="true"
          />
        )}
        <span
          className={cn('text-lg font-semibold', variantStyles[variant])}
          data-testid={`metric-value-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
