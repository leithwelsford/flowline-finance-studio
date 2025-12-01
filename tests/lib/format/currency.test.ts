import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrencyInput, formatPercentage } from '@/lib/format/currency';

describe('formatCurrency', () => {
  it('formats basic amounts', () => {
    expect(formatCurrency('1234.56')).toMatch(/R.*1.*234.*56/);
  });

  it('formats zero', () => {
    expect(formatCurrency('0')).toMatch(/R.*0.*00/);
  });

  it('formats large numbers', () => {
    const result = formatCurrency('1000000');
    expect(result).toMatch(/R.*1.*000.*000.*00/);
  });

  it('formats decimal amounts', () => {
    expect(formatCurrency('99.99')).toMatch(/R.*99.*99/);
  });

  it('handles invalid input', () => {
    expect(formatCurrency('')).toMatch(/R.*0.*00/);
    expect(formatCurrency('abc')).toMatch(/R.*0.*00/);
  });

  it('formats negative numbers', () => {
    const result = formatCurrency('-1234.56');
    expect(result).toMatch(/R/);
    expect(result).toMatch(/1.*234.*56/);
  });

  it('handles very small decimals', () => {
    expect(formatCurrency('0.01')).toMatch(/R.*0.*01/);
  });

  it('handles numbers without decimals', () => {
    expect(formatCurrency('5000')).toMatch(/R.*5.*000.*00/);
  });
});

describe('parseCurrencyInput', () => {
  it('parses plain numbers', () => {
    expect(parseCurrencyInput('1234')).toBe('1234');
    expect(parseCurrencyInput('1234.56')).toBe('1234.56');
  });

  it('removes currency symbol', () => {
    expect(parseCurrencyInput('R1234')).toBe('1234');
    expect(parseCurrencyInput('R 1234')).toBe('1234');
  });

  it('handles SA format (comma decimal)', () => {
    expect(parseCurrencyInput('1234,56')).toBe('1234.56');
    expect(parseCurrencyInput('R 1 234,56')).toBe('1234.56');
  });

  it('handles US format (period decimal)', () => {
    expect(parseCurrencyInput('1,234.56')).toBe('1234.56');
  });

  it('handles numbers with thousand separators', () => {
    expect(parseCurrencyInput('1 000 000')).toBe('1000000');
    expect(parseCurrencyInput('1,000,000')).toBe('1000000');
  });

  it('returns 0 for empty input', () => {
    expect(parseCurrencyInput('')).toBe('0');
  });

  it('handles zero', () => {
    expect(parseCurrencyInput('0')).toBe('0');
    expect(parseCurrencyInput('R 0,00')).toBe('0.00');
  });

  it('removes non-numeric characters', () => {
    expect(parseCurrencyInput('abc123def')).toBe('123');
  });

  it('handles decimal only input', () => {
    expect(parseCurrencyInput('.99')).toBe('.99');
  });
});

describe('formatPercentage', () => {
  it('formats decimal to percentage', () => {
    expect(formatPercentage('0.115', true)).toBe('11.5%');
    expect(formatPercentage('0.1', true)).toBe('10%');
    expect(formatPercentage('1', true)).toBe('100%');
  });

  it('formats percentage value', () => {
    expect(formatPercentage('11.5', false)).toBe('11.5%');
    expect(formatPercentage('100', false)).toBe('100%');
    expect(formatPercentage('0', false)).toBe('0%');
  });

  it('handles zero', () => {
    expect(formatPercentage('0', true)).toBe('0%');
    expect(formatPercentage('0', false)).toBe('0%');
  });

  it('handles invalid input', () => {
    expect(formatPercentage('', false)).toBe('0%');
    expect(formatPercentage('abc', false)).toBe('0%');
  });

  it('removes trailing zeros', () => {
    expect(formatPercentage('10.00', false)).toBe('10%');
    expect(formatPercentage('10.50', false)).toBe('10.5%');
  });
});
