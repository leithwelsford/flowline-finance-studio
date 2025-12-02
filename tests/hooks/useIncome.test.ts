import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { useIncome } from '@/hooks/useIncome';
import { db } from '@/lib/db';
import type { IncomeEntry } from '@/types/income';

const testIncome: Omit<IncomeEntry, 'id' | 'createdAt'> = {
  source: 'Salary',
  amount: '45000',
  paymentDate: 25,
};

describe('useIncome', () => {
  beforeEach(async () => {
    await db.income.clear();
  });

  describe('initial state', () => {
    it('returns empty array initially', async () => {
      const { result } = renderHook(() => useIncome());

      await waitFor(() => {
        expect(result.current.incomeEntries).toEqual([]);
      });
    });

    it('returns zero total income initially', async () => {
      const { result } = renderHook(() => useIncome());

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('0');
      });
    });
  });

  describe('addIncome', () => {
    it('saves income to database and returns id', async () => {
      const { result } = renderHook(() => useIncome());

      let addResult: Awaited<ReturnType<typeof result.current.addIncome>>;
      await act(async () => {
        addResult = await result.current.addIncome(testIncome);
      });

      expect(addResult!.success).toBe(true);
      if (addResult!.success) {
        expect(typeof addResult.data).toBe('number');
      }

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
        expect(result.current.incomeEntries[0].source).toBe('Salary');
      });
    });

    it('sets createdAt timestamp', async () => {
      const { result } = renderHook(() => useIncome());
      const before = new Date().toISOString();

      await act(async () => {
        await result.current.addIncome(testIncome);
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
      });

      const income = result.current.incomeEntries[0];
      expect(income.createdAt).toBeDefined();
      expect(income.createdAt >= before).toBe(true);
    });

    it('allows multiple income entries', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome);
        await result.current.addIncome({
          source: 'Side Business',
          amount: '5000',
          paymentDate: 15,
        });
        await result.current.addIncome({
          source: 'Rental Income',
          amount: '8000',
          paymentDate: 1,
        });
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(3);
      });
    });

    it('handles optional paymentDate', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome({
          source: 'Freelance',
          amount: '3000',
          paymentDate: undefined as unknown as number, // optional field
        });
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
        expect(result.current.incomeEntries[0].paymentDate).toBeUndefined();
      });
    });
  });

  describe('updateIncome', () => {
    it('updates income in database', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome);
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
      });

      const incomeId = result.current.incomeEntries[0].id!;

      await act(async () => {
        await result.current.updateIncome(incomeId, { amount: '50000' });
      });

      await waitFor(() => {
        expect(result.current.incomeEntries[0].amount).toBe('50000');
      });
    });

    it('returns success result on update', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome);
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
      });

      const incomeId = result.current.incomeEntries[0].id!;

      let updateResult: Awaited<ReturnType<typeof result.current.updateIncome>>;
      await act(async () => {
        updateResult = await result.current.updateIncome(incomeId, { source: 'Updated Salary' });
      });

      expect(updateResult!.success).toBe(true);
    });

    it('updates multiple fields at once', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome);
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
      });

      const incomeId = result.current.incomeEntries[0].id!;

      await act(async () => {
        await result.current.updateIncome(incomeId, {
          source: 'Updated Source',
          amount: '60000',
          paymentDate: 30,
        });
      });

      await waitFor(() => {
        const updated = result.current.incomeEntries[0];
        expect(updated.source).toBe('Updated Source');
        expect(updated.amount).toBe('60000');
        expect(updated.paymentDate).toBe(30);
      });
    });
  });

  describe('deleteIncome', () => {
    it('removes income from database', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome);
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
      });

      const incomeId = result.current.incomeEntries[0].id!;

      await act(async () => {
        await result.current.deleteIncome(incomeId);
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(0);
      });
    });

    it('returns success result on delete', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome);
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
      });

      const incomeId = result.current.incomeEntries[0].id!;

      let deleteResult: Awaited<ReturnType<typeof result.current.deleteIncome>>;
      await act(async () => {
        deleteResult = await result.current.deleteIncome(incomeId);
      });

      expect(deleteResult!.success).toBe(true);
    });

    it('only deletes specified entry', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome);
        await result.current.addIncome({
          source: 'Side Business',
          amount: '5000',
          paymentDate: 15,
        });
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(2);
      });

      const firstIncomeId = result.current.incomeEntries[0].id!;

      await act(async () => {
        await result.current.deleteIncome(firstIncomeId);
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
        expect(result.current.incomeEntries[0].source).toBe('Side Business');
      });
    });
  });

  describe('totalMonthlyIncome calculation', () => {
    it('calculates total from single income', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome); // 45000
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('45000');
      });
    });

    it('calculates total from multiple incomes', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome({ source: 'Salary', amount: '45000', paymentDate: 25 });
        await result.current.addIncome({ source: 'Side Business', amount: '5000', paymentDate: 15 });
        await result.current.addIncome({ source: 'Rental Income', amount: '8000', paymentDate: 1 });
      });

      await waitFor(() => {
        // 45000 + 5000 + 8000 = 58000
        expect(result.current.totalMonthlyIncome).toBe('58000');
      });
    });

    it('handles decimal values correctly with big.js', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome({ source: 'Income 1', amount: '10000.50', paymentDate: 25 });
        await result.current.addIncome({ source: 'Income 2', amount: '5000.75', paymentDate: 15 });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('15001.25');
      });
    });

    it('updates when income is added', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome({ source: 'Salary', amount: '45000', paymentDate: 25 });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('45000');
      });

      await act(async () => {
        await result.current.addIncome({ source: 'Bonus', amount: '10000', paymentDate: 1 });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('55000');
      });
    });

    it('updates when income is updated', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome); // 45000
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('45000');
      });

      const incomeId = result.current.incomeEntries[0].id!;

      await act(async () => {
        await result.current.updateIncome(incomeId, { amount: '50000' });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('50000');
      });
    });

    it('updates when income is deleted', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome({ source: 'Salary', amount: '45000', paymentDate: 25 });
        await result.current.addIncome({ source: 'Side Business', amount: '5000', paymentDate: 15 });
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('50000');
      });

      const firstId = result.current.incomeEntries[0].id!;

      await act(async () => {
        await result.current.deleteIncome(firstId);
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('5000');
      });
    });

    it('returns zero when all incomes deleted', async () => {
      const { result } = renderHook(() => useIncome());

      await act(async () => {
        await result.current.addIncome(testIncome);
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
      });

      const incomeId = result.current.incomeEntries[0].id!;

      await act(async () => {
        await result.current.deleteIncome(incomeId);
      });

      await waitFor(() => {
        expect(result.current.totalMonthlyIncome).toBe('0');
        expect(result.current.incomeEntries).toHaveLength(0);
      });
    });
  });

  describe('reactive updates (useLiveQuery)', () => {
    it('reflects external database changes', async () => {
      const { result } = renderHook(() => useIncome());

      // Add income entry directly to database
      await act(async () => {
        await db.income.add({
          source: 'External Add',
          amount: '12000',
          paymentDate: 10,
          createdAt: new Date().toISOString(),
        });
      });

      await waitFor(() => {
        expect(result.current.incomeEntries).toHaveLength(1);
        expect(result.current.incomeEntries[0].source).toBe('External Add');
        expect(result.current.totalMonthlyIncome).toBe('12000');
      });
    });
  });
});
