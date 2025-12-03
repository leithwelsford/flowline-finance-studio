/**
 * Account types for debt accounts
 * Represents the different types of debt that can be tracked
 */
export type AccountType = 'home_loan' | 'vehicle_finance' | 'personal_loan' | 'credit_card';

/**
 * Interest calculation type
 * - monthly: Interest calculated once per month
 * - daily: Interest calculated daily (common for credit cards)
 */
export type InterestType = 'monthly' | 'daily';

/**
 * Debt account interface
 * Represents a debt account with balance, interest rate, and payment details
 *
 * All monetary values stored as strings for big.js precision
 * All dates stored as ISO strings
 */
export interface DebtAccount {
  /** Auto-incremented ID (optional for new records) */
  id?: number;
  /** Display name for the account */
  name: string;
  /** Type of debt account */
  type: AccountType;
  /** Current balance as string (e.g., "500000.00") */
  balance: string;
  /** Annual interest rate as decimal string (e.g., "0.115" for 11.5%) */
  interestRate: string;
  /** Minimum monthly payment as string (e.g., "5000.00") */
  minimumPayment: string;
  /** Name of the lending institution */
  lender: string;
  /** How interest is calculated */
  interestType: InterestType;
  /** ISO date string when record was created */
  createdAt: string;
  /** ISO date string when record was last updated */
  updatedAt: string;
  /** ISO date string when balance was last updated (for quick update tracking) */
  lastBalanceUpdated?: string;
}
