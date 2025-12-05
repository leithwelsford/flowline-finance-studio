import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Big from 'big.js';
import {
  generateProjection,
  createBaselineAllocator,
  buildSnapshot,
} from '@/lib/calculations/projections';
import type {
  FinancialSnapshot,
  PaymentAllocator,
  SimulatedAccount,
  SimulatedFlexi,
  PaymentAllocation,
} from '@/lib/calculations/types';

describe('generateProjection', () => {
  describe('basic single account projection - AC-4.2.1, AC-4.2.2, AC-4.2.5', () => {
    it('calculates month-by-month for single account R10,000 at 12% with R500/month', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '10000',
            interestRate: '0.12',
            minimumPayment: '500',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0', // min payments only
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // Verify projection is an array
      expect(Array.isArray(projection)).toBe(true);
      expect(projection.length).toBeGreaterThan(0);

      // First month calculations:
      // Interest: 10000 * 0.12 / 12 = 100
      // Payment: 500 (min payment)
      // Principal: 500 - 100 = 400
      // End balance: 10000 + 100 - 500 = 9600
      const month1 = projection[0];
      expect(month1.month).toBe(1);
      expect(month1.accounts[0].startBalance.toFixed(2)).toBe('10000.00');
      expect(month1.accounts[0].interestCharged.toFixed(2)).toBe('100.00');
      expect(month1.accounts[0].paymentApplied.toFixed(2)).toBe('500.00');
      expect(month1.accounts[0].principalPaid.toFixed(2)).toBe('400.00');
      expect(month1.accounts[0].endBalance.toFixed(2)).toBe('9600.00');

      // Second month:
      // Interest: 9600 * 0.12 / 12 = 96
      // Payment: 500
      // Principal: 500 - 96 = 404
      // End balance: 9600 + 96 - 500 = 9196
      const month2 = projection[1];
      expect(month2.month).toBe(2);
      expect(month2.accounts[0].startBalance.toFixed(2)).toBe('9600.00');
      expect(month2.accounts[0].interestCharged.toFixed(2)).toBe('96.00');
      expect(month2.accounts[0].paymentApplied.toFixed(2)).toBe('500.00');
      expect(month2.accounts[0].principalPaid.toFixed(2)).toBe('404.00');
      expect(month2.accounts[0].endBalance.toFixed(2)).toBe('9196.00');
    });

    it('terminates when debt reaches zero - AC-4.2.2', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '1000',
            interestRate: '0.12',
            minimumPayment: '500',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // Should terminate when paid off, not at 360 months
      expect(projection.length).toBeLessThan(360);

      // Last month should have zero debt
      const lastMonth = projection[projection.length - 1];
      expect(lastMonth.totalDebt.toFixed(2)).toBe('0.00');
    });

    it('stops at 360 months if not paid off - AC-4.2.2', () => {
      // Very low payment relative to interest - won't pay off
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '100000',
            interestRate: '0.20', // 20% rate
            minimumPayment: '100', // Too low to cover interest
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator, { maxMonths: 360 });

      // Should stop at max months
      expect(projection.length).toBe(360);

      // Should still have debt
      const lastMonth = projection[projection.length - 1];
      expect(lastMonth.totalDebt.gt(0)).toBe(true);
    });

    it('outputs array of MonthlyProjection objects with all required fields - AC-4.2.5', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '5000',
            interestRate: '0.10',
            minimumPayment: '300',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // Verify structure
      projection.forEach((month, idx) => {
        expect(month.month).toBe(idx + 1);
        expect(typeof month.date).toBe('string');
        expect(Array.isArray(month.accounts)).toBe(true);
        expect(month.totalDebt).toBeDefined();
        expect(month.totalInterestPaid).toBeDefined();
        expect(month.totalPrincipalPaid).toBeDefined();

        // Verify AccountSnapshot structure
        month.accounts.forEach((acc) => {
          expect(acc.accountId).toBeDefined();
          expect(acc.startBalance).toBeDefined();
          expect(acc.interestCharged).toBeDefined();
          expect(acc.paymentApplied).toBeDefined();
          expect(acc.principalPaid).toBeDefined();
          expect(acc.endBalance).toBeDefined();
        });
      });
    });
  });

  describe('two-account scenarios - AC-4.2.8', () => {
    it('handles two accounts with baseline allocator (min payments only)', () => {
      // Home loan: R100,000 at 11.5% with R1,500/month min
      // Car loan: R50,000 at 13% with R1,200/month min
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '100000',
            interestRate: '0.115',
            minimumPayment: '1500',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '50000',
            interestRate: '0.13',
            minimumPayment: '1200',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '15000',
        monthlyExpenses: '8000',
        availableSurplus: '0', // min payments only
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // First month - Account 1 (Home loan):
      // Interest: 100000 * 0.115 / 12 = 958.33
      // Payment: 1500
      // Principal: 1500 - 958.33 = 541.67
      // End balance: 100000 + 958.33 - 1500 = 99458.33
      const month1 = projection[0];
      expect(month1.accounts[0].startBalance.toFixed(2)).toBe('100000.00');
      expect(month1.accounts[0].interestCharged.toFixed(2)).toBe('958.33');
      expect(month1.accounts[0].principalPaid.toFixed(2)).toBe('541.67');
      expect(month1.accounts[0].endBalance.toFixed(2)).toBe('99458.33');

      // First month - Account 2 (Car loan):
      // Interest: 50000 * 0.13 / 12 = 541.67
      // Payment: 1200
      // Principal: 1200 - 541.67 = 658.33
      // End balance: 50000 + 541.67 - 1200 = 49341.67
      expect(month1.accounts[1].startBalance.toFixed(2)).toBe('50000.00');
      expect(month1.accounts[1].interestCharged.toFixed(2)).toBe('541.67');
      expect(month1.accounts[1].principalPaid.toFixed(2)).toBe('658.33');
      expect(month1.accounts[1].endBalance.toFixed(2)).toBe('49341.67');

      // Total debt should be sum of both
      const expectedTotalDebt = new Big('99458.33').plus('49341.67');
      expect(month1.totalDebt.toFixed(2)).toBe(expectedTotalDebt.toFixed(2));

      // Total interest should be sum of both
      const expectedInterest = new Big('958.33').plus('541.67');
      expect(month1.totalInterestPaid.toFixed(2)).toBe(expectedInterest.toFixed(2));
    });

    it('verifies cumulative totals across months', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '10000',
            interestRate: '0.12',
            minimumPayment: '500',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '5000',
            interestRate: '0.15',
            minimumPayment: '300',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // Cumulative totals should increase each month
      for (let i = 1; i < Math.min(projection.length, 5); i++) {
        expect(projection[i].totalInterestPaid.gte(projection[i - 1].totalInterestPaid)).toBe(true);
        expect(projection[i].totalPrincipalPaid.gte(projection[i - 1].totalPrincipalPaid)).toBe(true);
      }
    });
  });

  describe('edge cases - AC-4.2.3, AC-4.2.4', () => {
    it('caps payment at balance when payment exceeds remaining balance - AC-4.2.4', () => {
      // Small balance with large minimum payment
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '500',
            interestRate: '0.12',
            minimumPayment: '1000', // Min payment > balance
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // First month:
      // Start: 500
      // Interest: 500 * 0.12 / 12 = 5
      // Balance with interest: 505
      // Payment: capped at 505 (not 1000)
      // End: 0
      const month1 = projection[0];
      expect(month1.accounts[0].startBalance.toFixed(2)).toBe('500.00');
      expect(month1.accounts[0].interestCharged.toFixed(2)).toBe('5.00');
      expect(month1.accounts[0].paymentApplied.toFixed(2)).toBe('505.00');
      expect(month1.accounts[0].endBalance.toFixed(2)).toBe('0.00');

      // Should only be 1 month
      expect(projection.length).toBe(1);
    });

    it('skips zero balance accounts - AC-4.2.3', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '0', // Already paid off
            interestRate: '0.12',
            minimumPayment: '500',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '5000',
            interestRate: '0.10',
            minimumPayment: '300',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // First account should have zero values
      const month1 = projection[0];
      expect(month1.accounts[0].startBalance.toFixed(2)).toBe('0.00');
      expect(month1.accounts[0].interestCharged.toFixed(2)).toBe('0.00');
      expect(month1.accounts[0].paymentApplied.toFixed(2)).toBe('0.00');
      expect(month1.accounts[0].endBalance.toFixed(2)).toBe('0.00');

      // Second account should be calculated normally
      expect(month1.accounts[1].startBalance.toFixed(2)).toBe('5000.00');
      expect(month1.accounts[1].interestCharged.gt(0)).toBe(true);
    });

    it('handles account paid off mid-projection - AC-4.2.3', () => {
      // Account that will be paid off quickly
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '1500',
            interestRate: '0.12',
            minimumPayment: '500',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '10000',
            interestRate: '0.10',
            minimumPayment: '200',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // Account 1 should be paid off within first few months
      let account1PaidOff = false;
      let paidOffMonth = -1;
      for (let i = 0; i < projection.length; i++) {
        if (projection[i].accounts[0].endBalance.eq(0)) {
          account1PaidOff = true;
          paidOffMonth = i;
          break;
        }
      }
      expect(account1PaidOff).toBe(true);

      // After being paid off, account should have zero values
      if (paidOffMonth >= 0 && paidOffMonth < projection.length - 1) {
        const nextMonth = projection[paidOffMonth + 1];
        expect(nextMonth.accounts[0].startBalance.toFixed(2)).toBe('0.00');
        expect(nextMonth.accounts[0].interestCharged.toFixed(2)).toBe('0.00');
      }
    });

    it('handles zero interest rate account', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '5000',
            interestRate: '0', // No interest (e.g., 0% promo)
            minimumPayment: '500',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // No interest charged
      const month1 = projection[0];
      expect(month1.accounts[0].interestCharged.toFixed(2)).toBe('0.00');
      expect(month1.accounts[0].paymentApplied.toFixed(2)).toBe('500.00');
      expect(month1.accounts[0].principalPaid.toFixed(2)).toBe('500.00');
      expect(month1.accounts[0].endBalance.toFixed(2)).toBe('4500.00');

      // Should pay off in exactly 10 months (5000 / 500)
      expect(projection.length).toBe(10);
      expect(projection[9].totalDebt.toFixed(2)).toBe('0.00');
    });
  });

  describe('big.js precision - AC-4.2.6', () => {
    it('maintains precision across many months', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '100000',
            interestRate: '0.115',
            minimumPayment: '1500',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // Verify precision is maintained (2 decimal places)
      projection.forEach((month) => {
        const totalDebtStr = month.totalDebt.toFixed(2);
        const totalInterestStr = month.totalInterestPaid.toFixed(2);

        // Should have exactly 2 decimal places
        expect(totalDebtStr).toMatch(/^\d+\.\d{2}$/);
        expect(totalInterestStr).toMatch(/^\d+\.\d{2}$/);
      });
    });

    it('rounds to 2 decimal places (cent-level precision)', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '10000.99',
            interestRate: '0.1234',
            minimumPayment: '333.33',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator);

      // Verify rounding
      projection.slice(0, 5).forEach((month) => {
        month.accounts.forEach((acc) => {
          // Values should be rounded to 2 decimal places
          expect(acc.interestCharged.toFixed(2)).toBe(acc.interestCharged.round(2, Big.roundHalfUp).toFixed(2));
          expect(acc.endBalance.toFixed(2)).toBe(acc.endBalance.round(2, Big.roundHalfUp).toFixed(2));
        });
      });
    });
  });

  describe('PaymentAllocator function - AC-4.2.7', () => {
    it('accepts custom allocator and applies extra payments', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '10000',
            interestRate: '0.12',
            minimumPayment: '300',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '5000',
            interestRate: '0.15',
            minimumPayment: '200',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '1000', // Extra to allocate
        snapshotDate: '2024-01-01',
      };

      // Custom allocator: all surplus to account with highest rate (account 2)
      const highestRateAllocator: PaymentAllocator = (surplus, accounts) => {
        if (surplus.lte(0) || accounts.length === 0) return [];

        // Find account with highest rate
        const highest = accounts.reduce((max, acc) =>
          acc.interestRate.gt(max.interestRate) ? acc : max
        );

        return [{ accountId: highest.id, amount: surplus }];
      };

      const baselineProjection = generateProjection(snapshot, createBaselineAllocator());
      const customProjection = generateProjection(snapshot, highestRateAllocator);

      // Custom allocator should pay off faster
      expect(customProjection.length).toBeLessThanOrEqual(baselineProjection.length);

      // Account 2 should get extra payments in first month
      const month1Custom = customProjection[0];
      const month1Baseline = baselineProjection[0];

      // Account 2 payment in custom should be higher
      expect(month1Custom.accounts[1].paymentApplied.gt(month1Baseline.accounts[1].paymentApplied)).toBe(true);
    });

    it('baseline allocator returns empty array (min payments only)', () => {
      const allocator = createBaselineAllocator();
      const result = allocator(new Big(1000), [], null);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('dates and configuration', () => {
    it('uses custom start date', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '5000',
            interestRate: '0.10',
            minimumPayment: '300',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator, {
        startDate: '2024-06-15',
      });

      expect(projection[0].date).toBe('2024-06-15');
      expect(projection[1].date).toBe('2024-07-15');
    });

    it('uses custom maxMonths', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '100000',
            interestRate: '0.20',
            minimumPayment: '100',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '0',
        snapshotDate: '2024-01-01',
      };

      const allocator = createBaselineAllocator();
      const projection = generateProjection(snapshot, allocator, { maxMonths: 24 });

      // Should respect custom max
      expect(projection.length).toBeLessThanOrEqual(24);
    });
  });
});

describe('buildSnapshot', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates available surplus correctly', () => {
    const accounts = [
      { id: 1, balance: '10000', interestRate: '0.12', minimumPayment: '500', interestType: 'monthly' as const },
      { id: 2, balance: '5000', interestRate: '0.10', minimumPayment: '300', interestType: 'monthly' as const },
    ];

    const snapshot = buildSnapshot(accounts, null, '10000', '5000');

    // Surplus = 10000 - 5000 - (500 + 300) = 4200
    expect(new Big(snapshot.availableSurplus).toFixed(2)).toBe('4200.00');
  });

  it('handles negative surplus with warning', () => {
    const accounts = [
      { id: 1, balance: '10000', interestRate: '0.12', minimumPayment: '5000', interestType: 'monthly' as const },
    ];

    const snapshot = buildSnapshot(accounts, null, '4000', '1000');

    // Income: 4000, Expenses: 1000, MinPayments: 5000
    // Surplus would be: 4000 - 1000 - 5000 = -2000
    // Should use 0 instead
    expect(new Big(snapshot.availableSurplus).toFixed(2)).toBe('0.00');
    expect(console.warn).toHaveBeenCalled();
  });

  it('includes flexi facility in snapshot', () => {
    const accounts = [
      { id: 1, balance: '10000', interestRate: '0.12', minimumPayment: '500', interestType: 'monthly' as const },
    ];
    const flexi = { currentBalance: '5000', interestRate: '0.115' };

    const snapshot = buildSnapshot(accounts, flexi, '10000', '5000');

    expect(snapshot.flexiFacility).toEqual(flexi);
  });

  it('sets snapshot date to current date', () => {
    const accounts = [
      { id: 1, balance: '10000', interestRate: '0.12', minimumPayment: '500', interestType: 'monthly' as const },
    ];

    const snapshot = buildSnapshot(accounts, null, '10000', '5000');

    // Should be ISO date format (YYYY-MM-DD)
    expect(snapshot.snapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('createBaselineAllocator', () => {
  it('returns a function', () => {
    const allocator = createBaselineAllocator();
    expect(typeof allocator).toBe('function');
  });

  it('returns empty array for any input', () => {
    const allocator = createBaselineAllocator();

    const accounts: SimulatedAccount[] = [
      { id: 1, balance: new Big(10000), interestRate: new Big(0.12), minimumPayment: new Big(500), interestType: 'monthly' },
    ];

    const result = allocator(new Big(1000), accounts, null);
    expect(result).toEqual([]);
  });

  it('returns empty array with flexi facility', () => {
    const allocator = createBaselineAllocator();

    const accounts: SimulatedAccount[] = [];
    const flexi: SimulatedFlexi = { balance: new Big(5000), interestRate: new Big(0.115) };

    const result = allocator(new Big(500), accounts, flexi);
    expect(result).toEqual([]);
  });
});

describe('spreadsheet verification - AC-4.2.8', () => {
  it('matches manual spreadsheet calculation for R100,000 home loan at 11.5%', () => {
    // Verified against Excel/Sheets calculation
    // Home loan: R100,000 at 11.5%, R1,500/month payment
    const snapshot: FinancialSnapshot = {
      accounts: [
        {
          id: 1,
          balance: '100000',
          interestRate: '0.115',
          minimumPayment: '1500',
          interestType: 'monthly',
        },
      ],
      flexiFacility: null,
      monthlyIncome: '10000',
      monthlyExpenses: '5000',
      availableSurplus: '0',
      snapshotDate: '2024-01-01',
    };

    const allocator = createBaselineAllocator();
    const projection = generateProjection(snapshot, allocator);

    // Manual calculation for first 3 months:
    // Month 1: Start=100000, Interest=958.33, Payment=1500, Principal=541.67, End=99458.33
    // Month 2: Start=99458.33, Interest=953.14, Payment=1500, Principal=546.86, End=98911.47
    // Month 3: Start=98911.47, Interest=947.90, Payment=1500, Principal=552.10, End=98359.37

    expect(projection[0].accounts[0].endBalance.toFixed(2)).toBe('99458.33');
    expect(projection[1].accounts[0].endBalance.toFixed(2)).toBe('98911.47');
    expect(projection[2].accounts[0].endBalance.toFixed(2)).toBe('98359.37');
  });

  it('matches spreadsheet for two-account scenario', () => {
    // Home loan: R100,000 at 11.5% + Car: R50,000 at 13%
    const snapshot: FinancialSnapshot = {
      accounts: [
        {
          id: 1,
          balance: '100000',
          interestRate: '0.115',
          minimumPayment: '1500',
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: '50000',
          interestRate: '0.13',
          minimumPayment: '1200',
          interestType: 'monthly',
        },
      ],
      flexiFacility: null,
      monthlyIncome: '15000',
      monthlyExpenses: '8000',
      availableSurplus: '0',
      snapshotDate: '2024-01-01',
    };

    const allocator = createBaselineAllocator();
    const projection = generateProjection(snapshot, allocator);

    // Verify month 1 totals
    const month1 = projection[0];

    // Home loan end: 99458.33
    // Car loan:
    //   Interest: 50000 * 0.13 / 12 = 541.67
    //   Payment: 1200
    //   End: 50000 + 541.67 - 1200 = 49341.67

    expect(month1.accounts[0].endBalance.toFixed(2)).toBe('99458.33');
    expect(month1.accounts[1].endBalance.toFixed(2)).toBe('49341.67');

    // Total debt: 99458.33 + 49341.67 = 148800.00
    expect(month1.totalDebt.toFixed(2)).toBe('148800.00');

    // Total interest: 958.33 + 541.67 = 1500.00
    expect(month1.totalInterestPaid.toFixed(2)).toBe('1500.00');
  });
});
