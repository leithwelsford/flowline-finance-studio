import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { AccountList } from '@/components/accounts/AccountList';
import { db } from '@/lib/db';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AccountList', () => {
  beforeEach(async () => {
    await db.accounts.clear();
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('displays empty state message when no accounts', async () => {
      render(<AccountList />);

      await waitFor(
        () => {
          expect(screen.getByText(/no debt accounts yet/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('displays Add Debt Account button in empty state', async () => {
      render(<AccountList />);

      await waitFor(
        () => {
          const addButtons = screen.getAllByRole('button', { name: /add debt account/i });
          expect(addButtons.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );
    });
  });

  // Note: Complex interaction tests with Dexie useLiveQuery are better suited for E2E tests.
  // Core functionality is tested in AccountCard, DeleteConfirmDialog, and useAccounts hook tests.
});
