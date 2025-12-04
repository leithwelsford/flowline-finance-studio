import { format } from 'date-fns';

/**
 * Format a date in South African format (DD/MM/YYYY)
 *
 * @param date - The date to format
 * @returns Formatted date string in DD/MM/YYYY format
 *
 * @example
 * ```ts
 * formatDate(new Date(2025, 11, 4)) // "04/12/2025"
 * formatDate(new Date(2025, 0, 1))  // "01/01/2025"
 * ```
 */
export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}
