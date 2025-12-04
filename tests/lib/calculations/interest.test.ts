import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import {
  calculateMonthlyInterest,
  calculateFlexiMonthlyInterest,
  calculateTotalMonthlyInterest,
} from '@/lib/calculations/interest';
import type { DebtAccount } from '@/types/account';
import type { FlexiFacility } from '@/types/flexi-facility';

describe('calculateMonthlyInterest', () => {
  describe('standard loan (monthly interest) - AC-3.3.2', () => {
    it('calculates R100,000 at 11.5% = R958.33/month', () => {
      const result = calculateMonthlyInterest('100000', '0.115', 'monthly');

      // (100000 × 0.115) / 12 = 958.333...
      expect(result.toFixed(2)).toBe('958.33');
    });

    it('calculates R500,000 at 10% = R4,166.67/month', () => {
      const result = calculateMonthlyInterest('500000', '0.10', 'monthly');

      // (500000 × 0.10) / 12 = 4166.666...
      expect(result.toFixed(2)).toBe('4166.67');
    });

    it('calculates R250,000 at 11.25% = R2,343.75/month', () => {
      const result = calculateMonthlyInterest('250000', '0.1125', 'monthly');

      // (250000 × 0.1125) / 12 = 2343.75
      expect(result.toFixed(2)).toBe('2343.75');
    });
  });

  describe('daily compounding - AC-3.3.8', () => {
    it('calculates daily compounding approximation correctly', () => {
      const result = calculateMonthlyInterest('100000', '0.115', 'daily');

      // (100000 × 0.115) / 365 × 30 = 945.205...
      expect(result.toFixed(2)).toBe('945.21');
    });

    it('calculates credit card daily interest', () => {
      const result = calculateMonthlyInterest('50000', '0.21', 'daily');

      // (50000 × 0.21) / 365 × 30 = 863.01...
      expect(result.toFixed(2)).toBe('863.01');
    });
  });

  describe('edge cases - AC-3.3.8', () => {
    it('returns zero for zero balance', () => {
      const result = calculateMonthlyInterest('0', '0.115', 'monthly');
      expect(result.eq(0)).toBe(true);
    });

    it('returns zero for zero interest rate', () => {
      const result = calculateMonthlyInterest('100000', '0', 'monthly');
      expect(result.eq(0)).toBe(true);
    });

    it('returns zero for empty balance string', () => {
      const result = calculateMonthlyInterest('', '0.115', 'monthly');
      expect(result.eq(0)).toBe(true);
    });

    it('returns zero for empty rate string', () => {
      const result = calculateMonthlyInterest('100000', '', 'monthly');
      expect(result.eq(0)).toBe(true);
    });
  });

  describe('big.js precision', () => {
    it('maintains precision for large balances', () => {
      const result = calculateMonthlyInterest('1500000.50', '0.115', 'monthly');

      // (1500000.50 × 0.115) / 12 = 14375.00479166...
      expect(result.toFixed(2)).toBe('14375.00');
    });

    it('maintains precision for small rates', () => {
      const result = calculateMonthlyInterest('100000', '0.0525', 'monthly');

      // (100000 × 0.0525) / 12 = 437.5
      expect(result.toFixed(2)).toBe('437.50');
    });
  });
});

describe('calculateFlexiMonthlyInterest', () => {
  it('calculates flexi facility interest correctly', () => {
    const result = calculateFlexiMonthlyInterest('100000', '0.115');

    // (100000 × 0.115) / 365 × 30 = 945.205...
    expect(result.toFixed(2)).toBe('945.21');
  });

  it('handles zero balance', () => {
    const result = calculateFlexiMonthlyInterest('0', '0.115');
    expect(result.eq(0)).toBe(true);
  });

  it('handles zero rate', () => {
    const result = calculateFlexiMonthlyInterest('100000', '0');
    expect(result.eq(0)).toBe(true);
  });
});

describe('calculateTotalMonthlyInterest', () => {
  const createAccount = (
    balance: string,
    rate: string,
    type: 'monthly' | 'daily' = 'monthly'
  ): DebtAccount => ({
    name: 'Test Account',
    type: 'home_loan',
    balance,
    interestRate: rate,
    minimumPayment: '1000',
    lender: 'Test Bank',
    interestType: type,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const createFlexi = (balance: string, rate: string): FlexiFacility => ({
    name: 'Test Flexi',
    type: 'fnb_flexi',
    creditLimit: '200000',
    currentBalance: balance,
    interestRate: rate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  describe('multiple accounts summed correctly - AC-3.3.2', () => {
    it('sums interest from multiple accounts', () => {
      const accounts: DebtAccount[] = [
        createAccount('100000', '0.115'), // 958.33
        createAccount('200000', '0.10'), // 1666.67
      ];

      const result = calculateTotalMonthlyInterest(accounts, null);

      // 958.33 + 1666.67 = 2625.00
      expect(result.toFixed(2)).toBe('2625.00');
    });

    it('handles mixed interest types', () => {
      const accounts: DebtAccount[] = [
        createAccount('100000', '0.115', 'monthly'), // 958.33
        createAccount('50000', '0.21', 'daily'), // 863.01
      ];

      const result = calculateTotalMonthlyInterest(accounts, null);

      // 958.33... + 863.01... = 1821.35 (with rounding)
      expect(result.toFixed(2)).toBe('1821.35');
    });
  });

  describe('with flexi facility - AC-3.3.8', () => {
    it('includes flexi facility interest', () => {
      const accounts: DebtAccount[] = [createAccount('100000', '0.115')]; // 958.33
      const flexi = createFlexi('50000', '0.115'); // 472.60

      const result = calculateTotalMonthlyInterest(accounts, flexi);

      // 958.33... + 472.60... = 1430.94 (with rounding)
      expect(result.toFixed(2)).toBe('1430.94');
    });

    it('handles flexi facility only (no accounts)', () => {
      const flexi = createFlexi('100000', '0.115'); // 945.21

      const result = calculateTotalMonthlyInterest([], flexi);

      expect(result.toFixed(2)).toBe('945.21');
    });
  });

  describe('edge cases - AC-3.3.8', () => {
    it('returns zero for empty accounts and no flexi', () => {
      const result = calculateTotalMonthlyInterest([], null);
      expect(result.eq(0)).toBe(true);
    });

    it('handles accounts with zero balance', () => {
      const accounts: DebtAccount[] = [
        createAccount('0', '0.115'),
        createAccount('100000', '0.115'),
      ];

      const result = calculateTotalMonthlyInterest(accounts, null);

      // Only second account contributes
      expect(result.toFixed(2)).toBe('958.33');
    });

    it('handles accounts with zero rate', () => {
      const accounts: DebtAccount[] = [
        createAccount('100000', '0'),
        createAccount('100000', '0.115'),
      ];

      const result = calculateTotalMonthlyInterest(accounts, null);

      // Only second account contributes
      expect(result.toFixed(2)).toBe('958.33');
    });

    it('handles flexi with zero balance', () => {
      const accounts: DebtAccount[] = [createAccount('100000', '0.115')];
      const flexi = createFlexi('0', '0.115');

      const result = calculateTotalMonthlyInterest(accounts, flexi);

      // Only account contributes
      expect(result.toFixed(2)).toBe('958.33');
    });
  });

  describe('big.js precision', () => {
    it('maintains precision across multiple accounts', () => {
      const accounts: DebtAccount[] = [
        createAccount('333333.33', '0.115'), // 3194.44
        createAccount('666666.67', '0.115'), // 6388.89
      ];

      const result = calculateTotalMonthlyInterest(accounts, null);

      // Sum should be precise
      expect(result.toFixed(2)).toBe('9583.33');
    });
  });
});
