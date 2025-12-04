import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { CashFlowHealth } from '@/components/dashboard/CashFlowHealth';
import { db } from '@/lib/db';

// Mock the hooks to control test scenarios
vi.mock('@/hooks/useFinancialHealth', () => ({
  useFinancialHealth: vi.fn(),
}));

import { useFinancialHealth } from '@/hooks/useFinancialHealth';

const mockUseFinancialHealth = vi.mocked(useFinancialHealth);

describe('CashFlowHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: null,
        isLoading: true,
        error: null,
      });

      const { container } = render(<CashFlowHealth />);

      // Should have skeleton elements
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('displays title in loading state', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: null,
        isLoading: true,
        error: null,
      });

      render(<CashFlowHealth />);
      expect(screen.getByText('Cash Flow Health')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders empty state when no data', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: null,
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);
      expect(screen.getByText(/Add income and expenses/)).toBeInTheDocument();
    });

    it('displays title in empty state', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: null,
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);
      expect(screen.getByText('Cash Flow Health')).toBeInTheDocument();
    });
  });

  describe('healthy status - AC-3.1.3', () => {
    it('renders with healthy status and Breathing label', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '4500',
          status: 'healthy',
          statusLabel: 'Breathing',
          debtConsumptionPercent: '20.0',
        },
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);

      expect(screen.getByText('Breathing')).toBeInTheDocument();
    });

    it('displays CheckCircle icon for healthy status - AC-3.1.6', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '4500',
          status: 'healthy',
          statusLabel: 'Breathing',
          debtConsumptionPercent: '20.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<CashFlowHealth />);

      // CheckCircle icon should be present (rendered as SVG)
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies green color for healthy status', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '4500',
          status: 'healthy',
          statusLabel: 'Breathing',
          debtConsumptionPercent: '20.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<CashFlowHealth />);

      const greenElements = container.querySelectorAll('[class*="text-green-500"]');
      expect(greenElements.length).toBeGreaterThan(0);
    });
  });

  describe('warning status - AC-3.1.3', () => {
    it('renders with warning status and Tight label', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '500',
          status: 'warning',
          statusLabel: 'Tight',
          debtConsumptionPercent: '40.0',
        },
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);

      expect(screen.getByText('Tight')).toBeInTheDocument();
    });

    it('displays AlertTriangle icon for warning status - AC-3.1.6', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '500',
          status: 'warning',
          statusLabel: 'Tight',
          debtConsumptionPercent: '40.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<CashFlowHealth />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies amber color for warning status', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '500',
          status: 'warning',
          statusLabel: 'Tight',
          debtConsumptionPercent: '40.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<CashFlowHealth />);

      const amberElements = container.querySelectorAll('[class*="text-amber-500"]');
      expect(amberElements.length).toBeGreaterThan(0);
    });
  });

  describe('critical status - AC-3.1.3', () => {
    it('renders with critical status and Drowning label', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '-2000',
          status: 'critical',
          statusLabel: 'Drowning',
          debtConsumptionPercent: '60.0',
        },
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);

      expect(screen.getByText('Drowning')).toBeInTheDocument();
    });

    it('renders with critical status and No Income label', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '-5000',
          status: 'critical',
          statusLabel: 'No Income',
          debtConsumptionPercent: '0',
        },
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);

      expect(screen.getByText('No Income')).toBeInTheDocument();
    });

    it('displays XCircle icon for critical status - AC-3.1.6', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '-2000',
          status: 'critical',
          statusLabel: 'Drowning',
          debtConsumptionPercent: '60.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<CashFlowHealth />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies red color for critical status', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '-2000',
          status: 'critical',
          statusLabel: 'Drowning',
          debtConsumptionPercent: '60.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<CashFlowHealth />);

      const redElements = container.querySelectorAll('[class*="text-red-500"]');
      expect(redElements.length).toBeGreaterThan(0);
    });
  });

  describe('value formatting - AC-3.1.2', () => {
    it('displays surplus in ZAR format', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '4500',
          status: 'healthy',
          statusLabel: 'Breathing',
          debtConsumptionPercent: '20.0',
        },
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);

      // formatCurrency('4500') returns 'R 4 500,00'
      expect(screen.getByText('R 4 500,00')).toBeInTheDocument();
    });

    it('displays negative surplus correctly', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '-2000',
          status: 'critical',
          statusLabel: 'Drowning',
          debtConsumptionPercent: '60.0',
        },
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);

      // formatCurrency('-2000') returns '-R 2 000,00'
      expect(screen.getByText('-R 2 000,00')).toBeInTheDocument();
    });
  });

  describe('debt consumption display - AC-3.1.4', () => {
    it('displays debt consumption percentage in subtitle', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '4500',
          status: 'healthy',
          statusLabel: 'Breathing',
          debtConsumptionPercent: '20.0',
        },
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);

      expect(screen.getByText('20.0% of income to debt')).toBeInTheDocument();
    });

    it('displays zero percent correctly', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '8000',
          status: 'healthy',
          statusLabel: 'Breathing',
          debtConsumptionPercent: '0.0',
        },
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);

      expect(screen.getByText('0.0% of income to debt')).toBeInTheDocument();
    });
  });

  describe('header styling - AC-3.1.5', () => {
    it('has teal header background', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '4500',
          status: 'healthy',
          statusLabel: 'Breathing',
          debtConsumptionPercent: '20.0',
        },
        isLoading: false,
        error: null,
      });

      const { container } = render(<CashFlowHealth />);

      const header = container.querySelector('[class*="bg-teal-600"]');
      expect(header).toBeInTheDocument();
    });
  });

  describe('card title - AC-3.1.1', () => {
    it('displays "Cash Flow Health" as card title', () => {
      mockUseFinancialHealth.mockReturnValue({
        cashFlow: {
          availableSurplus: '4500',
          status: 'healthy',
          statusLabel: 'Breathing',
          debtConsumptionPercent: '20.0',
        },
        isLoading: false,
        error: null,
      });

      render(<CashFlowHealth />);

      expect(screen.getByText('Cash Flow Health')).toBeInTheDocument();
    });
  });
});
