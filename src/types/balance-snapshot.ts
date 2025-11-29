/**
 * Balance snapshot interface
 * Represents a point-in-time snapshot of an account balance for progress tracking
 *
 * All monetary values stored as strings for big.js precision
 * All dates stored as ISO strings
 */
export interface BalanceSnapshot {
  /** Auto-incremented ID (optional for new records) */
  id?: number;
  /** Reference to the account this snapshot belongs to */
  accountId: number;
  /** ISO date string for when the snapshot was taken */
  date: string;
  /** Account balance at snapshot time as string (e.g., "495000.00") */
  balance: string;
  /** Optional notes about the snapshot */
  notes?: string;
  /** ISO date string when record was created */
  createdAt: string;
}
