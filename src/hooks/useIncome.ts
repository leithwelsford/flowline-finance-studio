import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Big from 'big.js';
import { db } from '@/lib/db';
import { ok, err, type Result } from '@/lib/utils/result';
import type { IncomeEntry } from '@/types/income';

/**
 * Income data for creating a new entry (without id and createdAt)
 */
export type NewIncomeData = Omit<IncomeEntry, 'id' | 'createdAt'>;

/**
 * Return type for useIncome hook
 */
export interface UseIncomeReturn {
  /** List of all income entries */
  incomeEntries: IncomeEntry[];
  /** Whether the query is still loading */
  isLoading: boolean;
  /** Add a new income entry */
  addIncome: (income: NewIncomeData) => Promise<Result<number>>;
  /** Update an existing income entry */
  updateIncome: (id: number, updates: Partial<IncomeEntry>) => Promise<Result<void>>;
  /** Delete an income entry */
  deleteIncome: (id: number) => Promise<Result<void>>;
  /** Total monthly income from all sources (big.js sum) */
  totalMonthlyIncome: string;
}

/**
 * Hook for managing income entries with Dexie
 *
 * Provides reactive income list via useLiveQuery and CRUD operations.
 * All monetary calculations use big.js for precision.
 *
 * @example
 * ```tsx
 * const { incomeEntries, addIncome, totalMonthlyIncome } = useIncome();
 *
 * const handleSave = async (data) => {
 *   const result = await addIncome(data);
 *   if (result.success) {
 *     toast.success('Income source saved');
 *   }
 * };
 * ```
 */
export function useIncome(): UseIncomeReturn {
  const incomeEntries = useLiveQuery(() => db.income.toArray()) ?? [];
  const isLoading = incomeEntries === undefined;

  /**
   * Add a new income entry to the database
   */
  const addIncome = async (income: NewIncomeData): Promise<Result<number>> => {
    try {
      const now = new Date().toISOString();
      const id = await db.income.add({
        ...income,
        createdAt: now,
      } as IncomeEntry);
      return ok(id);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to add income'));
    }
  };

  /**
   * Update an existing income entry
   */
  const updateIncome = async (
    id: number,
    updates: Partial<IncomeEntry>
  ): Promise<Result<void>> => {
    try {
      await db.income.update(id, updates);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update income'));
    }
  };

  /**
   * Delete an income entry from the database
   */
  const deleteIncome = async (id: number): Promise<Result<void>> => {
    try {
      await db.income.delete(id);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete income'));
    }
  };

  /**
   * Calculate total monthly income using big.js for precision
   */
  const totalMonthlyIncome = useMemo(() => {
    if (!incomeEntries || incomeEntries.length === 0) return '0';
    return incomeEntries
      .reduce((sum, entry) => sum.plus(new Big(entry.amount || '0')), new Big(0))
      .toString();
  }, [incomeEntries]);

  return {
    incomeEntries,
    isLoading,
    addIncome,
    updateIncome,
    deleteIncome,
    totalMonthlyIncome,
  };
}
