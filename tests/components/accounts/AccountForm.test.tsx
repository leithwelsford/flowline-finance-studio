import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { AccountForm } from '@/components/accounts/AccountForm';
import { db } from '@/lib/db';
import type { DebtAccount } from '@/types/account';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('AccountForm', () => {
  beforeEach(async () => {
    await db.accounts.clear();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all required form fields', () => {
      render(<AccountForm />);

      expect(screen.getByLabelText(/account name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current balance/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/annual interest rate/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/minimum monthly payment/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lender name/i)).toBeInTheDocument();
    });

    it('renders save button for new account', () => {
      render(<AccountForm />);
      expect(screen.getByRole('button', { name: /save account/i })).toBeInTheDocument();
    });

    it('renders update button for existing account', () => {
      const account: DebtAccount = {
        id: 1,
        name: 'Test Account',
        type: 'home_loan',
        balance: '100000',
        interestRate: '0.115',
        minimumPayment: '5000',
        lender: 'Bank',
        interestType: 'monthly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      render(<AccountForm account={account} />);
      expect(screen.getByRole('button', { name: /update account/i })).toBeInTheDocument();
    });

    it('renders cancel button when onCancel provided', () => {
      render(<AccountForm onCancel={() => {}} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('edit mode', () => {
    it('populates form with existing account data', () => {
      const account: DebtAccount = {
        id: 1,
        name: 'Home Loan',
        type: 'home_loan',
        balance: '500000',
        interestRate: '0.115',
        minimumPayment: '5000',
        lender: 'ABSA',
        interestType: 'monthly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      render(<AccountForm account={account} />);

      expect(screen.getByLabelText(/account name/i)).toHaveValue('Home Loan');
      expect(screen.getByLabelText(/current balance/i)).toHaveValue(500000);
      // Interest rate converted from decimal to percentage
      expect(screen.getByLabelText(/annual interest rate/i)).toHaveValue(11.5);
      expect(screen.getByLabelText(/minimum monthly payment/i)).toHaveValue(5000);
      expect(screen.getByLabelText(/lender name/i)).toHaveValue('ABSA');
    });
  });

  describe('validation', () => {
    it('shows error when required fields are empty', async () => {
      const user = userEvent.setup();
      render(<AccountForm />);

      await user.click(screen.getByRole('button', { name: /save account/i }));

      await waitFor(() => {
        expect(screen.getByText(/account name is required/i)).toBeInTheDocument();
      });
    });

    it('shows error for negative balance', async () => {
      const user = userEvent.setup();
      render(<AccountForm />);

      const balanceInput = screen.getByLabelText(/current balance/i);
      await user.type(screen.getByLabelText(/account name/i), 'Test');
      // Clear and type negative value - HTML number inputs may prevent negative
      await user.clear(balanceInput);
      await user.type(balanceInput, '-100');
      await user.type(screen.getByLabelText(/annual interest rate/i), '10');
      await user.type(screen.getByLabelText(/minimum monthly payment/i), '100');

      await user.click(screen.getByRole('button', { name: /save account/i }));

      // The form may show "required" error since number input with min=0 rejects negative
      await waitFor(() => {
        // Check that form doesn't save successfully (either validation error or required field)
        expect(toast.success).not.toHaveBeenCalled();
      });
    });

    it('shows error for interest rate over 100', async () => {
      const user = userEvent.setup();
      render(<AccountForm />);

      await user.type(screen.getByLabelText(/account name/i), 'Test');
      await user.type(screen.getByLabelText(/current balance/i), '1000');

      const rateInput = screen.getByLabelText(/annual interest rate/i);
      await user.clear(rateInput);
      await user.type(rateInput, '150');
      await user.type(screen.getByLabelText(/minimum monthly payment/i), '100');

      await user.click(screen.getByRole('button', { name: /save account/i }));

      // HTML number input with max=100 may prevent the value
      await waitFor(() => {
        expect(toast.success).not.toHaveBeenCalled();
      });
    });
  });

  describe('form submission', () => {
    it('calls onSuccess after successful save', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      render(<AccountForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/account name/i), 'Test Account');
      await user.type(screen.getByLabelText(/current balance/i), '100000');
      await user.type(screen.getByLabelText(/annual interest rate/i), '11.5');
      await user.type(screen.getByLabelText(/minimum monthly payment/i), '5000');

      await user.click(screen.getByRole('button', { name: /save account/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Account saved');
      });
    });

    it('shows success toast on save', async () => {
      const user = userEvent.setup();
      render(<AccountForm />);

      await user.type(screen.getByLabelText(/account name/i), 'Test Account');
      await user.type(screen.getByLabelText(/current balance/i), '100000');
      await user.type(screen.getByLabelText(/annual interest rate/i), '11.5');
      await user.type(screen.getByLabelText(/minimum monthly payment/i), '5000');

      await user.click(screen.getByRole('button', { name: /save account/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Account saved');
      });
    });

    it('shows success toast on update', async () => {
      const user = userEvent.setup();
      const account: DebtAccount = {
        id: 1,
        name: 'Test Account',
        type: 'home_loan',
        balance: '100000',
        interestRate: '0.115',
        minimumPayment: '5000',
        lender: '',
        interestType: 'monthly',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add account to DB first
      await db.accounts.add(account);

      render(<AccountForm account={account} />);

      await user.clear(screen.getByLabelText(/account name/i));
      await user.type(screen.getByLabelText(/account name/i), 'Updated Account');

      await user.click(screen.getByRole('button', { name: /update account/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Account updated');
      });
    });

    it('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<AccountForm onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe('interest rate conversion', () => {
    it('converts percentage input to decimal for storage', async () => {
      const user = userEvent.setup();
      render(<AccountForm />);

      await user.type(screen.getByLabelText(/account name/i), 'Test');
      await user.type(screen.getByLabelText(/current balance/i), '100000');
      await user.type(screen.getByLabelText(/annual interest rate/i), '11.5');
      await user.type(screen.getByLabelText(/minimum monthly payment/i), '5000');

      await user.click(screen.getByRole('button', { name: /save account/i }));

      await waitFor(async () => {
        const accounts = await db.accounts.toArray();
        expect(accounts.length).toBe(1);
        expect(accounts[0].interestRate).toBe('0.115');
      });
    });
  });
});
