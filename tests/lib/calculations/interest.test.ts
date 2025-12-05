import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import {
  calculateMonthlyInterest,
  calculateFlexiMonthlyInterest,
  calculateTotalMonthlyInterest,
  calculateDailyInterest,
  calculateMonthlyFromDaily,
  calculateEffectiveRate,
  calculateCompoundInterest,
  calculateTotalPayment,
  SA_PRIME_RATE,
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

// ============================================================================
// Story 4.1 Tests - Interest Calculation Functions
// ============================================================================

describe('SA_PRIME_RATE constant - AC-4.1.3', () => {
  it('has correct value of 11.75% (0.1175)', () => {
    expect(SA_PRIME_RATE).toBe('0.1175');
  });
});

describe('calculateMonthlyInterest - AC-4.1.1', () => {
  describe('spreadsheet verification values', () => {
    it('calculates R100,000 at 11.5% annual = R958.33/month', () => {
      const result = calculateMonthlyInterest('100000', '0.115', 'monthly');
      expect(result.toFixed(2)).toBe('958.33');
    });

    it('calculates R500,000 at 11.75% annual = R4,895.83/month', () => {
      const result = calculateMonthlyInterest('500000', '0.1175', 'monthly');
      expect(result.toFixed(2)).toBe('4895.83');
    });
  });
});

describe('calculateDailyInterest - AC-4.1.2', () => {
  describe('spreadsheet verification values', () => {
    it('calculates R50,000 at 12% annual = R16.44/day', () => {
      const result = calculateDailyInterest('50000', '0.12');
      expect(result.toFixed(2)).toBe('16.44');
    });

    it('calculates R100,000 flexi at 13.75% (prime + 2%) = R37.67/day', () => {
      const result = calculateDailyInterest('100000', '0.1375');
      expect(result.toFixed(2)).toBe('37.67');
    });
  });

  describe('edge cases', () => {
    it('returns zero for zero balance', () => {
      const result = calculateDailyInterest('0', '0.12');
      expect(result.eq(0)).toBe(true);
    });

    it('returns zero for zero rate', () => {
      const result = calculateDailyInterest('50000', '0');
      expect(result.eq(0)).toBe(true);
    });

    it('returns zero for empty balance string', () => {
      const result = calculateDailyInterest('', '0.12');
      expect(result.eq(0)).toBe(true);
    });

    it('returns zero for empty rate string', () => {
      const result = calculateDailyInterest('50000', '');
      expect(result.eq(0)).toBe(true);
    });
  });

  describe('validation', () => {
    it('throws for negative balance', () => {
      expect(() => calculateDailyInterest('-1000', '0.12')).toThrow(
        'Balance cannot be negative'
      );
    });

    it('throws for negative rate', () => {
      expect(() => calculateDailyInterest('50000', '-0.12')).toThrow(
        'Rate cannot be negative'
      );
    });

    it('throws for rate exceeding 100%', () => {
      expect(() => calculateDailyInterest('50000', '1.5')).toThrow(
        'Rate cannot exceed 100% (1.0)'
      );
    });
  });
});

describe('calculateMonthlyFromDaily - AC-4.1.2', () => {
  describe('spreadsheet verification values', () => {
    it('calculates R16.44/day × 30 = R493.20/month', () => {
      const daily = new Big('16.44');
      const result = calculateMonthlyFromDaily(daily, 30);
      expect(result.toFixed(2)).toBe('493.20');
    });
  });

  describe('varying days in month', () => {
    it('calculates for 28 days (February)', () => {
      const daily = new Big('16.44');
      const result = calculateMonthlyFromDaily(daily, 28);
      expect(result.toFixed(2)).toBe('460.32');
    });

    it('calculates for 29 days (leap year February)', () => {
      const daily = new Big('16.44');
      const result = calculateMonthlyFromDaily(daily, 29);
      expect(result.toFixed(2)).toBe('476.76');
    });

    it('calculates for 30 days', () => {
      const daily = new Big('16.44');
      const result = calculateMonthlyFromDaily(daily, 30);
      expect(result.toFixed(2)).toBe('493.20');
    });

    it('calculates for 31 days', () => {
      const daily = new Big('16.44');
      const result = calculateMonthlyFromDaily(daily, 31);
      expect(result.toFixed(2)).toBe('509.64');
    });
  });

  describe('validation', () => {
    it('throws for days less than 28', () => {
      const daily = new Big('16.44');
      expect(() => calculateMonthlyFromDaily(daily, 27)).toThrow(
        'Days in month must be between 28 and 31'
      );
    });

    it('throws for days greater than 31', () => {
      const daily = new Big('16.44');
      expect(() => calculateMonthlyFromDaily(daily, 32)).toThrow(
        'Days in month must be between 28 and 31'
      );
    });
  });

  describe('default days', () => {
    it('defaults to 30 days when not specified', () => {
      const daily = new Big('16.44');
      const result = calculateMonthlyFromDaily(daily);
      expect(result.toFixed(2)).toBe('493.20');
    });
  });
});

describe('calculateEffectiveRate - AC-4.1.3', () => {
  describe('spreadsheet verification values', () => {
    it('calculates Prime (11.75%) + 2% margin = 13.75%', () => {
      const result = calculateEffectiveRate('0.1175', '0.02');
      expect(result.toString()).toBe('0.1375');
    });

    it('calculates Prime (11.75%) + 0% margin = 11.75%', () => {
      const result = calculateEffectiveRate('0.1175', '0');
      expect(result.toString()).toBe('0.1175');
    });

    it('calculates Prime (11.75%) + 3.5% margin = 15.25%', () => {
      const result = calculateEffectiveRate('0.1175', '0.035');
      expect(result.toString()).toBe('0.1525');
    });

    it('calculates rate change simulation: 12.00% + 2% = 14.00%', () => {
      const result = calculateEffectiveRate('0.12', '0.02');
      expect(result.toString()).toBe('0.14');
    });
  });

  describe('using SA_PRIME_RATE constant', () => {
    it('calculates with SA_PRIME_RATE + 2% margin', () => {
      const result = calculateEffectiveRate(SA_PRIME_RATE, '0.02');
      expect(result.toString()).toBe('0.1375');
    });
  });

  describe('validation', () => {
    it('throws for negative prime rate', () => {
      expect(() => calculateEffectiveRate('-0.1175', '0.02')).toThrow(
        'Prime rate cannot be negative'
      );
    });

    it('throws for negative margin', () => {
      expect(() => calculateEffectiveRate('0.1175', '-0.02')).toThrow(
        'Margin cannot be negative'
      );
    });

    it('throws for combined rate exceeding 100%', () => {
      expect(() => calculateEffectiveRate('0.6', '0.5')).toThrow(
        'Combined rate cannot exceed 100% (1.0)'
      );
    });
  });
});

describe('calculateCompoundInterest - AC-4.1.4, AC-4.1.5', () => {
  describe('monthly compounding', () => {
    it('calculates R100,000 at 12% for 12 months', () => {
      const result = calculateCompoundInterest('100000', '0.12', 12, 'monthly');
      // P × (1 + 0.12/12)^12 - P = P × (1.01)^12 - P ≈ 12,682.50
      expect(result.toFixed(2)).toBe('12682.50');
    });

    it('calculates R50,000 at 11.5% for 6 months', () => {
      const result = calculateCompoundInterest('50000', '0.115', 6, 'monthly');
      // P × (1 + 0.115/12)^6 - P ≈ 2,944.77
      expect(result.toFixed(2)).toBe('2944.77');
    });
  });

  describe('daily compounding', () => {
    it('calculates R100,000 at 12% for 365 days', () => {
      const result = calculateCompoundInterest('100000', '0.12', 365, 'daily');
      // P × (1 + 0.12/365)^365 - P ≈ 12,747.46
      expect(result.toFixed(2)).toBe('12747.46');
    });

    it('calculates R50,000 at 12% for 30 days', () => {
      const result = calculateCompoundInterest('50000', '0.12', 30, 'daily');
      // P × (1 + 0.12/365)^30 - P ≈ 495.51
      expect(result.toFixed(2)).toBe('495.51');
    });
  });

  describe('edge cases', () => {
    it('returns zero for zero principal', () => {
      const result = calculateCompoundInterest('0', '0.12', 12, 'monthly');
      expect(result.eq(0)).toBe(true);
    });

    it('returns zero for zero rate', () => {
      const result = calculateCompoundInterest('100000', '0', 12, 'monthly');
      expect(result.eq(0)).toBe(true);
    });

    it('returns zero for zero periods', () => {
      const result = calculateCompoundInterest('100000', '0.12', 0, 'monthly');
      expect(result.eq(0)).toBe(true);
    });
  });

  describe('validation', () => {
    it('throws for negative principal', () => {
      expect(() =>
        calculateCompoundInterest('-100000', '0.12', 12, 'monthly')
      ).toThrow('Principal cannot be negative');
    });

    it('throws for negative rate', () => {
      expect(() =>
        calculateCompoundInterest('100000', '-0.12', 12, 'monthly')
      ).toThrow('Rate cannot be negative');
    });

    it('throws for rate exceeding 100%', () => {
      expect(() =>
        calculateCompoundInterest('100000', '1.5', 12, 'monthly')
      ).toThrow('Rate cannot exceed 100% (1.0)');
    });

    it('throws for negative periods', () => {
      expect(() =>
        calculateCompoundInterest('100000', '0.12', -1, 'monthly')
      ).toThrow('Periods cannot be negative');
    });
  });
});

describe('calculateTotalPayment - AC-4.1.4, AC-4.1.5', () => {
  describe('loan amortization', () => {
    it('calculates total payment and interest for R100,000 loan', () => {
      const result = calculateTotalPayment('100000', '0.115', '2000', 60);

      // Total paid should be around 60 × 2000 = R120,000 max
      // Total interest should be less than total paid
      expect(result.totalPaid.gt(0)).toBe(true);
      expect(result.totalInterest.gt(0)).toBe(true);
      expect(result.totalInterest.lt(result.totalPaid)).toBe(true);
    });

    it('handles loan paid off early', () => {
      // High payment relative to balance
      const result = calculateTotalPayment('10000', '0.12', '5000', 60);

      // Loan should be paid off in about 2-3 months
      expect(result.totalPaid.lt(new Big('15000'))).toBe(true);
      expect(result.totalInterest.gt(0)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('returns zero for zero principal', () => {
      const result = calculateTotalPayment('0', '0.12', '1000', 12);
      expect(result.totalPaid.eq(0)).toBe(true);
      expect(result.totalInterest.eq(0)).toBe(true);
    });

    it('returns zero for zero months', () => {
      const result = calculateTotalPayment('100000', '0.12', '1000', 0);
      expect(result.totalPaid.eq(0)).toBe(true);
      expect(result.totalInterest.eq(0)).toBe(true);
    });
  });

  describe('validation', () => {
    it('throws for negative principal', () => {
      expect(() => calculateTotalPayment('-100000', '0.12', '1000', 12)).toThrow(
        'Principal cannot be negative'
      );
    });

    it('throws for negative rate', () => {
      expect(() => calculateTotalPayment('100000', '-0.12', '1000', 12)).toThrow(
        'Rate cannot be negative'
      );
    });

    it('throws for negative payment', () => {
      expect(() => calculateTotalPayment('100000', '0.12', '-1000', 12)).toThrow(
        'Monthly payment cannot be negative'
      );
    });

    it('throws for negative months', () => {
      expect(() => calculateTotalPayment('100000', '0.12', '1000', -1)).toThrow(
        'Months cannot be negative'
      );
    });
  });
});

describe('big.js precision tests - AC-4.1.4, AC-4.1.5', () => {
  describe('floating-point precision', () => {
    it('handles 0.1 + 0.2 correctly (not 0.30000000000000004)', () => {
      const a = new Big('0.1');
      const b = new Big('0.2');
      const sum = a.plus(b);
      expect(sum.toString()).toBe('0.3');
    });

    it('handles repeated division without drift', () => {
      // 1/3 × 3 should equal 1
      const third = new Big('1').div(3);
      const backToOne = third.times(3);
      // Note: This will be 0.999... but we can round appropriately
      expect(backToOne.round(10).toString()).toBe('1');
    });
  });

  describe('large balance precision', () => {
    it('calculates R10,000,000 at 11.5% correctly', () => {
      const result = calculateMonthlyInterest('10000000', '0.115', 'monthly');
      // 10,000,000 × 0.115 / 12 = 95,833.33
      expect(result.toFixed(2)).toBe('95833.33');
    });

    it('calculates R10,000,000 daily interest correctly', () => {
      const result = calculateDailyInterest('10000000', '0.115');
      // 10,000,000 × 0.115 / 365 = 3,150.68
      expect(result.toFixed(2)).toBe('3150.68');
    });
  });

  describe('small rate precision', () => {
    it('calculates 0.001% (0.00001) rate correctly', () => {
      const result = calculateDailyInterest('100000', '0.00001');
      // 100,000 × 0.00001 / 365 = 0.00274...
      expect(result.toFixed(2)).toBe('0.00');
    });

    it('calculates 0.1% (0.001) rate correctly', () => {
      const result = calculateMonthlyInterest('100000', '0.001', 'monthly');
      // 100,000 × 0.001 / 12 = 8.33
      expect(result.toFixed(2)).toBe('8.33');
    });
  });

  describe('cumulative calculation precision', () => {
    it('12-month cumulative interest does not drift from expected', () => {
      const monthlyInterest = calculateMonthlyInterest(
        '100000',
        '0.115',
        'monthly'
      );

      // Calculate 12 months of simple interest
      let total = new Big(0);
      for (let i = 0; i < 12; i++) {
        total = total.plus(monthlyInterest);
      }

      // 958.33... × 12 = 11,500.00 (annual interest)
      expect(total.toFixed(2)).toBe('11500.00');
    });

    it('daily cumulative over 30 days matches monthly approximation', () => {
      const dailyInterest = calculateDailyInterest('50000', '0.12');
      const monthlyFromDaily = calculateMonthlyFromDaily(dailyInterest, 30);

      // Manual cumulation
      let total = new Big(0);
      for (let i = 0; i < 30; i++) {
        total = total.plus(dailyInterest);
      }

      expect(total.toFixed(2)).toBe(monthlyFromDaily.toFixed(2));
    });
  });

  describe('result type verification', () => {
    it('calculateDailyInterest returns Big instance', () => {
      const result = calculateDailyInterest('50000', '0.12');
      expect(result instanceof Big).toBe(true);
      expect(typeof result.toFixed).toBe('function');
      expect(typeof result.plus).toBe('function');
      expect(typeof result.times).toBe('function');
    });

    it('calculateEffectiveRate returns Big instance', () => {
      const result = calculateEffectiveRate('0.1175', '0.02');
      expect(result instanceof Big).toBe(true);
    });

    it('calculateCompoundInterest returns Big instance', () => {
      const result = calculateCompoundInterest('100000', '0.12', 12, 'monthly');
      expect(result instanceof Big).toBe(true);
    });

    it('calculateTotalPayment returns TotalPaymentResult with Big instances', () => {
      const result = calculateTotalPayment('100000', '0.12', '2000', 12);
      expect(result.totalPaid instanceof Big).toBe(true);
      expect(result.totalInterest instanceof Big).toBe(true);
    });
  });
});

describe('pure function verification - AC-4.1.7', () => {
  it('calculateDailyInterest is pure (same inputs = same outputs)', () => {
    const result1 = calculateDailyInterest('50000', '0.12');
    const result2 = calculateDailyInterest('50000', '0.12');
    const result3 = calculateDailyInterest('50000', '0.12');

    expect(result1.toString()).toBe(result2.toString());
    expect(result2.toString()).toBe(result3.toString());
  });

  it('calculateEffectiveRate is pure (same inputs = same outputs)', () => {
    const result1 = calculateEffectiveRate('0.1175', '0.02');
    const result2 = calculateEffectiveRate('0.1175', '0.02');

    expect(result1.toString()).toBe(result2.toString());
  });

  it('calculateCompoundInterest is pure (same inputs = same outputs)', () => {
    const result1 = calculateCompoundInterest('100000', '0.12', 12, 'monthly');
    const result2 = calculateCompoundInterest('100000', '0.12', 12, 'monthly');

    expect(result1.toString()).toBe(result2.toString());
  });

  it('functions are framework-agnostic (no React imports)', () => {
    // These functions should work without React context
    // This is verified by the fact that they work in this test file
    // which doesn't have any React provider context
    const daily = calculateDailyInterest('50000', '0.12');
    const effective = calculateEffectiveRate('0.1175', '0.02');
    const compound = calculateCompoundInterest('100000', '0.12', 12, 'monthly');

    expect(daily.gt(0)).toBe(true);
    expect(effective.gt(0)).toBe(true);
    expect(compound.gt(0)).toBe(true);
  });
});
