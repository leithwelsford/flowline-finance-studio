import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { useIncomeExpense } from '@/hooks/useIncomeExpense';
import { useIncome } from '@/hooks/useIncome';
import { useExpenses } from '@/hooks/useExpenses';
import { db } from '@/lib/db';

describe('useIncomeExpense', () => {
  beforeEach(async () => {
    await db.accounts.clear();
    await db.income.clear();
    await db.expenses.clear();
    await db.flexiFacility.clear();
  });

  describe('initial state', () => {
    it('returns null incomeExpense when no data exists', async () => {
      const { result } = renderHook(() => useIncomeExpense());

      await waitFor(() => {
        expect(result.current.incomeExpense).toBeNull();
        expect(result.current.error).toBeNull();
      });
    });

    it('returns isLoading initially', () => {
      const { result } = renderHook(() => useIncomeExpense());
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });

  describe('discretionary amount calculation - AC-3.2.4', () => {
    it('calculates discretionary amount correctly (income - expenses)', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Rent',
          amount: '3000',
          category: 'Housing',
        });
      });

      // Discretionary = 10000 - 3000 = 7000
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.discretionaryAmount).toBe('7000');
      });
    });

    it('handles negative discretionary (expenses > income)', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '5000',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Expenses',
          amount: '7000',
          category: 'Food',
        });
      });

      // Discretionary = 5000 - 7000 = -2000
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.discretionaryAmount).toBe('-2000');
      });
    });
  });

  describe('savings rate calculation - AC-3.2.5', () => {
    it('calculates positive savings rate correctly', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '6000',
          category: 'Food',
        });
      });

      // Savings rate = (10000 - 6000) / 10000 × 100 = 40%
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.savingsRate).toBe('40.0');
      });
    });

    it('calculates negative savings rate correctly (expenses > income)', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '12000',
          category: 'Food',
        });
      });

      // Savings rate = (10000 - 12000) / 10000 × 100 = -20%
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.savingsRate).toBe('-20.0');
      });
    });

    it('calculates zero savings rate when income equals expenses', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '10000',
          category: 'Food',
        });
      });

      // Savings rate = 0 / 10000 × 100 = 0%
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.savingsRate).toBe('0.0');
      });
    });
  });

  describe('edge cases', () => {
    it('returns savingsRate 0 when income is zero (no division by zero)', async () => {
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '5000',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.savingsRate).toBe('0');
        expect(incomeExpenseHook.result.current.incomeExpense?.totalIncome).toBe('0');
        expect(incomeExpenseHook.result.current.incomeExpense?.discretionaryAmount).toBe('-5000');
      });
    });

    it('returns null when no income and no expense data', async () => {
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense).toBeNull();
      });
    });

    it('handles income-only scenario (no expenses)', async () => {
      const incomeHook = renderHook(() => useIncome());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      // 100% savings rate, full discretionary
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.savingsRate).toBe('100.0');
        expect(incomeExpenseHook.result.current.incomeExpense?.discretionaryAmount).toBe('10000');
        expect(incomeExpenseHook.result.current.incomeExpense?.totalExpenses).toBe('0');
      });
    });
  });

  describe('total income and expenses - AC-3.2.2, AC-3.2.3', () => {
    it('returns total income correctly', async () => {
      const incomeHook = renderHook(() => useIncome());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '15000',
          frequency: 'monthly',
        });
        await incomeHook.result.current.addIncome({
          source: 'Side Income',
          amount: '5000',
          frequency: 'monthly',
        });
      });

      // Total income = 15000 + 5000 = 20000
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.totalIncome).toBe('20000');
      });
    });

    it('returns total expenses correctly', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '20000',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Rent',
          amount: '5000',
          category: 'Housing',
        });
        await expensesHook.result.current.addExpense({
          description: 'Food',
          amount: '3000',
          category: 'Food',
        });
      });

      // Total expenses = 5000 + 3000 = 8000
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.totalExpenses).toBe('8000');
      });
    });
  });

  describe('big.js precision', () => {
    it('handles decimal calculations correctly', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

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

      // Discretionary = 10000.50 - 5000.25 = 5000.25
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.discretionaryAmount).toBe('5000.25');
      });
    });

    it('maintains precision in savings rate calculation', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '30000',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '20000',
          category: 'Food',
        });
      });

      // Savings rate = 10000 / 30000 × 100 = 33.333...%
      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.savingsRate).toBe('33.3');
      });
    });
  });

  describe('reactivity', () => {
    it('updates when income changes', async () => {
      const incomeHook = renderHook(() => useIncome());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense).toBeNull();
      });

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense).not.toBeNull();
        expect(incomeExpenseHook.result.current.incomeExpense?.totalIncome).toBe('10000');
      });
    });

    it('updates when expenses change', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const incomeExpenseHook = renderHook(() => useIncomeExpense());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.savingsRate).toBe('100.0');
      });

      await act(async () => {
        await expensesHook.result.current.addExpense({
          description: 'Living',
          amount: '6000',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(incomeExpenseHook.result.current.incomeExpense?.savingsRate).toBe('40.0');
      });
    });
  });
});
