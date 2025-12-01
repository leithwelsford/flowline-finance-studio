/**
 * Currency formatting utilities for South African Rand (ZAR)
 */

/**
 * Format a numeric string as ZAR currency
 *
 * @param amount - Numeric string to format (e.g., "1234.56")
 * @returns Formatted currency string (e.g., "R 1 234,56")
 *
 * @example
 * formatCurrency('1234.56') // "R 1 234,56"
 * formatCurrency('0') // "R 0,00"
 * formatCurrency('1000000') // "R 1 000 000,00"
 */
export function formatCurrency(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) {
    return 'R 0,00';
  }
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(num);
}

/**
 * Parse a currency input string to a clean numeric string
 *
 * Removes currency symbols, spaces, and thousand separators.
 * Handles both comma and period as decimal separators.
 *
 * @param value - User input string (e.g., "R 1 234,56" or "1234.56")
 * @returns Clean numeric string (e.g., "1234.56")
 *
 * @example
 * parseCurrencyInput('R 1 234,56') // "1234.56"
 * parseCurrencyInput('1,234.56') // "1234.56"
 * parseCurrencyInput('1000') // "1000"
 */
export function parseCurrencyInput(value: string): string {
  // Remove currency symbol and spaces
  let cleaned = value.replace(/[R\s]/g, '');

  // Handle SA format (space as thousand sep, comma as decimal)
  // Check if last separator is comma with 2 digits after (likely decimal)
  const lastCommaIndex = cleaned.lastIndexOf(',');
  const lastPeriodIndex = cleaned.lastIndexOf('.');

  if (lastCommaIndex > lastPeriodIndex && cleaned.length - lastCommaIndex <= 3) {
    // Comma is the decimal separator (SA format)
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastPeriodIndex > lastCommaIndex && cleaned.length - lastPeriodIndex <= 3) {
    // Period is the decimal separator (US format)
    cleaned = cleaned.replace(/,/g, '');
  } else {
    // No clear decimal, just remove non-numeric except period
    cleaned = cleaned.replace(/,/g, '');
  }

  // Remove any remaining non-numeric characters except period
  cleaned = cleaned.replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  return cleaned || '0';
}

/**
 * Format a percentage value for display
 *
 * @param value - Decimal string (e.g., "0.115") or percentage string (e.g., "11.5")
 * @param isDecimal - Whether the input is a decimal (true) or percentage (false)
 * @returns Formatted percentage string (e.g., "11.5%")
 */
export function formatPercentage(value: string, isDecimal = false): string {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return '0%';
  }
  const percentage = isDecimal ? num * 100 : num;
  return `${percentage.toFixed(2).replace(/\.?0+$/, '')}%`;
}
