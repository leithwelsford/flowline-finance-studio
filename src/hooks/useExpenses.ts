import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Big from 'big.js';
import { db } from '@/lib/db';
import { ok, err, type Result } from '@/lib/utils/result';
import type { ExpenseEntry, ExpenseCategory } from '@/types/expense';

/**
 * Expense data for creating a new entry (without id and createdAt)
 */
export type NewExpenseData = Omit<ExpenseEntry, 'id' | 'createdAt'>;

/**
 * Return type for useExpenses hook
 */
export interface UseExpensesReturn {
  /** List of all expense entries */
  expenses: ExpenseEntry[];
  /** Whether the query is still loading */
  isLoading: boolean;
  /** Add a new expense entry */
  addExpense: (expense: NewExpenseData) => Promise<Result<number>>;
  /** Update an existing expense entry */
  updateExpense: (id: number, updates: Partial<ExpenseEntry>) => Promise<Result<void>>;
  /** Delete an expense entry */
  deleteExpense: (id: number) => Promise<Result<void>>;
  /** Total monthly expenses from all categories (big.js sum) */
  totalMonthlyExpenses: string;
  /** Expenses grouped by category with totals */
  expensesByCategory: Map<ExpenseCategory, string>;
}

/**
 * Hook for managing expense entries with Dexie
 *
 * Provides reactive expense list via useLiveQuery and CRUD operations.
 * All monetary calculations use big.js for precision.
 *
 * @example
 * ```tsx
 * const { expenses, addExpense, totalMonthlyExpenses, expensesByCategory } = useExpenses();
 *
 * const handleSave = async (data) => {
 *   const result = await addExpense(data);
 *   if (result.success) {
 *     toast.success('Expense saved');
 *   }
 * };
 * ```
 */
export function useExpenses(): UseExpensesReturn {
  const queryResult = useLiveQuery(() => db.expenses.toArray());
  const expenses = queryResult ?? [];
  const isLoading = queryResult === undefined;

  /**
   * Add a new expense entry to the database
   */
  const addExpense = async (expense: NewExpenseData): Promise<Result<number>> => {
    try {
      const now = new Date().toISOString();
      const id = await db.expenses.add({
        ...expense,
        createdAt: now,
      } as ExpenseEntry);
      return ok(id);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to add expense'));
    }
  };

  /**
   * Update an existing expense entry
   */
  const updateExpense = async (
    id: number,
    updates: Partial<ExpenseEntry>
  ): Promise<Result<void>> => {
    try {
      await db.expenses.update(id, updates);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update expense'));
    }
  };

  /**
   * Delete an expense entry from the database
   */
  const deleteExpense = async (id: number): Promise<Result<void>> => {
    try {
      await db.expenses.delete(id);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete expense'));
    }
  };

  /**
   * Calculate total monthly expenses using big.js for precision
   */
  const totalMonthlyExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return '0';
    return expenses
      .reduce((sum, entry) => sum.plus(new Big(entry.amount || '0')), new Big(0))
      .toString();
  }, [expenses]);

  /**
   * Group expenses by category with summed totals
   */
  const expensesByCategory = useMemo(() => {
    if (!expenses || expenses.length === 0) return new Map<ExpenseCategory, string>();

    const grouped = new Map<ExpenseCategory, string>();

    for (const expense of expenses) {
      const current = grouped.get(expense.category) || '0';
      grouped.set(
        expense.category,
        new Big(current).plus(new Big(expense.amount || '0')).toString()
      );
    }

    return grouped;
  }, [expenses]);

  return {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    totalMonthlyExpenses,
    expensesByCategory,
  };
}
