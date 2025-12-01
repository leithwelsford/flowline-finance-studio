import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { DeleteConfirmDialog } from '@/components/accounts/DeleteConfirmDialog';
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

const mockAccount: DebtAccount = {
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

describe('DeleteConfirmDialog', () => {
  beforeEach(async () => {
    await db.accounts.clear();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders dialog when open', () => {
      render(
        <DeleteConfirmDialog account={mockAccount} open={true} onClose={() => {}} />
      );

      expect(screen.getByText('Delete Account')).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      expect(screen.getByText('Test Account')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <DeleteConfirmDialog account={mockAccount} open={false} onClose={() => {}} />
      );

      expect(screen.queryByText('Delete Account')).not.toBeInTheDocument();
    });

    it('displays account name in confirmation message', () => {
      render(
        <DeleteConfirmDialog account={mockAccount} open={true} onClose={() => {}} />
      );

      expect(screen.getByText('Test Account')).toBeInTheDocument();
    });

    it('renders Cancel and Delete buttons', () => {
      render(
        <DeleteConfirmDialog account={mockAccount} open={true} onClose={() => {}} />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <DeleteConfirmDialog account={mockAccount} open={true} onClose={onClose} />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it('deletes account and shows toast when Delete is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      // Add account to DB first
      await db.accounts.add(mockAccount);

      render(
        <DeleteConfirmDialog account={mockAccount} open={true} onClose={onClose} />
      );

      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Account deleted');
        expect(onClose).toHaveBeenCalled();
      });

      // Verify account was deleted
      const accounts = await db.accounts.toArray();
      expect(accounts.length).toBe(0);
    });

    it('calls onClose after successful delete', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      await db.accounts.add(mockAccount);

      render(
        <DeleteConfirmDialog account={mockAccount} open={true} onClose={onClose} />
      );

      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('handles null account gracefully', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <DeleteConfirmDialog account={null} open={true} onClose={onClose} />
      );

      // Should still render but with empty name
      expect(screen.getByText('Delete Account')).toBeInTheDocument();

      // Clicking delete should not crash
      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
