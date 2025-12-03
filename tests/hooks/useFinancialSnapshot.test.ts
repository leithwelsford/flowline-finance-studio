import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { useFinancialSnapshot } from '@/hooks/useFinancialSnapshot';
import { useAccounts } from '@/hooks/useAccounts';
import { useIncome } from '@/hooks/useIncome';
import { useExpenses } from '@/hooks/useExpenses';
import { useFlexiFacility } from '@/hooks/useFlexiFacility';
import { db } from '@/lib/db';

describe('useFinancialSnapshot', () => {
  beforeEach(async () => {
    await db.accounts.clear();
    await db.income.clear();
    await db.expenses.clear();
    await db.flexiFacility.clear();
  });

  describe('initial state', () => {
    it('returns zero values when no data exists', async () => {
      const { result } = renderHook(() => useFinancialSnapshot());

      await waitFor(() => {
        expect(result.current.snapshot.totalDebt).toBe('0');
        expect(result.current.snapshot.totalMonthlyIncome).toBe('0');
        expect(result.current.snapshot.totalMonthlyExpenses).toBe('0');
        expect(result.current.snapshot.minimumDebtPayments).toBe('0');
        expect(result.current.snapshot.availableSurplus).toBe('0');
        expect(result.current.snapshot.accountCount).toBe(0);
        expect(result.current.snapshot.hasFlexi).toBe(false);
        expect(result.current.snapshot.flexiAvailableCredit).toBeUndefined();
      });
    });

    it('returns isHealthy as false when surplus is zero', async () => {
      const { result } = renderHook(() => useFinancialSnapshot());

      await waitFor(() => {
        expect(result.current.isHealthy).toBe(false);
      });
    });
  });

  describe('snapshot calculations', () => {
    it('calculates totalDebt from accounts', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
        });
        await accountsHook.result.current.addAccount({
          name: 'Car Loan',
          type: 'vehicle',
          balance: '250000',
          interestRate: '0.12',
          minimumPayment: '4000',
          lender: 'WesBank',
          interestType: 'monthly',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalDebt).toBe('750000');
        expect(snapshotHook.result.current.snapshot.accountCount).toBe(2);
      });
    });

    it('calculates minimumDebtPayments from accounts', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
        });
        await accountsHook.result.current.addAccount({
          name: 'Car Loan',
          type: 'vehicle',
          balance: '250000',
          interestRate: '0.12',
          minimumPayment: '4000',
          lender: 'WesBank',
          interestType: 'monthly',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.minimumDebtPayments).toBe('9000');
      });
    });

    it('calculates totalMonthlyIncome from income entries', async () => {
      const incomeHook = renderHook(() => useIncome());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '45000',
          frequency: 'monthly',
        });
        await incomeHook.result.current.addIncome({
          source: 'Freelance',
          amount: '10000',
          frequency: 'monthly',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalMonthlyIncome).toBe('55000');
      });
    });

    it('calculates totalMonthlyExpenses from expense entries', async () => {
      const expensesHook = renderHook(() => useExpenses());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await expensesHook.result.current.addExpense({
          description: 'Groceries',
          amount: '5000',
          category: 'Food',
        });
        await expensesHook.result.current.addExpense({
          description: 'Utilities',
          amount: '2500',
          category: 'Utilities',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalMonthlyExpenses).toBe('7500');
      });
    });

    it('calculates availableSurplus correctly (income - expenses - minPayments)', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        // Income: 50000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '50000',
          frequency: 'monthly',
        });

        // Expenses: 15000
        await expensesHook.result.current.addExpense({
          description: 'Living expenses',
          amount: '15000',
          category: 'Food',
        });

        // Minimum payments: 10000
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '10000',
          lender: 'ABSA',
          interestType: 'monthly',
        });
      });

      // Surplus = 50000 - 15000 - 10000 = 25000
      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.availableSurplus).toBe('25000');
      });
    });

    it('calculates negative surplus correctly', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        // Income: 30000
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '30000',
          frequency: 'monthly',
        });

        // Expenses: 20000
        await expensesHook.result.current.addExpense({
          description: 'Living expenses',
          amount: '20000',
          category: 'Food',
        });

        // Minimum payments: 15000
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '15000',
          lender: 'ABSA',
          interestType: 'monthly',
        });
      });

      // Surplus = 30000 - 20000 - 15000 = -5000
      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.availableSurplus).toBe('-5000');
      });
    });
  });

  describe('isHealthy', () => {
    it('returns true when surplus is positive', async () => {
      const incomeHook = renderHook(() => useIncome());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '50000',
          frequency: 'monthly',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.isHealthy).toBe(true);
      });
    });

    it('returns false when surplus is negative', async () => {
      const expensesHook = renderHook(() => useExpenses());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await expensesHook.result.current.addExpense({
          description: 'Expenses',
          amount: '10000',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.isHealthy).toBe(false);
      });
    });

    it('returns false when surplus is exactly zero', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Expenses',
          amount: '10000',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.availableSurplus).toBe('0');
        expect(snapshotHook.result.current.isHealthy).toBe(false);
      });
    });
  });

  describe('flexi facility', () => {
    it('sets hasFlexi to true when facility exists', async () => {
      const flexiHook = renderHook(() => useFlexiFacility());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await flexiHook.result.current.saveFacility({
          name: 'Access Bond',
          type: 'access_bond',
          creditLimit: '100000',
          currentBalance: '25000',
          interestRate: '0.115',
          linkedAccountId: null,
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.hasFlexi).toBe(true);
      });
    });

    it('calculates flexiAvailableCredit correctly', async () => {
      const flexiHook = renderHook(() => useFlexiFacility());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await flexiHook.result.current.saveFacility({
          name: 'Access Bond',
          type: 'access_bond',
          creditLimit: '100000',
          currentBalance: '25000',
          interestRate: '0.115',
          linkedAccountId: null,
        });
      });

      // Available credit = 100000 - 25000 = 75000
      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.flexiAvailableCredit).toBe('75000');
      });
    });

    it('returns undefined flexiAvailableCredit when no facility', async () => {
      const { result } = renderHook(() => useFinancialSnapshot());

      await waitFor(() => {
        expect(result.current.snapshot.hasFlexi).toBe(false);
        expect(result.current.snapshot.flexiAvailableCredit).toBeUndefined();
      });
    });
  });

  describe('reactivity', () => {
    it('updates snapshot when accounts change', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalDebt).toBe('0');
      });

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalDebt).toBe('500000');
      });
    });

    it('updates snapshot when income changes', async () => {
      const incomeHook = renderHook(() => useIncome());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalMonthlyIncome).toBe('0');
      });

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '45000',
          frequency: 'monthly',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalMonthlyIncome).toBe('45000');
      });
    });

    it('updates snapshot when expenses change', async () => {
      const expensesHook = renderHook(() => useExpenses());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalMonthlyExpenses).toBe('0');
      });

      await act(async () => {
        await expensesHook.result.current.addExpense({
          description: 'Groceries',
          amount: '5000',
          category: 'Food',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalMonthlyExpenses).toBe('5000');
      });
    });
  });

  describe('precision with big.js', () => {
    it('handles decimal values correctly', async () => {
      const incomeHook = renderHook(() => useIncome());
      const expensesHook = renderHook(() => useExpenses());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await incomeHook.result.current.addIncome({
          source: 'Salary',
          amount: '45000.50',
          frequency: 'monthly',
        });
        await expensesHook.result.current.addExpense({
          description: 'Expenses',
          amount: '15000.25',
          category: 'Food',
        });
      });

      // Surplus = 45000.50 - 15000.25 - 0 = 30000.25
      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.availableSurplus).toBe('30000.25');
      });
    });

    it('handles large numbers correctly', async () => {
      const accountsHook = renderHook(() => useAccounts());
      const snapshotHook = renderHook(() => useFinancialSnapshot());

      await act(async () => {
        await accountsHook.result.current.addAccount({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '2500000',
          interestRate: '0.115',
          minimumPayment: '25000',
          lender: 'ABSA',
          interestType: 'monthly',
        });
        await accountsHook.result.current.addAccount({
          name: 'Investment Property',
          type: 'home_loan',
          balance: '1500000',
          interestRate: '0.12',
          minimumPayment: '15000',
          lender: 'FNB',
          interestType: 'monthly',
        });
      });

      await waitFor(() => {
        expect(snapshotHook.result.current.snapshot.totalDebt).toBe('4000000');
        expect(snapshotHook.result.current.snapshot.minimumDebtPayments).toBe('40000');
      });
    });
  });
});
