/**
 * True cost of debt metrics for dashboard card
 *
 * All monetary values stored as strings for big.js compatibility (ADR-003).
 */
export interface TrueCostMetrics {
  /** Total monthly interest charges across all accounts (ZAR) */
  monthlyInterest: string;
  /** Annual interest projection: monthlyInterest × 12 (ZAR) */
  annualInterest: string;
  /** Interest-to-income ratio: (monthlyInterest / monthlyIncome) × 100 */
  interestToIncomeRatio: string;
  /** Whether ratio > 20% indicating high debt burden */
  isHighBurden: boolean;
}
