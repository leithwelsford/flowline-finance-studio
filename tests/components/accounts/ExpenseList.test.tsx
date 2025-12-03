import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseList } from '@/components/accounts/ExpenseList';
import type { ExpenseEntry, ExpenseCategory } from '@/types/expense';

describe('ExpenseList', () => {
  const createExpense = (
    id: number,
    category: ExpenseCategory,
    amount: string,
    description?: string
  ): ExpenseEntry => ({
    id,
    category,
    amount,
    description,
    date: '2024-01-01',
    createdAt: '2024-01-01T00:00:00Z',
  });

  describe('empty state (AC: empty)', () => {
    it('displays empty state message when no expenses', () => {
      render(
        <ExpenseList
          expenses={[]}
          expensesByCategory={new Map()}
          totalMonthlyExpenses="0"
        />
      );
      expect(screen.getByText(/no expenses added yet/i)).toBeInTheDocument();
    });
  });

  describe('category grouping (AC4)', () => {
    it('groups expenses by category with category headers', () => {
      const expenses = [
        createExpense(1, 'housing', '12000'),
        createExpense(2, 'food', '3000'),
        createExpense(3, 'food', '2000'),
      ];

      const expensesByCategory = new Map<ExpenseCategory, string>([
        ['housing', '12000'],
        ['food', '5000'],
      ]);

      render(
        <ExpenseList
          expenses={expenses}
          expensesByCategory={expensesByCategory}
          totalMonthlyExpenses="17000"
        />
      );

      // Check category headers are displayed
      expect(screen.getByText('Housing')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
    });

    it('shows item count for each category', () => {
      const expenses = [
        createExpense(1, 'food', '3000'),
        createExpense(2, 'food', '2000'),
        createExpense(3, 'food', '1500'),
      ];

      const expensesByCategory = new Map<ExpenseCategory, string>([['food', '6500']]);

      render(
        <ExpenseList
          expenses={expenses}
          expensesByCategory={expensesByCategory}
          totalMonthlyExpenses="6500"
        />
      );

      expect(screen.getByText(/\(3 items\)/)).toBeInTheDocument();
    });

    it('shows singular "item" for single expense in category', () => {
      const expenses = [createExpense(1, 'housing', '12000')];

      const expensesByCategory = new Map<ExpenseCategory, string>([['housing', '12000']]);

      render(
        <ExpenseList
          expenses={expenses}
          expensesByCategory={expensesByCategory}
          totalMonthlyExpenses="12000"
        />
      );

      expect(screen.getByText(/\(1 item\)/)).toBeInTheDocument();
    });
  });

  describe('per-category subtotals', () => {
    it('displays subtotal for each category', () => {
      const expenses = [
        createExpense(1, 'housing', '12000'),
        createExpense(2, 'food', '3000'),
        createExpense(3, 'food', '2000'),
        createExpense(4, 'transport', '3500'),
      ];

      const expensesByCategory = new Map<ExpenseCategory, string>([
        ['housing', '12000'],
        ['food', '5000'],
        ['transport', '3500'],
      ]);

      const { container } = render(
        <ExpenseList
          expenses={expenses}
          expensesByCategory={expensesByCategory}
          totalMonthlyExpenses="20500"
        />
      );

      // Category subtotals should be visible (in ZAR format)
      expect(container).toHaveTextContent('12');
      expect(container).toHaveTextContent('5');
      expect(container).toHaveTextContent('3');
    });
  });

  describe('total monthly expenses (AC5)', () => {
    it('displays total monthly expenses at bottom', () => {
      const expenses = [
        createExpense(1, 'housing', '12000'),
        createExpense(2, 'food', '5000'),
      ];

      const expensesByCategory = new Map<ExpenseCategory, string>([
        ['housing', '12000'],
        ['food', '5000'],
      ]);

      const { container } = render(
        <ExpenseList
          expenses={expenses}
          expensesByCategory={expensesByCategory}
          totalMonthlyExpenses="17000"
        />
      );

      expect(screen.getByText(/total monthly expenses/i)).toBeInTheDocument();
      expect(container).toHaveTextContent('17');
    });
  });

  describe('category ordering', () => {
    it('displays categories in consistent order', () => {
      const expenses = [
        createExpense(1, 'other', '1000'),
        createExpense(2, 'housing', '12000'),
        createExpense(3, 'entertainment', '500'),
      ];

      const expensesByCategory = new Map<ExpenseCategory, string>([
        ['other', '1000'],
        ['housing', '12000'],
        ['entertainment', '500'],
      ]);

      const { container } = render(
        <ExpenseList
          expenses={expenses}
          expensesByCategory={expensesByCategory}
          totalMonthlyExpenses="13500"
        />
      );

      // Get all category headers in order
      const headers = container.querySelectorAll('h3');
      const headerTexts = Array.from(headers).map((h) => h.textContent);

      // Housing should come before Entertainment, which should come before Other
      const housingIndex = headerTexts.findIndex((t) => t === 'Housing');
      const entertainmentIndex = headerTexts.findIndex((t) => t === 'Entertainment');
      const otherIndex = headerTexts.findIndex((t) => t === 'Other');

      expect(housingIndex).toBeLessThan(entertainmentIndex);
      expect(entertainmentIndex).toBeLessThan(otherIndex);
    });
  });

  describe('interactions', () => {
    it('calls onEdit with expense when edit clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const expense = createExpense(1, 'housing', '12000');

      render(
        <ExpenseList
          expenses={[expense]}
          expensesByCategory={new Map([['housing', '12000']])}
          totalMonthlyExpenses="12000"
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit/i }));
      expect(onEdit).toHaveBeenCalledWith(expense);
    });

    it('calls onDelete with expense when delete clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const expense = createExpense(1, 'housing', '12000');

      render(
        <ExpenseList
          expenses={[expense]}
          expensesByCategory={new Map([['housing', '12000']])}
          totalMonthlyExpenses="12000"
          onDelete={onDelete}
        />
      );

      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(onDelete).toHaveBeenCalledWith(expense);
    });
  });
});
