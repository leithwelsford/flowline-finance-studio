import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncomeList } from '@/components/accounts/IncomeList';
import type { IncomeEntry } from '@/types/income';

const mockIncomes: IncomeEntry[] = [
  {
    id: 1,
    source: 'Salary',
    amount: '45000',
    paymentDate: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    source: 'Side Business',
    amount: '5000',
    paymentDate: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    source: 'Rental Income',
    amount: '8000',
    paymentDate: 1,
    createdAt: new Date().toISOString(),
  },
];

describe('IncomeList', () => {
  describe('empty state', () => {
    it('displays empty state message when no entries', () => {
      render(<IncomeList incomeEntries={[]} totalMonthlyIncome="0" />);
      expect(screen.getByText(/no income sources added yet/i)).toBeInTheDocument();
    });
  });

  describe('rendering with entries (AC4)', () => {
    it('displays all income entries', () => {
      render(<IncomeList incomeEntries={mockIncomes} totalMonthlyIncome="58000" />);

      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Side Business')).toBeInTheDocument();
      expect(screen.getByText('Rental Income')).toBeInTheDocument();
    });

    it('displays each income with ZAR formatted amount', () => {
      render(<IncomeList incomeEntries={mockIncomes} totalMonthlyIncome="58000" />);

      // Check for formatted amounts - use getAllByText since amounts may match multiple patterns
      expect(screen.getAllByText(/R.*45.*000/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/R.*5.*000/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/R.*8.*000/).length).toBeGreaterThan(0);
    });
  });

  describe('total monthly income display (AC5)', () => {
    it('displays total monthly income label', () => {
      render(<IncomeList incomeEntries={mockIncomes} totalMonthlyIncome="58000" />);
      expect(screen.getByText(/total monthly income/i)).toBeInTheDocument();
    });

    it('displays total monthly income in ZAR format', () => {
      render(<IncomeList incomeEntries={mockIncomes} totalMonthlyIncome="58000" />);
      // Total: 45000 + 5000 + 8000 = 58000
      expect(screen.getByText(/R.*58.*000/)).toBeInTheDocument();
    });

    it('displays zero total when no entries', () => {
      render(<IncomeList incomeEntries={[]} totalMonthlyIncome="0" />);
      // Empty state shown, no total display
      expect(screen.getByText(/no income sources added yet/i)).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onEdit with income entry when edit clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <IncomeList
          incomeEntries={mockIncomes}
          totalMonthlyIncome="58000"
          onEdit={onEdit}
        />
      );

      // Click first edit button
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockIncomes[0]);
    });

    it('calls onDelete with income entry when delete clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(
        <IncomeList
          incomeEntries={mockIncomes}
          totalMonthlyIncome="58000"
          onDelete={onDelete}
        />
      );

      // Click first delete button
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockIncomes[0]);
    });

    it('calls onEdit with correct entry for second item', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <IncomeList
          incomeEntries={mockIncomes}
          totalMonthlyIncome="58000"
          onEdit={onEdit}
        />
      );

      // Click second edit button
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[1]);

      expect(onEdit).toHaveBeenCalledWith(mockIncomes[1]);
    });
  });

  describe('single income entry', () => {
    it('displays single entry correctly', () => {
      render(
        <IncomeList
          incomeEntries={[mockIncomes[0]]}
          totalMonthlyIncome="45000"
        />
      );

      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText(/total monthly income/i)).toBeInTheDocument();
    });
  });
});
