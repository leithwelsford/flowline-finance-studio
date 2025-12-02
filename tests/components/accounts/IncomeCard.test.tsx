import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncomeCard } from '@/components/accounts/IncomeCard';
import type { IncomeEntry } from '@/types/income';

const mockIncome: IncomeEntry = {
  id: 1,
  source: 'Salary',
  amount: '45000',
  paymentDate: 25,
  createdAt: new Date().toISOString(),
};

describe('IncomeCard', () => {
  describe('rendering (AC4)', () => {
    it('displays income source name', () => {
      render(<IncomeCard income={mockIncome} />);
      expect(screen.getByText('Salary')).toBeInTheDocument();
    });

    it('displays formatted amount in ZAR', () => {
      render(<IncomeCard income={mockIncome} />);
      // Check for ZAR formatted amount (R 45 000,00)
      expect(screen.getByText(/R.*45.*000/)).toBeInTheDocument();
    });

    it('displays Edit and Delete buttons', () => {
      render(<IncomeCard income={mockIncome} />);
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('displays Monthly Amount label', () => {
      render(<IncomeCard income={mockIncome} />);
      expect(screen.getByText(/monthly amount/i)).toBeInTheDocument();
    });
  });

  describe('payment date display', () => {
    it('displays payment date when provided', () => {
      render(<IncomeCard income={mockIncome} />);
      expect(screen.getByText(/payment date/i)).toBeInTheDocument();
      expect(screen.getByText('25th of month')).toBeInTheDocument();
    });

    it('formats 1st correctly', () => {
      const income = { ...mockIncome, paymentDate: 1 };
      render(<IncomeCard income={income} />);
      expect(screen.getByText('1st of month')).toBeInTheDocument();
    });

    it('formats 2nd correctly', () => {
      const income = { ...mockIncome, paymentDate: 2 };
      render(<IncomeCard income={income} />);
      expect(screen.getByText('2nd of month')).toBeInTheDocument();
    });

    it('formats 3rd correctly', () => {
      const income = { ...mockIncome, paymentDate: 3 };
      render(<IncomeCard income={income} />);
      expect(screen.getByText('3rd of month')).toBeInTheDocument();
    });

    it('formats 21st correctly', () => {
      const income = { ...mockIncome, paymentDate: 21 };
      render(<IncomeCard income={income} />);
      expect(screen.getByText('21st of month')).toBeInTheDocument();
    });

    it('formats 22nd correctly', () => {
      const income = { ...mockIncome, paymentDate: 22 };
      render(<IncomeCard income={income} />);
      expect(screen.getByText('22nd of month')).toBeInTheDocument();
    });

    it('formats 23rd correctly', () => {
      const income = { ...mockIncome, paymentDate: 23 };
      render(<IncomeCard income={income} />);
      expect(screen.getByText('23rd of month')).toBeInTheDocument();
    });

    it('formats 31st correctly', () => {
      const income = { ...mockIncome, paymentDate: 31 };
      render(<IncomeCard income={income} />);
      expect(screen.getByText('31st of month')).toBeInTheDocument();
    });

    it('does not display payment date when not provided', () => {
      const incomeWithoutDate: IncomeEntry = {
        ...mockIncome,
        paymentDate: undefined as unknown as number,
      };
      render(<IncomeCard income={incomeWithoutDate} />);
      expect(screen.queryByText(/of month/)).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onEdit when Edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<IncomeCard income={mockIncome} onEdit={onEdit} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(onEdit).toHaveBeenCalled();
    });

    it('calls onDelete when Delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<IncomeCard income={mockIncome} onDelete={onDelete} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(onDelete).toHaveBeenCalled();
    });

    it('does not crash when onEdit is not provided', async () => {
      const user = userEvent.setup();
      render(<IncomeCard income={mockIncome} />);

      // Should not throw
      await user.click(screen.getByRole('button', { name: /edit/i }));
    });

    it('does not crash when onDelete is not provided', async () => {
      const user = userEvent.setup();
      render(<IncomeCard income={mockIncome} />);

      // Should not throw
      await user.click(screen.getByRole('button', { name: /delete/i }));
    });
  });

  describe('formatting', () => {
    it('formats large amounts correctly', () => {
      const largeIncome = { ...mockIncome, amount: '150000' };
      render(<IncomeCard income={largeIncome} />);
      expect(screen.getByText(/R.*150.*000/)).toBeInTheDocument();
    });

    it('formats zero amount correctly', () => {
      const zeroIncome = { ...mockIncome, amount: '0' };
      render(<IncomeCard income={zeroIncome} />);
      expect(screen.getByText(/R.*0/)).toBeInTheDocument();
    });

    it('formats decimal amounts correctly', () => {
      const decimalIncome = { ...mockIncome, amount: '45000.50' };
      render(<IncomeCard income={decimalIncome} />);
      expect(screen.getByText(/R.*45.*000/)).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('shows amount in green color', () => {
      render(<IncomeCard income={mockIncome} />);
      const amountContainer = screen.getByText(/monthly amount/i).parentElement;
      const valueElement = amountContainer?.querySelector('.text-green-600');
      expect(valueElement).toBeInTheDocument();
    });
  });
});
