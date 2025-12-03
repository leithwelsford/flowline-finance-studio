import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act, cleanup } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { QuickBalanceUpdate } from '@/components/accounts/QuickBalanceUpdate';
import { db } from '@/lib/db';

// Run tests sequentially in this file to avoid IndexedDB race conditions
describe.sequential('QuickBalanceUpdate', () => {
  beforeEach(async () => {
    // Clear database tables before each test
    await db.accounts.clear();
    await db.flexiFacility.clear();
  });

  afterEach(async () => {
    // Clean up rendered component
    cleanup();
    vi.restoreAllMocks();
    // Clean up database after each test
    await db.accounts.clear();
    await db.flexiFacility.clear();
  });

  describe('empty state', () => {
    it('displays empty state when no accounts or flexi facility', async () => {
      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(
          screen.getByText(/add accounts or a flexi facility/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('account display (AC1)', () => {
    it('displays all debt accounts with current balances', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await db.accounts.add({
          name: 'Car Finance',
          type: 'vehicle_finance',
          balance: '250000',
          interestRate: '0.12',
          minimumPayment: '4000',
          lender: 'WesBank',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByText('Home Loan')).toBeInTheDocument();
        expect(screen.getByText('Car Finance')).toBeInTheDocument();
        expect(screen.getByText('Debt Accounts')).toBeInTheDocument();
      });
    });

    it('pre-fills current balance in input fields', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /balance for home loan/i });
        expect(input).toHaveValue('500000');
      });
    });
  });

  describe('flexi facility display (AC4)', () => {
    it('displays flexi facility with current balance', async () => {
      await act(async () => {
        await db.flexiFacility.add({
          name: 'FNB Flexi',
          type: 'fnb_flexi',
          creditLimit: '100000',
          currentBalance: '25000',
          interestRate: '0.115',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByText('FNB Flexi')).toBeInTheDocument();
        expect(screen.getByText('Flexi Facility')).toBeInTheDocument();
      });
    });

    it('allows inline editing of flexi facility balance', async () => {
      await act(async () => {
        await db.flexiFacility.add({
          name: 'FNB Flexi',
          type: 'fnb_flexi',
          creditLimit: '100000',
          currentBalance: '25000',
          interestRate: '0.115',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        const input = screen.getByRole('textbox', { name: /balance for fnb flexi/i });
        expect(input).toHaveValue('25000');
      });
    });
  });

  describe('balance update flow (AC2)', () => {
    it('saves balance on blur and shows Saved indicator', { retry: 2 }, async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByText('Home Loan')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });

      fireEvent.change(input, { target: { value: '495000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Saved')).toBeInTheDocument();
      });

      // Verify database was updated
      const accounts = await db.accounts.toArray();
      const updated = accounts[0];
      expect(updated?.balance).toBe('495000');
      expect(updated?.lastBalanceUpdated).toBeDefined();
    });

    it('saves flexi balance on blur', async () => {
      await act(async () => {
        await db.flexiFacility.add({
          name: 'FNB Flexi',
          type: 'fnb_flexi',
          creditLimit: '100000',
          currentBalance: '25000',
          interestRate: '0.115',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByText('FNB Flexi')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /balance for fnb flexi/i });

      fireEvent.change(input, { target: { value: '30000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Saved')).toBeInTheDocument();
      });

      // Verify database was updated
      const updated = await db.flexiFacility.toCollection().first();
      expect(updated?.currentBalance).toBe('30000');
      expect(updated?.lastBalanceUpdated).toBeDefined();
    });
  });

  describe('timestamp display (AC3)', () => {
    it('displays last updated timestamp for accounts', async () => {
      const timestamp = '2025-12-01T14:30:00.000Z';

      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastBalanceUpdated: timestamp,
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        // SA format: DD/MM/YYYY HH:mm
        expect(screen.getByText('01/12/2025 14:30')).toBeInTheDocument();
      });
    });

    it('updates timestamp after balance save', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByText('Never updated')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });

      fireEvent.change(input, { target: { value: '495000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByText('Never updated')).not.toBeInTheDocument();
      });
    });
  });

  describe('no-change detection (AC6)', () => {
    it('does not trigger save when value unchanged', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByText('Home Loan')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.focus(input);
      fireEvent.blur(input);

      // Should not show "Saved" indicator
      await waitFor(() => {
        expect(screen.queryByText('Saved')).not.toBeInTheDocument();
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      });
    });
  });

  describe('validation (AC5)', () => {
    it('prevents saving invalid balance', { retry: 2 }, async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByText('Home Loan')).toBeInTheDocument();
      });

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });

      fireEvent.change(input, { target: { value: '-1000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Balance cannot be negative')).toBeInTheDocument();
      });

      // Verify database was NOT updated
      const accounts = await db.accounts.toArray();
      const account = accounts[0];
      expect(account?.balance).toBe('500000');
    });
  });

  describe('card structure', () => {
    it('renders with Quick Balance Update title', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByText('Quick Balance Update')).toBeInTheDocument();
      });
    });

    it('has correct test id', () => {
      render(<QuickBalanceUpdate />);

      expect(screen.getByTestId('quick-balance-update')).toBeInTheDocument();
    });

    it('shows help text about auto-save', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(
          screen.getByText(/edit balances directly.*auto-save immediately/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('combined accounts and flexi', () => {
    it('displays both accounts and flexi facility', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await db.flexiFacility.add({
          name: 'FNB Flexi',
          type: 'fnb_flexi',
          creditLimit: '100000',
          currentBalance: '25000',
          interestRate: '0.115',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<QuickBalanceUpdate />);

      await waitFor(() => {
        expect(screen.getByText('Home Loan')).toBeInTheDocument();
        expect(screen.getByText('FNB Flexi')).toBeInTheDocument();
        expect(screen.getByText('Debt Accounts')).toBeInTheDocument();
        expect(screen.getByText('Flexi Facility')).toBeInTheDocument();
      });
    });
  });
});
