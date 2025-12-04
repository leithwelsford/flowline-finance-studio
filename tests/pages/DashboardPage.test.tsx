import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { DashboardPage } from '@/pages/DashboardPage';

// Mock the useAccounts hook
vi.mock('@/hooks/useAccounts', () => ({
  useAccounts: vi.fn(),
}));

// Mock the uiStore
const mockSetCurrentPage = vi.fn();
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn((selector) => {
    const state = {
      currentPage: 'dashboard',
      setCurrentPage: mockSetCurrentPage,
    };
    return selector(state);
  }),
}));

// Mock the child dashboard components to simplify testing
vi.mock('@/components/dashboard/ThreeNumbersGrid', () => ({
  ThreeNumbersGrid: ({ isLoading }: { isLoading?: boolean }) =>
    isLoading ? (
      <div data-testid="three-numbers-grid-loading">Loading Grid</div>
    ) : (
      <div data-testid="three-numbers-grid">ThreeNumbersGrid</div>
    ),
}));

vi.mock('@/components/dashboard/DashboardHeader', () => ({
  DashboardHeader: () => <div data-testid="dashboard-header">DashboardHeader</div>,
}));

vi.mock('@/components/dashboard/QuickActions', () => ({
  QuickActions: () => <div data-testid="quick-actions">QuickActions</div>,
}));

vi.mock('@/components/dashboard/EmptyState', () => ({
  EmptyState: () => <div data-testid="empty-state">EmptyState</div>,
}));

import { useAccounts } from '@/hooks/useAccounts';

const mockUseAccounts = vi.mocked(useAccounts);

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering - AC-3.4.1', () => {
    it('renders the dashboard page container', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [],
        isLoading: false,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '0',
        totalMinPayments: '0',
      });

      render(<DashboardPage />);

      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('always renders the DashboardHeader', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [],
        isLoading: false,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '0',
        totalMinPayments: '0',
      });

      render(<DashboardPage />);

      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    });
  });

  describe('loading state - AC-3.4.8', () => {
    it('renders ThreeNumbersGrid with isLoading when loading', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [],
        isLoading: true,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '0',
        totalMinPayments: '0',
      });

      render(<DashboardPage />);

      expect(screen.getByTestId('three-numbers-grid-loading')).toBeInTheDocument();
    });

    it('does not render EmptyState when loading', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [],
        isLoading: true,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '0',
        totalMinPayments: '0',
      });

      render(<DashboardPage />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('does not render QuickActions when loading', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [],
        isLoading: true,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '0',
        totalMinPayments: '0',
      });

      render(<DashboardPage />);

      expect(screen.queryByTestId('quick-actions')).not.toBeInTheDocument();
    });
  });

  describe('empty state - AC-3.4.7', () => {
    it('renders EmptyState when no accounts exist', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [],
        isLoading: false,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '0',
        totalMinPayments: '0',
      });

      render(<DashboardPage />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });

    it('does not render ThreeNumbersGrid when no accounts', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [],
        isLoading: false,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '0',
        totalMinPayments: '0',
      });

      render(<DashboardPage />);

      expect(screen.queryByTestId('three-numbers-grid')).not.toBeInTheDocument();
    });

    it('does not render QuickActions when no accounts', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [],
        isLoading: false,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '0',
        totalMinPayments: '0',
      });

      render(<DashboardPage />);

      expect(screen.queryByTestId('quick-actions')).not.toBeInTheDocument();
    });
  });

  describe('with accounts - AC-3.4.3', () => {
    const mockAccount = {
      id: 1,
      name: 'Test Account',
      balance: '10000',
      interestRate: '12',
      minimumPayment: '500',
      accountType: 'credit-card' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('renders ThreeNumbersGrid when accounts exist', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [mockAccount],
        isLoading: false,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '10000',
        totalMinPayments: '500',
      });

      render(<DashboardPage />);

      expect(screen.getByTestId('three-numbers-grid')).toBeInTheDocument();
    });

    it('renders QuickActions when accounts exist', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [mockAccount],
        isLoading: false,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '10000',
        totalMinPayments: '500',
      });

      render(<DashboardPage />);

      expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    });

    it('does not render EmptyState when accounts exist', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [mockAccount],
        isLoading: false,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '10000',
        totalMinPayments: '500',
      });

      render(<DashboardPage />);

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('has space-y-6 class for vertical spacing', () => {
      mockUseAccounts.mockReturnValue({
        accounts: [],
        isLoading: false,
        addAccount: vi.fn(),
        updateAccount: vi.fn(),
        updateAccountBalance: vi.fn(),
        deleteAccount: vi.fn(),
        totalDebt: '0',
        totalMinPayments: '0',
      });

      const { container } = render(<DashboardPage />);

      const page = container.querySelector('[class*="space-y-6"]');
      expect(page).toBeInTheDocument();
    });
  });
});
