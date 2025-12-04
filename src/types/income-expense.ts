/**
 * Income vs expenditure metrics for dashboard card
 *
 * All monetary values stored as strings for big.js compatibility (ADR-003).
 */
export interface IncomeExpenseMetrics {
  /** Total monthly income (ZAR) */
  totalIncome: string;
  /** Total monthly expenses (ZAR) */
  totalExpenses: string;
  /** Discretionary amount: income - expenses (ZAR) */
  discretionaryAmount: string;
  /** Savings rate percentage: ((income - expenses) / income) × 100 */
  savingsRate: string;
}
