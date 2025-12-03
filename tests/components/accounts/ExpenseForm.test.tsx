import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { ExpenseForm } from '@/components/accounts/ExpenseForm';
import { db } from '@/lib/db';
import type { ExpenseEntry } from '@/types/expense';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('ExpenseForm', () => {
  beforeEach(async () => {
    await db.expenses.clear();
    vi.clearAllMocks();
  });

  describe('rendering (AC1)', () => {
    it('renders all required form fields', () => {
      render(<ExpenseForm />);

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monthly amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('renders category dropdown', () => {
      render(<ExpenseForm />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders save button for new expense', () => {
      render(<ExpenseForm />);
      expect(screen.getByRole('button', { name: /save expense/i })).toBeInTheDocument();
    });

    it('renders update button for existing expense', () => {
      const expense: ExpenseEntry = {
        id: 1,
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      };

      render(<ExpenseForm expense={expense} />);
      expect(screen.getByRole('button', { name: /update expense/i })).toBeInTheDocument();
    });

    it('renders cancel button when onCancel provided', () => {
      render(<ExpenseForm onCancel={() => {}} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('edit mode (AC6)', () => {
    it('populates form with existing expense data', () => {
      const expense: ExpenseEntry = {
        id: 1,
        category: 'housing',
        amount: '12000',
        description: 'Monthly rent',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      };

      render(<ExpenseForm expense={expense} />);

      // Category should show "Housing" as selected
      expect(screen.getByRole('combobox')).toHaveTextContent('Housing');
      expect(screen.getByLabelText(/monthly amount/i)).toHaveValue(12000);
      expect(screen.getByLabelText(/description/i)).toHaveValue('Monthly rent');
    });

    it('handles expense without description', () => {
      const expense: ExpenseEntry = {
        id: 1,
        category: 'food',
        amount: '5000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      };

      render(<ExpenseForm expense={expense} />);

      expect(screen.getByRole('combobox')).toHaveTextContent('Food');
      expect(screen.getByLabelText(/monthly amount/i)).toHaveValue(5000);
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
    });

    it('shows correct category labels for all categories', () => {
      const categories: Array<{ category: ExpenseEntry['category']; label: string }> = [
        { category: 'housing', label: 'Housing' },
        { category: 'transport', label: 'Transport' },
        { category: 'food', label: 'Food' },
        { category: 'utilities', label: 'Utilities' },
        { category: 'insurance', label: 'Insurance' },
        { category: 'entertainment', label: 'Entertainment' },
        { category: 'other', label: 'Other' },
      ];

      for (const { category, label } of categories) {
        const expense: ExpenseEntry = {
          id: 1,
          category,
          amount: '1000',
          date: '2024-01-01',
          createdAt: new Date().toISOString(),
        };

        const { unmount } = render(<ExpenseForm expense={expense} />);
        expect(screen.getByRole('combobox')).toHaveTextContent(label);
        unmount();
      }
    });
  });

  describe('validation', () => {
    it('shows error when category is not selected', async () => {
      const user = userEvent.setup();
      render(<ExpenseForm />);

      await user.type(screen.getByLabelText(/monthly amount/i), '12000');
      await user.click(screen.getByRole('button', { name: /save expense/i }));

      await waitFor(() => {
        // Zod enum error message
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });
    });

    it('shows error when amount is empty on existing expense', async () => {
      const user = userEvent.setup();
      const expense: ExpenseEntry = {
        id: 1,
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      };

      render(<ExpenseForm expense={expense} />);

      await user.clear(screen.getByLabelText(/monthly amount/i));
      await user.click(screen.getByRole('button', { name: /update expense/i }));

      await waitFor(() => {
        expect(screen.getByText(/monthly amount is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('form submission (AC2, AC3, AC7)', () => {
    it('shows success toast "Expense updated" on update (AC7)', async () => {
      const user = userEvent.setup();
      const expense: ExpenseEntry = {
        id: 1,
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      };

      // Add expense to DB first
      await db.expenses.add(expense);

      render(<ExpenseForm expense={expense} />);

      await user.clear(screen.getByLabelText(/monthly amount/i));
      await user.type(screen.getByLabelText(/monthly amount/i), '15000');

      await user.click(screen.getByRole('button', { name: /update expense/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Expense updated');
      });
    });

    it('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<ExpenseForm onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });

    it('calls onSuccess after successful update', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const expense: ExpenseEntry = {
        id: 1,
        category: 'housing',
        amount: '12000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      };

      await db.expenses.add(expense);

      render(<ExpenseForm expense={expense} onSuccess={onSuccess} />);

      await user.clear(screen.getByLabelText(/monthly amount/i));
      await user.type(screen.getByLabelText(/monthly amount/i), '15000');

      await user.click(screen.getByRole('button', { name: /update expense/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('data storage', () => {
    it('updates expense in database', async () => {
      const user = userEvent.setup();
      const expense: ExpenseEntry = {
        id: 1,
        category: 'transport',
        amount: '3500',
        description: 'Original description',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      };

      await db.expenses.add(expense);

      render(<ExpenseForm expense={expense} />);

      await user.clear(screen.getByLabelText(/description/i));
      await user.type(screen.getByLabelText(/description/i), 'Updated description');
      await user.clear(screen.getByLabelText(/monthly amount/i));
      await user.type(screen.getByLabelText(/monthly amount/i), '4000');

      await user.click(screen.getByRole('button', { name: /update expense/i }));

      await waitFor(async () => {
        const entries = await db.expenses.toArray();
        expect(entries.length).toBe(1);
        expect(entries[0].amount).toBe('4000');
        expect(entries[0].description).toBe('Updated description');
      });
    });

    it('preserves category when updating other fields', async () => {
      const user = userEvent.setup();
      const expense: ExpenseEntry = {
        id: 1,
        category: 'food',
        amount: '5000',
        date: '2024-01-01',
        createdAt: new Date().toISOString(),
      };

      await db.expenses.add(expense);

      render(<ExpenseForm expense={expense} />);

      await user.clear(screen.getByLabelText(/monthly amount/i));
      await user.type(screen.getByLabelText(/monthly amount/i), '6000');

      await user.click(screen.getByRole('button', { name: /update expense/i }));

      await waitFor(async () => {
        const entries = await db.expenses.toArray();
        expect(entries[0].category).toBe('food');
        expect(entries[0].amount).toBe('6000');
      });
    });
  });
});
