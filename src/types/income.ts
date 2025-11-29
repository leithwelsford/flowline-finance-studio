/**
 * Income entry interface
 * Represents a recurring income source
 *
 * All monetary values stored as strings for big.js precision
 * All dates stored as ISO strings
 */
export interface IncomeEntry {
  /** Auto-incremented ID (optional for new records) */
  id?: number;
  /** Description of the income source (e.g., "Salary", "Rental Income") */
  source: string;
  /** Monthly amount as string (e.g., "45000.00") */
  amount: string;
  /** Day of month when payment is received (1-31) */
  paymentDate: number;
  /** ISO date string when record was created */
  createdAt: string;
}
