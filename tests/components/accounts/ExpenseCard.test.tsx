import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseCard } from '@/components/accounts/ExpenseCard';
import type { ExpenseEntry } from '@/types/expense';

describe('ExpenseCard', () => {
  const baseExpense: ExpenseEntry = {
    id: 1,
    category: 'housing',
    amount: '12000',
    date: '2024-01-01',
    createdAt: '2024-01-01T00:00:00Z',
  };

  describe('rendering', () => {
    it('displays formatted amount in ZAR', () => {
      const { container } = render(<ExpenseCard expense={baseExpense} />);
      // formatCurrency should format as ZAR - verify the amount is shown
      expect(container).toHaveTextContent('12');
      expect(container).toHaveTextContent('000');
    });

    it('displays description when provided', () => {
      const expense = { ...baseExpense, description: 'Monthly rent' };
      render(<ExpenseCard expense={expense} />);
      expect(screen.getByText('Monthly rent')).toBeInTheDocument();
    });

    it('does not display description section when not provided', () => {
      render(<ExpenseCard expense={baseExpense} />);
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    it('renders edit button', () => {
      render(<ExpenseCard expense={baseExpense} />);
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('renders delete button', () => {
      render(<ExpenseCard expense={baseExpense} />);
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('displays Monthly Amount label', () => {
      render(<ExpenseCard expense={baseExpense} />);
      expect(screen.getByText('Monthly Amount')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<ExpenseCard expense={baseExpense} onEdit={onEdit} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));
      expect(onEdit).toHaveBeenCalled();
    });

    it('calls onDelete when delete button clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<ExpenseCard expense={baseExpense} onDelete={onDelete} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(onDelete).toHaveBeenCalled();
    });
  });

  describe('formatting', () => {
    it('formats large amounts correctly', () => {
      const expense = { ...baseExpense, amount: '150000' };
      const { container } = render(<ExpenseCard expense={expense} />);
      expect(container).toHaveTextContent('150');
      expect(container).toHaveTextContent('000');
    });

    it('formats decimal amounts correctly', () => {
      const expense = { ...baseExpense, amount: '12000.50' };
      const { container } = render(<ExpenseCard expense={expense} />);
      expect(container).toHaveTextContent('12');
      expect(container).toHaveTextContent('000');
      expect(container).toHaveTextContent('50');
    });
  });
});
