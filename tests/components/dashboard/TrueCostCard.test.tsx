import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { TrueCostCard } from '@/components/dashboard/TrueCostCard';

// Mock the hook to control test scenarios
vi.mock('@/hooks/useTrueCost', () => ({
  useTrueCost: vi.fn(),
}));

import { useTrueCost } from '@/hooks/useTrueCost';

const mockUseTrueCost = vi.mocked(useTrueCost);

describe('TrueCostCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state - AC-3.3.1', () => {
    it('renders skeleton when loading', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: null,
        isLoading: true,
        error: null,
      });

      const { container } = render(<TrueCostCard />);

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('displays title in loading state', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: null,
        isLoading: true,
        error: null,
      });

      render(<TrueCostCard />);
      expect(screen.getByText('True Cost of Debt')).toBeInTheDocument();
    });
  });

  describe('empty state - AC-3.3.1', () => {
    it('renders empty state when no accounts', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: null,
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);
      expect(screen.getByText(/Add debt accounts/)).toBeInTheDocument();
    });

    it('displays title in empty state', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: null,
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);
      expect(screen.getByText('True Cost of Debt')).toBeInTheDocument();
    });
  });

  describe('card renders - AC-3.3.1', () => {
    it('displays "True Cost of Debt" card when accounts exist', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '958.33',
          annualInterest: '11500.00',
          interestToIncomeRatio: '10.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);
      expect(screen.getByText('True Cost of Debt')).toBeInTheDocument();
    });
  });

  describe('monthly interest display - AC-3.3.2', () => {
    it('displays monthly interest in ZAR format', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '2625.00',
          annualInterest: '31500.00',
          interestToIncomeRatio: '15.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      expect(screen.getByText('Monthly Interest')).toBeInTheDocument();
      expect(screen.getByText('R 2 625,00')).toBeInTheDocument();
    });
  });

  describe('annual interest display - AC-3.3.3', () => {
    it('displays annual interest in ZAR format', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '2625.00',
          annualInterest: '31500.00',
          interestToIncomeRatio: '15.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      expect(screen.getByText('Annual Interest')).toBeInTheDocument();
      expect(screen.getByText('R 31 500,00')).toBeInTheDocument();
    });
  });

  describe('interest-to-income ratio - AC-3.3.4', () => {
    it('displays ratio as percentage', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '1000.00',
          annualInterest: '12000.00',
          interestToIncomeRatio: '10.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      expect(screen.getByText('Interest-to-Income')).toBeInTheDocument();
      expect(screen.getByText('10.0%')).toBeInTheDocument();
    });
  });

  describe('red color for interest values - AC-3.3.5', () => {
    it('displays monthly interest in red', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '1000.00',
          annualInterest: '12000.00',
          interestToIncomeRatio: '10.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<TrueCostCard />);

      const redElements = container.querySelectorAll('[class*="text-red-500"]');
      expect(redElements.length).toBe(2); // Monthly and annual

      // Monthly interest in red
      const monthlyText = screen.getByText('R 1 000,00');
      expect(monthlyText).toHaveClass('text-red-500');
    });

    it('displays annual interest in red', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '1000.00',
          annualInterest: '12000.00',
          interestToIncomeRatio: '10.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      const annualText = screen.getByText('R 12 000,00');
      expect(annualText).toHaveClass('text-red-500');
    });
  });

  describe('high debt burden warning - AC-3.3.6', () => {
    it('shows warning when ratio > 20%', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '2500.00',
          annualInterest: '30000.00',
          interestToIncomeRatio: '25.0',
          isHighBurden: true,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      expect(screen.getByText('High debt burden')).toBeInTheDocument();
    });

    it('warning has amber styling', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '2500.00',
          annualInterest: '30000.00',
          interestToIncomeRatio: '25.0',
          isHighBurden: true,
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<TrueCostCard />);

      const warningElement = container.querySelector('[class*="bg-amber-50"]');
      expect(warningElement).toBeInTheDocument();

      const warningText = container.querySelector('[class*="text-amber-600"]');
      expect(warningText).toBeInTheDocument();
    });

    it('warning has alert icon', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '2500.00',
          annualInterest: '30000.00',
          interestToIncomeRatio: '25.0',
          isHighBurden: true,
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<TrueCostCard />);

      // AlertTriangle icon from lucide-react
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('hides warning when ratio <= 20%', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '2000.00',
          annualInterest: '24000.00',
          interestToIncomeRatio: '20.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      expect(screen.queryByText('High debt burden')).not.toBeInTheDocument();
    });

    it('hides warning when ratio is low', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '500.00',
          annualInterest: '6000.00',
          interestToIncomeRatio: '5.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      expect(screen.queryByText('High debt burden')).not.toBeInTheDocument();
    });
  });

  describe('teal header - AC-3.3.7', () => {
    it('has teal header background', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '1000.00',
          annualInterest: '12000.00',
          interestToIncomeRatio: '10.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<TrueCostCard />);

      const header = container.querySelector('[class*="bg-teal-600"]');
      expect(header).toBeInTheDocument();
    });

    it('has white text on header', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '1000.00',
          annualInterest: '12000.00',
          interestToIncomeRatio: '10.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<TrueCostCard />);

      const header = container.querySelector('[class*="text-white"]');
      expect(header).toBeInTheDocument();
    });
  });

  describe('all values rendered together', () => {
    it('renders all metric values in correct format', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '2625.00',
          annualInterest: '31500.00',
          interestToIncomeRatio: '15.5',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      // All labels present
      expect(screen.getByText('Monthly Interest')).toBeInTheDocument();
      expect(screen.getByText('Annual Interest')).toBeInTheDocument();
      expect(screen.getByText('Interest-to-Income')).toBeInTheDocument();

      // All values formatted correctly
      expect(screen.getByText('R 2 625,00')).toBeInTheDocument();
      expect(screen.getByText('R 31 500,00')).toBeInTheDocument();
      expect(screen.getByText('15.5%')).toBeInTheDocument();
    });
  });

  describe('edge case formatting', () => {
    it('handles zero interest correctly', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '0.00',
          annualInterest: '0.00',
          interestToIncomeRatio: '0.0',
          isHighBurden: false,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      // Both monthly and annual interest show R 0,00
      const zeroAmounts = screen.getAllByText('R 0,00');
      expect(zeroAmounts.length).toBe(2);
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('handles large amounts correctly', () => {
      mockUseTrueCost.mockReturnValue({
        trueCost: {
          monthlyInterest: '15000.00',
          annualInterest: '180000.00',
          interestToIncomeRatio: '30.0',
          isHighBurden: true,
        },
        isLoading: false,
        error: null,
      });

      render(<TrueCostCard />);

      expect(screen.getByText('R 15 000,00')).toBeInTheDocument();
      expect(screen.getByText('R 180 000,00')).toBeInTheDocument();
    });
  });
});
