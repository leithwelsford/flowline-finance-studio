import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/format/date';

describe('formatDate', () => {
  it('formats date in SA format DD/MM/YYYY', () => {
    // December 4, 2025 (month is 0-indexed)
    expect(formatDate(new Date(2025, 11, 4))).toBe('04/12/2025');
  });

  it('pads single-digit day and month', () => {
    // January 1, 2025
    expect(formatDate(new Date(2025, 0, 1))).toBe('01/01/2025');
  });

  it('formats various dates across the year', () => {
    // March 15, 2025
    expect(formatDate(new Date(2025, 2, 15))).toBe('15/03/2025');
    // October 31, 2025
    expect(formatDate(new Date(2025, 9, 31))).toBe('31/10/2025');
    // June 9, 2025
    expect(formatDate(new Date(2025, 5, 9))).toBe('09/06/2025');
  });

  it('handles leap year dates', () => {
    // February 29, 2024 (leap year)
    expect(formatDate(new Date(2024, 1, 29))).toBe('29/02/2024');
  });

  it('handles end of year', () => {
    // December 31, 2025
    expect(formatDate(new Date(2025, 11, 31))).toBe('31/12/2025');
  });

  it('handles start of year', () => {
    // January 1, 2026
    expect(formatDate(new Date(2026, 0, 1))).toBe('01/01/2026');
  });
});
