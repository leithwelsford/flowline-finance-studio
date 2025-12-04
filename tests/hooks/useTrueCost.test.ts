import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { useTrueCost } from '@/hooks/useTrueCost';
import { useAccounts } from '@/hooks/useAccounts';
import { useFlexiFacility } from '@/hooks/useFlexiFacility';
import { useIncome } from '@/hooks/useIncome';
import { db } from '@/lib/db';

describe('useTrueCost', () => {
  beforeEach(async () => {
    await db.accounts.clear();
    await db.income.clear();
    await db.expenses.clear();
    await db.flexiFacility.clear();
  });

  describe('initial state', () => {
    it('returns null trueCost when no accounts exist', async () => {
      const { result } = renderHook(() => useTrueCost());

      await waitFor(() => {
        expect(result.current.trueCost).toBeNull();
        expect(result.current.error).toBeNull();
      });
    });

    it('returns isLoading initially', () => {
      const { result } = renderHook(() => useTrueCost());
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });

  describe('monthlyInterest calculation - AC-3.3.2', () => {
    it('calculates monthly interest for single account', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
      });

      // (100000 × 0.115) / 12 = 958.33
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.monthlyInterest).toBe('958.33');
      });
    });

    it('sums interest from multiple accounts', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
        await accountsHook.result.current.addAccount({
          name: 'Vehicle',
          type: 'vehicle_finance',
          balance: '200000',
          interestRate: '0.10',
          minimumPayment: '3000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
      });

      // 958.33 + 1666.67 = 2625.00
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.monthlyInterest).toBe('2625.00');
      });
    });
  });

  describe('annualInterest calculation - AC-3.3.3', () => {
    it('calculates annual interest as monthly × 12', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
      });

      // 958.33 × 12 = 11500.00 (rounded)
      await waitFor(() => {
        const annual = parseFloat(trueCostHook.result.current.trueCost?.annualInterest || '0');
        expect(annual).toBeCloseTo(11500, 0);
      });
    });
  });

  describe('interestToIncomeRatio calculation - AC-3.3.4', () => {
    it('calculates ratio correctly', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const incomeHook = renderHook(() => useIncome());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.12',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      // Interest = (100000 × 0.12) / 12 = 1000
      // Ratio = (1000 / 10000) × 100 = 10%
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.interestToIncomeRatio).toBe('10.0');
      });
    });
  });

  describe('isHighBurden threshold - AC-3.3.6', () => {
    it('returns true when ratio > 20%', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const incomeHook = renderHook(() => useIncome());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.30',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      // Interest = (100000 × 0.30) / 12 = 2500
      // Ratio = (2500 / 10000) × 100 = 25% > 20%
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.isHighBurden).toBe(true);
      });
    });

    it('returns false when ratio <= 20%', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const incomeHook = renderHook(() => useIncome());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.12',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      // Interest = 1000, Ratio = 10% <= 20%
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.isHighBurden).toBe(false);
      });
    });

    it('returns false when ratio exactly 20%', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const incomeHook = renderHook(() => useIncome());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.24',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      // Interest = (100000 × 0.24) / 12 = 2000
      // Ratio = (2000 / 10000) × 100 = 20% (not > 20)
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.isHighBurden).toBe(false);
      });
    });
  });

  describe('edge cases - AC-3.3.8', () => {
    it('returns null when no accounts', async () => {
      const trueCostHook = renderHook(() => useTrueCost());

      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost).toBeNull();
      });
    });

    it('returns ratio 0 when no income (no division by zero)', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
      });

      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.interestToIncomeRatio).toBe('0.0');
        expect(trueCostHook.result.current.trueCost?.isHighBurden).toBe(false);
      });
    });

    it('handles zero balance account', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '0',
          interestRate: '0.115',
          minimumPayment: '0',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
      });

      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.monthlyInterest).toBe('0.00');
      });
    });

    it('handles zero interest rate account', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
      });

      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.monthlyInterest).toBe('0.00');
      });
    });
  });

  describe('with flexi facility - AC-3.3.8', () => {
    it('includes flexi facility interest', async () => {
      const flexiHook = renderHook(() => useFlexiFacility());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await flexiHook.result.current.saveFacility({
          name: 'FNB Flexi',
          type: 'fnb_flexi',
          creditLimit: '200000',
          currentBalance: '100000',
          interestRate: '0.115',
        });
      });

      // Flexi uses daily: (100000 × 0.115) / 365 × 30 = 945.21
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.monthlyInterest).toBe('945.21');
      });
    });

    it('combines accounts and flexi facility interest', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const flexiHook = renderHook(() => useFlexiFacility());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
        await flexiHook.result.current.saveFacility({
          name: 'FNB Flexi',
          type: 'fnb_flexi',
          creditLimit: '200000',
          currentBalance: '50000',
          interestRate: '0.115',
        });
      });

      // Account: 958.33... + Flexi: 472.60... = 1430.94 (with rounding)
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.monthlyInterest).toBe('1430.94');
      });
    });
  });

  describe('mixed account types', () => {
    it('handles daily and monthly interest types', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
        await accountsHook.result.current.addAccount({
          name: 'Credit Card',
          type: 'credit_card',
          balance: '50000',
          interestRate: '0.21',
          minimumPayment: '1500',
          lender: 'Test Bank',
          interestType: 'daily',
        });
      });

      // Monthly: 958.33... + Daily: 863.01... = 1821.35 (with rounding)
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.monthlyInterest).toBe('1821.35');
      });
    });
  });

  describe('big.js precision', () => {
    it('maintains precision in calculations', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const incomeHook = renderHook(() => useIncome());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '333333.33',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '30000',
          frequency: 'monthly',
        });
      });

      await waitFor(() => {
        // Verify precision is maintained
        expect(trueCostHook.result.current.trueCost?.monthlyInterest).toBe('3194.44');
      });
    });
  });

  describe('reactivity', () => {
    it('updates when account added', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const trueCostHook = renderHook(() => useTrueCost());

      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost).toBeNull();
      });

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
      });

      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost).not.toBeNull();
        expect(trueCostHook.result.current.trueCost?.monthlyInterest).toBe('958.33');
      });
    });

    it('updates when income changes', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const incomeHook = renderHook(() => useIncome());
      const trueCostHook = renderHook(() => useTrueCost());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'home_loan',
          balance: '100000',
          interestRate: '0.24',
          minimumPayment: '5000',
          lender: 'Test Bank',
          interestType: 'monthly',
        });
      });

      // No income - ratio should be 0
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.interestToIncomeRatio).toBe('0.0');
      });

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      // With income of 10000, interest of 2000, ratio = 20%
      await waitFor(() => {
        expect(trueCostHook.result.current.trueCost?.interestToIncomeRatio).toBe('20.0');
      });
    });
  });
});
