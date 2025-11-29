/**
 * Flexi facility types
 * Represents South African bank flexi/access bond products
 */
export type FlexiFacilityType = 'fnb_flexi' | 'standard_bank_access';

/**
 * Flexi facility interface
 * Represents a flexible credit facility (like FNB Flexi or Standard Bank Access Bond)
 *
 * All monetary values stored as strings for big.js precision
 * All dates stored as ISO strings
 */
export interface FlexiFacility {
  /** Auto-incremented ID (optional for new records) */
  id?: number;
  /** Display name for the facility */
  name: string;
  /** Type of flexi facility */
  type: FlexiFacilityType;
  /** Credit limit as string (e.g., "100000.00") */
  creditLimit: string;
  /** Current balance as string (e.g., "50000.00") */
  currentBalance: string;
  /** Annual interest rate as decimal string (e.g., "0.115" for 11.5%) */
  interestRate: string;
  /** ISO date string when record was created */
  createdAt: string;
  /** ISO date string when record was last updated */
  updatedAt: string;
}
