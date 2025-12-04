/**
 * Health status indicating financial wellbeing
 *
 * - healthy: Surplus > 10% of income (Breathing)
 * - warning: Surplus 0-10% of income (Tight)
 * - critical: Surplus < 0 (Drowning)
 */
export type HealthStatus = 'healthy' | 'warning' | 'critical';

/**
 * Cash flow health metrics derived from financial snapshot
 *
 * All monetary values stored as strings for big.js compatibility.
 */
export interface CashFlowHealth {
  /** Available monthly surplus: income - expenses - minimum payments (ZAR) */
  availableSurplus: string;
  /** Health status based on surplus percentage of income */
  status: HealthStatus;
  /** Human-readable status label (Breathing, Tight, Drowning, No Income) */
  statusLabel: string;
  /** Percentage of income consumed by minimum debt payments */
  debtConsumptionPercent: string;
}
