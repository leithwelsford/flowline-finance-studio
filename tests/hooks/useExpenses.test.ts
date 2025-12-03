import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { useExpenses } from '@/hooks/useExpenses';
import { db } from '@/lib/db';
import type { ExpenseEntry, ExpenseCategory } from '@/types/expense';

const testExpense: Omit<ExpenseEntry, 'id' | 'createdAt'> = {
  category: 'housing',
  amount: '12000',
  date: '2024-01-01',
};

describe('useExpenses', () => {
  beforeEach(async () => {
    await db.expenses.clear();
  });

  describe('initial state', () => {
    it('returns empty array initially', async () => {
      const { result } = renderHook(() => useExpenses());

      await waitFor(() => {
        expect(result.current.expenses).toEqual([]);
      });
    });

    it('returns zero total expenses initially', async () => {
      const { result } = renderHook(() => useExpenses());

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('0');
      });
    });

    it('returns empty expensesByCategory map initially', async () => {
      const { result } = renderHook(() => useExpenses());

      await waitFor(() => {
        expect(result.current.expensesByCategory.size).toBe(0);
      });
    });
  });

  describe('addExpense', () => {
    it('saves expense to database and returns id', async () => {
      const { result } = renderHook(() => useExpenses());

      let addResult: Awaited<ReturnType<typeof result.current.addExpense>>;
      await act(async () => {
        addResult = await result.current.addExpense(testExpense);
      });

      expect(addResult!.success).toBe(true);
      if (addResult!.success) {
        expect(typeof addResult.data).toBe('number');
      }

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
        expect(result.current.expenses[0].category).toBe('housing');
      });
    });

    it('sets createdAt timestamp', async () => {
      const { result } = renderHook(() => useExpenses());
      const before = new Date().toISOString();

      await act(async () => {
        await result.current.addExpense(testExpense);
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
      });

      const expense = result.current.expenses[0];
      expect(expense.createdAt).toBeDefined();
      expect(expense.createdAt >= before).toBe(true);
    });

    it('allows multiple expense entries', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense);
        await result.current.addExpense({
          category: 'food',
          amount: '5000',
          date: '2024-01-01',
        });
        await result.current.addExpense({
          category: 'transport',
          amount: '3500',
          date: '2024-01-01',
        });
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(3);
      });
    });

    it('saves all expense categories correctly', async () => {
      const { result } = renderHook(() => useExpenses());
      const categories: ExpenseCategory[] = [
        'housing',
        'transport',
        'food',
        'utilities',
        'insurance',
        'entertainment',
        'other',
      ];

      await act(async () => {
        for (const category of categories) {
          await result.current.addExpense({
            category,
            amount: '1000',
            date: '2024-01-01',
          });
        }
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(7);
        const savedCategories = result.current.expenses.map((e) => e.category);
        for (const category of categories) {
          expect(savedCategories).toContain(category);
        }
      });
    });
  });

  describe('updateExpense', () => {
    it('updates expense in database', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense);
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
      });

      const expenseId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.updateExpense(expenseId, { amount: '15000' });
      });

      await waitFor(() => {
        expect(result.current.expenses[0].amount).toBe('15000');
      });
    });

    it('returns success result on update', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense);
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
      });

      const expenseId = result.current.expenses[0].id!;

      let updateResult: Awaited<ReturnType<typeof result.current.updateExpense>>;
      await act(async () => {
        updateResult = await result.current.updateExpense(expenseId, { category: 'food' });
      });

      expect(updateResult!.success).toBe(true);
    });

    it('updates multiple fields at once', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense);
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
      });

      const expenseId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.updateExpense(expenseId, {
          category: 'utilities',
          amount: '1800',
        });
      });

      await waitFor(() => {
        const updated = result.current.expenses[0];
        expect(updated.category).toBe('utilities');
        expect(updated.amount).toBe('1800');
      });
    });
  });

  describe('deleteExpense', () => {
    it('removes expense from database', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense);
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
      });

      const expenseId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.deleteExpense(expenseId);
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(0);
      });
    });

    it('returns success result on delete', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense);
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
      });

      const expenseId = result.current.expenses[0].id!;

      let deleteResult: Awaited<ReturnType<typeof result.current.deleteExpense>>;
      await act(async () => {
        deleteResult = await result.current.deleteExpense(expenseId);
      });

      expect(deleteResult!.success).toBe(true);
    });

    it('only deletes specified entry', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense);
        await result.current.addExpense({
          category: 'food',
          amount: '5000',
          date: '2024-01-01',
        });
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(2);
      });

      const firstExpenseId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.deleteExpense(firstExpenseId);
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
        expect(result.current.expenses[0].category).toBe('food');
      });
    });
  });

  describe('totalMonthlyExpenses calculation', () => {
    it('calculates total from single expense', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense); // 12000
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('12000');
      });
    });

    it('calculates total from multiple expenses', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'housing', amount: '12000', date: '2024-01-01' });
        await result.current.addExpense({ category: 'food', amount: '5000', date: '2024-01-01' });
        await result.current.addExpense({ category: 'transport', amount: '3500', date: '2024-01-01' });
      });

      await waitFor(() => {
        // 12000 + 5000 + 3500 = 20500
        expect(result.current.totalMonthlyExpenses).toBe('20500');
      });
    });

    it('handles decimal values correctly with big.js', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'food', amount: '5000.50', date: '2024-01-01' });
        await result.current.addExpense({ category: 'utilities', amount: '1800.75', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('6801.25');
      });
    });

    it('updates when expense is added', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'housing', amount: '12000', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('12000');
      });

      await act(async () => {
        await result.current.addExpense({ category: 'food', amount: '5000', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('17000');
      });
    });

    it('updates when expense is updated', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense); // 12000
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('12000');
      });

      const expenseId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.updateExpense(expenseId, { amount: '15000' });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('15000');
      });
    });

    it('updates when expense is deleted', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'housing', amount: '12000', date: '2024-01-01' });
        await result.current.addExpense({ category: 'food', amount: '5000', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('17000');
      });

      const firstId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.deleteExpense(firstId);
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('5000');
      });
    });

    it('returns zero when all expenses deleted', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense);
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
      });

      const expenseId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.deleteExpense(expenseId);
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyExpenses).toBe('0');
        expect(result.current.expenses).toHaveLength(0);
      });
    });
  });

  describe('expensesByCategory calculation', () => {
    it('groups single expense by category', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense(testExpense); // housing: 12000
      });

      await waitFor(() => {
        const byCategory = result.current.expensesByCategory;
        expect(byCategory.size).toBe(1);
        expect(byCategory.get('housing')).toBe('12000');
      });
    });

    it('groups multiple expenses by category', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'housing', amount: '12000', date: '2024-01-01' });
        await result.current.addExpense({ category: 'food', amount: '3000', date: '2024-01-01' });
        await result.current.addExpense({ category: 'food', amount: '2000', date: '2024-01-01' });
        await result.current.addExpense({ category: 'transport', amount: '3500', date: '2024-01-01' });
      });

      await waitFor(() => {
        const byCategory = result.current.expensesByCategory;
        expect(byCategory.size).toBe(3);
        expect(byCategory.get('housing')).toBe('12000');
        expect(byCategory.get('food')).toBe('5000'); // 3000 + 2000
        expect(byCategory.get('transport')).toBe('3500');
      });
    });

    it('sums multiple expenses in same category with big.js precision', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'food', amount: '2500.50', date: '2024-01-01' });
        await result.current.addExpense({ category: 'food', amount: '1500.25', date: '2024-01-01' });
        await result.current.addExpense({ category: 'food', amount: '1000.75', date: '2024-01-01' });
      });

      await waitFor(() => {
        const byCategory = result.current.expensesByCategory;
        // 2500.50 + 1500.25 + 1000.75 = 5001.50
        expect(byCategory.get('food')).toBe('5001.5');
      });
    });

    it('updates when expense is added', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'food', amount: '3000', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.get('food')).toBe('3000');
      });

      await act(async () => {
        await result.current.addExpense({ category: 'food', amount: '2000', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.get('food')).toBe('5000');
      });
    });

    it('updates when expense is updated', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'food', amount: '3000', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.get('food')).toBe('3000');
      });

      const expenseId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.updateExpense(expenseId, { amount: '4000' });
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.get('food')).toBe('4000');
      });
    });

    it('updates when expense category is changed', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'food', amount: '3000', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.get('food')).toBe('3000');
        expect(result.current.expensesByCategory.has('transport')).toBe(false);
      });

      const expenseId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.updateExpense(expenseId, { category: 'transport' });
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.has('food')).toBe(false);
        expect(result.current.expensesByCategory.get('transport')).toBe('3000');
      });
    });

    it('updates when expense is deleted', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'food', amount: '3000', date: '2024-01-01' });
        await result.current.addExpense({ category: 'food', amount: '2000', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.get('food')).toBe('5000');
      });

      const firstId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.deleteExpense(firstId);
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.get('food')).toBe('2000');
      });
    });

    it('removes category from map when last expense in that category is deleted', async () => {
      const { result } = renderHook(() => useExpenses());

      await act(async () => {
        await result.current.addExpense({ category: 'food', amount: '3000', date: '2024-01-01' });
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.has('food')).toBe(true);
      });

      const expenseId = result.current.expenses[0].id!;

      await act(async () => {
        await result.current.deleteExpense(expenseId);
      });

      await waitFor(() => {
        expect(result.current.expensesByCategory.has('food')).toBe(false);
        expect(result.current.expensesByCategory.size).toBe(0);
      });
    });
  });

  describe('reactive updates (useLiveQuery)', () => {
    it('reflects external database changes', async () => {
      const { result } = renderHook(() => useExpenses());

      // Add expense entry directly to database
      await act(async () => {
        await db.expenses.add({
          category: 'utilities',
          amount: '1800',
          date: '2024-01-01',
          createdAt: new Date().toISOString(),
        });
      });

      await waitFor(() => {
        expect(result.current.expenses).toHaveLength(1);
        expect(result.current.expenses[0].category).toBe('utilities');
        expect(result.current.totalMonthlyExpenses).toBe('1800');
        expect(result.current.expensesByCategory.get('utilities')).toBe('1800');
      });
    });
  });
});
