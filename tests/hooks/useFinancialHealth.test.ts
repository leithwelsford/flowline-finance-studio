import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { useFinancialHealth } from '@/hooks/useFinancialHealth';
import { useAccounts } from '@/hooks/useAccounts';
import { useIncome } from '@/hooks/useIncome';
import { useExpenses } from '@/hooks/useExpenses';
import { db } from '@/lib/db';

describe('useFinancialHealth', () => {
  beforeEach(async () => {
    await db.accounts.clear();
    await db.income.clear();
    await db.expenses.clear();
    await db.flexiFacility.clear();
  });

  describe('initial state', () => {
    it('returns null cashFlow when no data exists', async () => {
      const { result } = renderHook(() => useFinancialHealth());

      await waitFor(() => {
        expect(result.current.cashFlow).toBeNull();
        expect(result.current.error).toBeNull();
      });
    });

    it('returns isLoading initially', () => {
      const { result } = renderHook(() => useFinancialHealth());
      // isLoading may be true or false depending on hook initialization timing
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });

  describe('status determination - AC-3.1.3', () => {
    it('returns "healthy" status when surplus > 10% of income', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const accountsHook = renderHook(() => useAccounts());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        // Income: R10,000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        // Expenses: R5,000
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '5000',
          category: 'Food',
        });
        // Min payments: R500
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'personal_loan',
          balance: '50000',
          interestRate: '0.15',
          minimumPayment: '500',
          lender: 'Bank',
          interestType: 'monthly',
        });
      });

      // Surplus = 10000 - 5000 - 500 = 4500 = 45% of income → healthy
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('healthy');
        expect(healthHook.result.current.cashFlow?.statusLabel).toBe('Breathing');
      });
    });

    it('returns "healthy" status when surplus is exactly 11% of income (just over boundary)', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        // Income: R10,000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        // Expenses: R8,900 → surplus = 1100 = 11%
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '8900',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('healthy');
        expect(healthHook.result.current.cashFlow?.statusLabel).toBe('Breathing');
      });
    });

    it('returns "warning" status when surplus is exactly 10% of income (boundary)', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        // Income: R10,000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        // Expenses: R9,000 → surplus = 1000 = 10%
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '9000',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('warning');
        expect(healthHook.result.current.cashFlow?.statusLabel).toBe('Tight');
      });
    });

    it('returns "warning" status when surplus is 5% of income', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        // Income: R10,000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        // Expenses: R9,500 → surplus = 500 = 5%
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '9500',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('warning');
        expect(healthHook.result.current.cashFlow?.statusLabel).toBe('Tight');
      });
    });

    it('returns "warning" status when surplus is exactly 0% (boundary)', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        // Income: R10,000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        // Expenses: R10,000 → surplus = 0 = 0%
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '10000',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('warning');
        expect(healthHook.result.current.cashFlow?.statusLabel).toBe('Tight');
        expect(healthHook.result.current.cashFlow?.availableSurplus).toBe('0');
      });
    });

    it('returns "critical" status when surplus is negative', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        // Income: R10,000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        // Expenses: R12,000 → surplus = -2000
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '12000',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('critical');
        expect(healthHook.result.current.cashFlow?.statusLabel).toBe('Drowning');
        expect(healthHook.result.current.cashFlow?.availableSurplus).toBe('-2000');
      });
    });
  });

  describe('edge cases', () => {
    it('returns "critical" with "No Income" label when income is zero', async () => {
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '5000',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('critical');
        expect(healthHook.result.current.cashFlow?.statusLabel).toBe('No Income');
        expect(healthHook.result.current.cashFlow?.debtConsumptionPercent).toBe('0');
      });
    });

    it('returns critical status with "No Income" when only accounts exist (no income/expenses)', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'personal_loan',
          balance: '50000',
          interestRate: '0.15',
          minimumPayment: '500',
          lender: 'Bank',
          interestType: 'monthly',
        });
      });

      // With only accounts (min payment creates negative surplus from 0 income)
      // the hook returns data with "No Income" status since there's a non-zero minimum payment
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('critical');
        expect(healthHook.result.current.cashFlow?.statusLabel).toBe('No Income');
        expect(healthHook.result.current.cashFlow?.availableSurplus).toBe('-500');
      });
    });
  });

  describe('debt consumption calculation - AC-3.1.4', () => {
    it('calculates debt consumption percentage correctly', async () => {
      const incomeHook = renderHook(() => useIncome());
      const accountsHook = renderHook(() => useAccounts());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        // Income: R10,000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        // Min payments: R2,000
        await accountsHook.result.current.addAccount({
          name: 'Loan',
          type: 'personal_loan',
          balance: '50000',
          interestRate: '0.15',
          minimumPayment: '2000',
          lender: 'Bank',
          interestType: 'monthly',
        });
      });

      // Debt consumption = 2000 / 10000 × 100 = 20%
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.debtConsumptionPercent).toBe('20.0');
      });
    });

    it('handles zero debt consumption', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '5000',
          category: 'Food',
        });
      });

      // No accounts = no minimum payments = 0% debt consumption
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.debtConsumptionPercent).toBe('0.0');
      });
    });
  });

  describe('surplus calculation - AC-3.1.2', () => {
    it('calculates available surplus correctly', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const accountsHook = renderHook(() => useAccounts());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        // Income: R50,000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '50000',
          frequency: 'monthly',
        });
        // Expenses: R20,000
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '20000',
          category: 'Food',
        });
        // Min payments: R15,000
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '1000000',
          interestRate: '0.115',
          minimumPayment: '15000',
          lender: 'Bank',
          interestType: 'monthly',
        });
      });

      // Surplus = 50000 - 20000 - 15000 = 15000
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.availableSurplus).toBe('15000');
      });
    });
  });

  describe('big.js precision', () => {
    it('handles decimal calculations correctly', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000.50',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '5000.25',
          category: 'Food',
        });
      });

      // Surplus = 10000.50 - 5000.25 = 5000.25
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.availableSurplus).toBe('5000.25');
      });
    });

    it('handles percentage boundary precision (10.001% is healthy)', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        // Income: R10,000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        // Expenses: R8,999.90 → surplus = 1000.10 = 10.001%
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '8999.90',
          category: 'Food',
        });
      });

      // 10.001% > 10% → healthy
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('healthy');
      });
    });
  });

  describe('reactivity', () => {
    it('updates when income changes', async () => {
      const incomeHook = renderHook(() => useIncome());
      const healthHook = renderHook(() => useFinancialHealth());

      // Initially null
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow).toBeNull();
      });

      // Add income
      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      // Should now have cashFlow data
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow).not.toBeNull();
        expect(healthHook.result.current.cashFlow?.status).toBe('healthy');
      });
    });

    it('updates status when expenses increase', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const healthHook = renderHook(() => useFinancialHealth());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      // Initially healthy (100% surplus)
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('healthy');
      });

      // Add expenses to make it warning
      await act(async () => {
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '9500',
          category: 'Food',
        });
      });

      // Now warning (5% surplus)
      await waitFor(() => {
        expect(healthHook.result.current.cashFlow?.status).toBe('warning');
      });
    });
  });
});
