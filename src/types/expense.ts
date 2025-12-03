/**
 * Expense category types
 * Standard categories for tracking monthly expenses
 */
export type ExpenseCategory =
  | 'housing'
  | 'transport'
  | 'food'
  | 'utilities'
  | 'insurance'
  | 'entertainment'
  | 'other';

/**
 * Expense entry interface
 * Represents a recurring monthly expense
 *
 * All monetary values stored as strings for big.js precision
 * All dates stored as ISO strings
 */
export interface ExpenseEntry {
  /** Auto-incremented ID (optional for new records) */
  id?: number;
  /** Category of the expense */
  category: ExpenseCategory;
  /** Monthly amount as string (e.g., "5000.00") */
  amount: string;
  /** Optional description for the expense */
  description?: string;
  /** ISO date string for the expense date */
  date: string;
  /** ISO date string when record was created */
  createdAt: string;
}
