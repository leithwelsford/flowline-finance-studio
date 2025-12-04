import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { HealthStatus } from '@/types/financial-health';

/**
 * Props for the HealthCard component
 */
export interface HealthCardProps {
  /** Card title displayed in the teal header */
  title: string;
  /** Main value displayed prominently (e.g., formatted currency) */
  value: string;
  /** Health status determining color theme */
  status: HealthStatus;
  /** Human-readable status label (e.g., "Breathing", "Tight", "Drowning") */
  statusLabel: string;
  /** Icon component to display alongside status */
  icon: ReactNode;
  /** Optional subtitle text below main value */
  subtitle?: string;
  /** Optional trend indicator */
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Status color mapping for health indicators
 */
const statusColors: Record<HealthStatus, string> = {
  healthy: 'text-green-500',
  warning: 'text-amber-500',
  critical: 'text-red-500',
};

/**
 * HealthCard - Displays one of the "Three Critical Numbers" with color-coded status
 *
 * Reusable card component for financial health metrics.
 * Uses teal header per UX spec, with status-based color coding.
 *
 * @example
 * ```tsx
 * <HealthCard
 *   title="Cash Flow Health"
 *   value="R 4 500,00"
 *   status="healthy"
 *   statusLabel="Breathing"
 *   icon={<CheckCircle />}
 *   subtitle="45% of income to debt"
 * />
 * ```
 */
export function HealthCard({
  title,
  value,
  status,
  statusLabel,
  icon,
  subtitle,
}: HealthCardProps) {
  const statusColor = statusColors[status];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className={cn(statusColor, '[&>svg]:h-5 [&>svg]:w-5')}>
            {icon}
          </span>
          <span className={cn('font-medium', statusColor)}>{statusLabel}</span>
        </div>
        {subtitle && (
          <div className="text-sm text-slate-500 mt-2">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
}
