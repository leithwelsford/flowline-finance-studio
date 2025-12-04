import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { IncomeExpenseCard } from '@/components/dashboard/IncomeExpenseCard';

// Mock the hook to control test scenarios
vi.mock('@/hooks/useIncomeExpense', () => ({
  useIncomeExpense: vi.fn(),
}));

import { useIncomeExpense } from '@/hooks/useIncomeExpense';

const mockUseIncomeExpense = vi.mocked(useIncomeExpense);

describe('IncomeExpenseCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: null,
        isLoading: true,
        error: null,
      });

      const { container } = render(<IncomeExpenseCard />);

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('displays title in loading state', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: null,
        isLoading: true,
        error: null,
      });

      render(<IncomeExpenseCard />);
      expect(screen.getByText('Income vs Expenditure')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders empty state when no data', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: null,
        isLoading: false,
        error: null,
      });

      render(<IncomeExpenseCard />);
      expect(screen.getByText(/Add income and expenses/)).toBeInTheDocument();
    });

    it('displays title in empty state', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: null,
        isLoading: false,
        error: null,
      });

      render(<IncomeExpenseCard />);
      expect(screen.getByText('Income vs Expenditure')).toBeInTheDocument();
    });
  });

  describe('card title - AC-3.2.1', () => {
    it('displays "Income vs Expenditure" as card title', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '10000',
          totalExpenses: '6000',
          discretionaryAmount: '4000',
          savingsRate: '40.0',
        },
        isLoading: false,
        error: null,
      });

      render(<IncomeExpenseCard />);
      expect(screen.getByText('Income vs Expenditure')).toBeInTheDocument();
    });
  });

  describe('header styling - AC-3.2.8', () => {
    it('has teal header background', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '10000',
          totalExpenses: '6000',
          discretionaryAmount: '4000',
          savingsRate: '40.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<IncomeExpenseCard />);

      const header = container.querySelector('[class*="bg-teal-600"]');
      expect(header).toBeInTheDocument();
    });
  });

  describe('value display - AC-3.2.2, AC-3.2.3, AC-3.2.4', () => {
    it('displays total income in ZAR format', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '15000',
          totalExpenses: '8000',
          discretionaryAmount: '7000',
          savingsRate: '46.7',
        },
        isLoading: false,
        error: null,
      });

      render(<IncomeExpenseCard />);

      expect(screen.getByText('Total Income')).toBeInTheDocument();
      expect(screen.getByText('R 15 000,00')).toBeInTheDocument();
    });

    it('displays total expenses in ZAR format', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '15000',
          totalExpenses: '8000',
          discretionaryAmount: '7000',
          savingsRate: '46.7',
        },
        isLoading: false,
        error: null,
      });

      render(<IncomeExpenseCard />);

      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('R 8 000,00')).toBeInTheDocument();
    });

    it('displays discretionary amount in ZAR format', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '15000',
          totalExpenses: '8000',
          discretionaryAmount: '7000',
          savingsRate: '46.7',
        },
        isLoading: false,
        error: null,
      });

      render(<IncomeExpenseCard />);

      expect(screen.getByText('Discretionary')).toBeInTheDocument();
      expect(screen.getByText('R 7 000,00')).toBeInTheDocument();
    });

    it('displays negative discretionary correctly', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '10000',
          totalExpenses: '12000',
          discretionaryAmount: '-2000',
          savingsRate: '-20.0',
        },
        isLoading: false,
        error: null,
      });

      render(<IncomeExpenseCard />);

      expect(screen.getByText('-R 2 000,00')).toBeInTheDocument();
    });
  });

  describe('savings rate display - AC-3.2.5', () => {
    it('displays savings rate as percentage', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '10000',
          totalExpenses: '6000',
          discretionaryAmount: '4000',
          savingsRate: '40.0',
        },
        isLoading: false,
        error: null,
      });

      render(<IncomeExpenseCard />);

      expect(screen.getByText('Savings Rate')).toBeInTheDocument();
      expect(screen.getByText('40.0%')).toBeInTheDocument();
    });
  });

  describe('savings rate color - AC-3.2.7', () => {
    it('shows green for positive savings rate', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '10000',
          totalExpenses: '6000',
          discretionaryAmount: '4000',
          savingsRate: '40.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<IncomeExpenseCard />);

      const greenElement = container.querySelector('[class*="text-green-500"]');
      expect(greenElement).toBeInTheDocument();
      expect(greenElement?.textContent).toBe('40.0%');
    });

    it('shows red for negative savings rate', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '10000',
          totalExpenses: '12000',
          discretionaryAmount: '-2000',
          savingsRate: '-20.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<IncomeExpenseCard />);

      const redElement = container.querySelector('[class*="text-red-500"]');
      expect(redElement).toBeInTheDocument();
      expect(redElement?.textContent).toBe('-20.0%');
    });

    it('shows green for zero savings rate (boundary)', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '10000',
          totalExpenses: '10000',
          discretionaryAmount: '0',
          savingsRate: '0.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<IncomeExpenseCard />);

      const greenElement = container.querySelector('[class*="text-green-500"]');
      expect(greenElement).toBeInTheDocument();
      expect(greenElement?.textContent).toBe('0.0%');
    });
  });

  describe('proportion bar - AC-3.2.6', () => {
    it('renders ProportionBar component', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '10000',
          totalExpenses: '6000',
          discretionaryAmount: '4000',
          savingsRate: '40.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<IncomeExpenseCard />);

      // ProportionBar renders segments with these classes
      const tealSegment = container.querySelector('[class*="bg-teal-500"]');
      const slateSegment = container.querySelector('[class*="bg-slate-400"]');

      expect(tealSegment).toBeInTheDocument();
      expect(slateSegment).toBeInTheDocument();
    });
  });

  describe('all values rendered together', () => {
    it('renders all metric values in correct format', () => {
      mockUseIncomeExpense.mockReturnValue({
        incomeExpense: {
          totalIncome: '25000',
          totalExpenses: '15000',
          discretionaryAmount: '10000',
          savingsRate: '40.0',
        },
        isLoading: false,
        error: null,
      });

      render(<IncomeExpenseCard />);

      // All labels present
      expect(screen.getByText('Total Income')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('Discretionary')).toBeInTheDocument();
      expect(screen.getByText('Savings Rate')).toBeInTheDocument();

      // All values formatted correctly
      expect(screen.getByText('R 25 000,00')).toBeInTheDocument();
      expect(screen.getByText('R 15 000,00')).toBeInTheDocument();
      expect(screen.getByText('R 10 000,00')).toBeInTheDocument();
      expect(screen.getByText('40.0%')).toBeInTheDocument();
    });
  });
});
