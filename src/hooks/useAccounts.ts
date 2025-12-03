import { useLiveQuery } from 'dexie-react-hooks';
import Big from 'big.js';
import { db } from '@/lib/db';
import { ok, err, type Result } from '@/lib/utils/result';
import type { DebtAccount } from '@/types/account';

/**
 * Account data for creating a new account (without id and timestamps)
 */
export type NewAccountData = Omit<DebtAccount, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Return type for useAccounts hook
 */
export interface UseAccountsReturn {
  accounts: DebtAccount[];
  isLoading: boolean;
  addAccount: (account: NewAccountData) => Promise<Result<number>>;
  updateAccount: (id: number, updates: Partial<DebtAccount>) => Promise<Result<void>>;
  updateAccountBalance: (id: number, balance: string) => Promise<Result<void>>;
  deleteAccount: (id: number) => Promise<Result<void>>;
  totalDebt: string;
  totalMinPayments: string;
}

/**
 * Hook for managing debt accounts with Dexie
 *
 * Provides reactive account list via useLiveQuery and CRUD operations.
 * All monetary calculations use big.js for precision.
 *
 * @example
 * ```tsx
 * const { accounts, addAccount, totalDebt } = useAccounts();
 *
 * const handleSave = async (data) => {
 *   const result = await addAccount(data);
 *   if (result.success) {
 *     toast.success('Account saved');
 *   }
 * };
 * ```
 */
export function useAccounts(): UseAccountsReturn {
  const accounts = useLiveQuery(() => db.accounts.toArray()) ?? [];
  const isLoading = accounts === undefined;

  /**
   * Add a new account to the database
   */
  const addAccount = async (account: NewAccountData): Promise<Result<number>> => {
    try {
      const now = new Date().toISOString();
      const id = await db.accounts.add({
        ...account,
        createdAt: now,
        updatedAt: now,
      } as DebtAccount);
      return ok(id);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to add account'));
    }
  };

  /**
   * Update an existing account
   */
  const updateAccount = async (
    id: number,
    updates: Partial<DebtAccount>
  ): Promise<Result<void>> => {
    try {
      const now = new Date().toISOString();
      await db.accounts.update(id, {
        ...updates,
        updatedAt: now,
      });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update account'));
    }
  };

  /**
   * Update only the balance of an account (for quick balance updates)
   * Updates balance, updatedAt, and lastBalanceUpdated fields
   */
  const updateAccountBalance = async (
    id: number,
    balance: string
  ): Promise<Result<void>> => {
    try {
      const now = new Date().toISOString();
      await db.accounts.update(id, {
        balance,
        updatedAt: now,
        lastBalanceUpdated: now,
      });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update account balance'));
    }
  };

  /**
   * Delete an account from the database
   */
  const deleteAccount = async (id: number): Promise<Result<void>> => {
    try {
      await db.accounts.delete(id);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete account'));
    }
  };

  /**
   * Calculate total debt using big.js for precision
   */
  const totalDebt = accounts.reduce((sum, account) => {
    return sum.plus(new Big(account.balance || '0'));
  }, new Big(0)).toString();

  /**
   * Calculate total minimum payments using big.js for precision
   */
  const totalMinPayments = accounts.reduce((sum, account) => {
    return sum.plus(new Big(account.minimumPayment || '0'));
  }, new Big(0)).toString();

  return {
    accounts,
    isLoading,
    addAccount,
    updateAccount,
    updateAccountBalance,
    deleteAccount,
    totalDebt,
    totalMinPayments,
  };
}
