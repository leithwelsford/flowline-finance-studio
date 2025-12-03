import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { useAccounts } from '@/hooks/useAccounts';
import { db } from '@/lib/db';
import type { DebtAccount } from '@/types/account';

const testAccount: Omit<DebtAccount, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Test Home Loan',
  type: 'home_loan',
  balance: '500000',
  interestRate: '0.115',
  minimumPayment: '5000',
  lender: 'ABSA',
  interestType: 'monthly',
};

describe('useAccounts', () => {
  beforeEach(async () => {
    await db.accounts.clear();
  });

  describe('initial state', () => {
    it('returns empty accounts array initially', async () => {
      const { result } = renderHook(() => useAccounts());

      await waitFor(() => {
        expect(result.current.accounts).toEqual([]);
      });
    });

    it('calculates zero totals when no accounts', async () => {
      const { result } = renderHook(() => useAccounts());

      await waitFor(() => {
        expect(result.current.totalDebt).toBe('0');
        expect(result.current.totalMinPayments).toBe('0');
      });
    });
  });

  describe('addAccount', () => {
    it('adds account to database and returns id', async () => {
      const { result } = renderHook(() => useAccounts());

      let addResult: Awaited<ReturnType<typeof result.current.addAccount>>;
      await act(async () => {
        addResult = await result.current.addAccount(testAccount);
      });

      expect(addResult!.success).toBe(true);
      if (addResult!.success) {
        expect(typeof addResult.data).toBe('number');
      }

      await waitFor(() => {
        expect(result.current.accounts.length).toBe(1);
        expect(result.current.accounts[0].name).toBe('Test Home Loan');
      });
    });

    it('sets createdAt and updatedAt timestamps', async () => {
      const { result } = renderHook(() => useAccounts());
      const before = new Date().toISOString();

      await act(async () => {
        await result.current.addAccount(testAccount);
      });

      await waitFor(() => {
        expect(result.current.accounts.length).toBe(1);
      });

      const account = result.current.accounts[0];
      expect(account.createdAt).toBeDefined();
      expect(account.updatedAt).toBeDefined();
      expect(account.createdAt >= before).toBe(true);
      expect(account.updatedAt >= before).toBe(true);
    });

    it('updates totals after adding account', async () => {
      const { result } = renderHook(() => useAccounts());

      await act(async () => {
        await result.current.addAccount(testAccount);
      });

      await waitFor(() => {
        expect(result.current.totalDebt).toBe('500000');
        expect(result.current.totalMinPayments).toBe('5000');
      });
    });
  });

  describe('updateAccount', () => {
    it('updates account in database', async () => {
      const { result } = renderHook(() => useAccounts());

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      await act(async () => {
        await result.current.updateAccount(accountId!, { balance: '450000' });
      });

      await waitFor(() => {
        expect(result.current.accounts[0].balance).toBe('450000');
      });
    });

    it('updates updatedAt timestamp', async () => {
      const { result } = renderHook(() => useAccounts());

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      await waitFor(() => {
        expect(result.current.accounts.length).toBe(1);
      });

      const originalUpdatedAt = result.current.accounts[0].updatedAt;

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await act(async () => {
        await result.current.updateAccount(accountId!, { name: 'Updated Name' });
      });

      await waitFor(() => {
        expect(result.current.accounts[0].updatedAt > originalUpdatedAt).toBe(true);
      });
    });

    it('returns success result on update', async () => {
      const { result } = renderHook(() => useAccounts());

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      let updateResult: Awaited<ReturnType<typeof result.current.updateAccount>>;
      await act(async () => {
        updateResult = await result.current.updateAccount(accountId!, { balance: '400000' });
      });

      expect(updateResult!.success).toBe(true);
    });
  });

  describe('deleteAccount', () => {
    it('removes account from database', async () => {
      const { result } = renderHook(() => useAccounts());

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      await waitFor(() => {
        expect(result.current.accounts.length).toBe(1);
      });

      await act(async () => {
        await result.current.deleteAccount(accountId!);
      });

      await waitFor(() => {
        expect(result.current.accounts.length).toBe(0);
      });
    });

    it('returns success result on delete', async () => {
      const { result } = renderHook(() => useAccounts());

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      let deleteResult: Awaited<ReturnType<typeof result.current.deleteAccount>>;
      await act(async () => {
        deleteResult = await result.current.deleteAccount(accountId!);
      });

      expect(deleteResult!.success).toBe(true);
    });

    it('updates totals after deleting account', async () => {
      const { result } = renderHook(() => useAccounts());

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      await waitFor(() => {
        expect(result.current.totalDebt).toBe('500000');
      });

      await act(async () => {
        await result.current.deleteAccount(accountId!);
      });

      await waitFor(() => {
        expect(result.current.totalDebt).toBe('0');
        expect(result.current.totalMinPayments).toBe('0');
      });
    });
  });

  describe('calculations', () => {
    it('calculates totalDebt correctly with multiple accounts', async () => {
      const { result } = renderHook(() => useAccounts());

      await act(async () => {
        await result.current.addAccount({ ...testAccount, balance: '100000' });
        await result.current.addAccount({ ...testAccount, name: 'Car', balance: '250000' });
        await result.current.addAccount({ ...testAccount, name: 'Credit Card', balance: '15000' });
      });

      await waitFor(() => {
        expect(result.current.accounts.length).toBe(3);
        expect(result.current.totalDebt).toBe('365000');
      });
    });

    it('calculates totalMinPayments correctly with multiple accounts', async () => {
      const { result } = renderHook(() => useAccounts());

      await act(async () => {
        await result.current.addAccount({ ...testAccount, minimumPayment: '1000' });
        await result.current.addAccount({ ...testAccount, name: 'Car', minimumPayment: '3500' });
        await result.current.addAccount({ ...testAccount, name: 'Credit Card', minimumPayment: '500' });
      });

      await waitFor(() => {
        expect(result.current.accounts.length).toBe(3);
        expect(result.current.totalMinPayments).toBe('5000');
      });
    });

    it('handles decimal values correctly with big.js', async () => {
      const { result } = renderHook(() => useAccounts());

      await act(async () => {
        await result.current.addAccount({ ...testAccount, balance: '100000.50' });
        await result.current.addAccount({ ...testAccount, name: 'Car', balance: '250000.75' });
      });

      await waitFor(() => {
        expect(result.current.totalDebt).toBe('350001.25');
      });
    });
  });

  describe('updateAccountBalance', () => {
    it('updates only balance and timestamps', async () => {
      const { result } = renderHook(() => useAccounts());

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      await waitFor(() => {
        expect(result.current.accounts.length).toBe(1);
      });

      const originalName = result.current.accounts[0].name;
      const originalUpdatedAt = result.current.accounts[0].updatedAt;

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await act(async () => {
        await result.current.updateAccountBalance(accountId!, '450000');
      });

      await waitFor(() => {
        const account = result.current.accounts[0];
        expect(account.balance).toBe('450000');
        expect(account.name).toBe(originalName); // Name unchanged
        expect(account.updatedAt > originalUpdatedAt).toBe(true);
        expect(account.lastBalanceUpdated).toBeDefined();
      });
    });

    it('sets lastBalanceUpdated timestamp', async () => {
      const { result } = renderHook(() => useAccounts());
      const before = new Date().toISOString();

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      await act(async () => {
        await result.current.updateAccountBalance(accountId!, '450000');
      });

      await waitFor(() => {
        const account = result.current.accounts[0];
        expect(account.lastBalanceUpdated).toBeDefined();
        expect(account.lastBalanceUpdated! >= before).toBe(true);
      });
    });

    it('returns success result', async () => {
      const { result } = renderHook(() => useAccounts());

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      let updateResult: Awaited<ReturnType<typeof result.current.updateAccountBalance>>;
      await act(async () => {
        updateResult = await result.current.updateAccountBalance(accountId!, '450000');
      });

      expect(updateResult!.success).toBe(true);
    });

    it('updates totalDebt calculation', async () => {
      const { result } = renderHook(() => useAccounts());

      let accountId: number;
      await act(async () => {
        const addResult = await result.current.addAccount(testAccount);
        if (addResult.success) {
          accountId = addResult.data;
        }
      });

      await waitFor(() => {
        expect(result.current.totalDebt).toBe('500000');
      });

      await act(async () => {
        await result.current.updateAccountBalance(accountId!, '450000');
      });

      await waitFor(() => {
        expect(result.current.totalDebt).toBe('450000');
      });
    });
  });
});
