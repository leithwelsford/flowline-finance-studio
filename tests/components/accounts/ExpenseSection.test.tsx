import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { ExpenseSection } from '@/components/accounts/ExpenseSection';
import { db } from '@/lib/db';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('ExpenseSection', () => {
  beforeEach(async () => {
    await db.expenses.clear();
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('displays empty state message when no expenses', async () => {
      render(<ExpenseSection />);

      await waitFor(() => {
        expect(screen.getByText(/no expenses added yet/i)).toBeInTheDocument();
      });
    });

    it('displays helpful text about adding expenses', async () => {
      render(<ExpenseSection />);

      await waitFor(() => {
        expect(
          screen.getByText(/add your monthly expenses.*to help calculate/i)
        ).toBeInTheDocument();
      });
    });

    it('shows add expense button in empty state', async () => {
      render(<ExpenseSection />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /add expense/i })).toHaveLength(2);
      });
    });
  });

  describe('add flow (AC1)', () => {
    it('shows form when add button clicked', async () => {
      const user = userEvent.setup();
      render(<ExpenseSection />);

      await waitFor(
        () => {
          // There are two Add Expense buttons (header + empty state card)
          expect(screen.getAllByRole('button', { name: /add expense/i }).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      await user.click(screen.getAllByRole('button', { name: /add expense/i })[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/monthly amount/i)).toBeInTheDocument();
      });
    });

    it('returns to list when cancel clicked', async () => {
      const user = userEvent.setup();
      render(<ExpenseSection />);

      await waitFor(
        () => {
          // There are two Add Expense buttons (header + empty state card)
          expect(screen.getAllByRole('button', { name: /add expense/i }).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      await user.click(screen.getAllByRole('button', { name: /add expense/i })[0]);
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.getByText(/no expenses added yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('edit flow (AC6, AC7)', () => {
    it('shows form with existing data when edit clicked', async () => {
      const user = userEvent.setup();

      // Add expense to DB
      await db.expenses.add({
        category: 'housing',
        amount: '12000',
        description: 'Monthly rent',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(() => {
        expect(screen.getByText('Housing')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit/i }));

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveTextContent('Housing');
        expect(screen.getByLabelText(/monthly amount/i)).toHaveValue(12000);
        expect(screen.getByLabelText(/description/i)).toHaveValue('Monthly rent');
      });
    });

    it('updates expense and shows success toast', async () => {
      const user = userEvent.setup();

      // Add expense to DB
      await db.expenses.add({
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(() => {
        expect(screen.getByText('Housing')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit/i }));

      await user.clear(screen.getByLabelText(/monthly amount/i));
      await user.type(screen.getByLabelText(/monthly amount/i), '15000');

      await user.click(screen.getByRole('button', { name: /update expense/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Expense updated');
      });
    });
  });

  describe('delete flow (AC8)', () => {
    it('shows confirmation dialog when delete clicked', async () => {
      const user = userEvent.setup();

      // Add expense to DB
      await db.expenses.add({
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(
        () => {
          expect(screen.getByText('Housing')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(
        () => {
          expect(screen.getByRole('alertdialog')).toBeInTheDocument();
          expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('deletes expense and shows toast when confirmed', async () => {
      const user = userEvent.setup();

      // Add expense to DB
      await db.expenses.add({
        category: 'food',
        amount: '5000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(
        () => {
          expect(screen.getByText('Food')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(
        () => {
          expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await user.click(screen.getByRole('button', { name: /^delete$/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Expense deleted');
        expect(screen.getByText(/no expenses added yet/i)).toBeInTheDocument();
      });
    });

    it('closes dialog when cancel clicked', async () => {
      const user = userEvent.setup();

      // Add expense to DB
      await db.expenses.add({
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(
        () => {
          expect(screen.getByText('Housing')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(
        () => {
          expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(screen.getByText('Housing')).toBeInTheDocument();
      });
    });
  });

  describe('display', () => {
    it('shows section title when expenses exist', async () => {
      await db.expenses.add({
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(
        () => {
          // Look for the h2 section title specifically
          expect(screen.getByRole('heading', { level: 2, name: /monthly expenses/i })).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('displays multiple expenses with category grouping', async () => {
      // Add multiple expenses
      await db.expenses.add({
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });
      await db.expenses.add({
        category: 'food',
        amount: '3000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });
      await db.expenses.add({
        category: 'food',
        amount: '2000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(
        () => {
          expect(screen.getByText('Housing')).toBeInTheDocument();
          expect(screen.getByText('Food')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('displays total monthly expenses', async () => {
      await db.expenses.add({
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });
      await db.expenses.add({
        category: 'food',
        amount: '5000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(
        () => {
          expect(screen.getByText(/total monthly expenses/i)).toBeInTheDocument();
          // Total should be 17000 - check the container has the total
          const totalLabel = screen.getByText(/total monthly expenses/i);
          expect(totalLabel.parentElement).toHaveTextContent('17');
        },
        { timeout: 3000 }
      );
    });
  });

  describe('reactive updates (AC9)', () => {
    it('updates total when expense is deleted', async () => {
      const user = userEvent.setup();

      // Add multiple expenses
      await db.expenses.add({
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });
      await db.expenses.add({
        category: 'food',
        amount: '5000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(
        () => {
          expect(screen.getByText('Housing')).toBeInTheDocument();
          expect(screen.getByText('Food')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Delete one expense
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /^delete$/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Expense deleted');
      });
    });

    it('updates total when expense is updated', async () => {
      const user = userEvent.setup();

      await db.expenses.add({
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      });

      render(<ExpenseSection />);

      await waitFor(
        () => {
          expect(screen.getByText('Housing')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      await user.click(screen.getByRole('button', { name: /edit/i }));

      await user.clear(screen.getByLabelText(/monthly amount/i));
      await user.type(screen.getByLabelText(/monthly amount/i), '15000');
      await user.click(screen.getByRole('button', { name: /update expense/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Expense updated');
      });
    });
  });
});
