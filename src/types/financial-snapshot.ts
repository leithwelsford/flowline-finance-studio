/**
 * Financial snapshot representing aggregated financial state
 *
 * All monetary values stored as strings for big.js compatibility.
 * Used by FinancialSnapshot component to display summary panel.
 */
export interface FinancialSnapshot {
  /** Sum of all account balances (ZAR) */
  totalDebt: string;
  /** Sum of all income entries (ZAR) */
  totalMonthlyIncome: string;
  /** Sum of all expense entries (ZAR) */
  totalMonthlyExpenses: string;
  /** Sum of all account minimum payments (ZAR) */
  minimumDebtPayments: string;
  /** Income - Expenses - MinimumPayments (ZAR) */
  availableSurplus: string;
  /** Number of debt accounts */
  accountCount: number;
  /** Whether a flexi facility exists */
  hasFlexi: boolean;
  /** Available credit on flexi facility if exists (ZAR) */
  flexiAvailableCredit?: string;
}
