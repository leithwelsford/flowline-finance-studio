import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { ThreeNumbersGrid } from '@/components/dashboard/ThreeNumbersGrid';

// Mock the child card components
vi.mock('@/components/dashboard/CashFlowHealth', () => ({
  CashFlowHealth: () => <div data-testid="cash-flow-health">CashFlowHealth</div>,
}));

vi.mock('@/components/dashboard/IncomeExpenseCard', () => ({
  IncomeExpenseCard: () => <div data-testid="income-expense-card">IncomeExpenseCard</div>,
}));

vi.mock('@/components/dashboard/TrueCostCard', () => ({
  TrueCostCard: () => <div data-testid="true-cost-card">TrueCostCard</div>,
}));

describe('ThreeNumbersGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering - AC-3.4.3', () => {
    it('renders all three card components', () => {
      render(<ThreeNumbersGrid />);

      expect(screen.getByTestId('cash-flow-health')).toBeInTheDocument();
      expect(screen.getByTestId('income-expense-card')).toBeInTheDocument();
      expect(screen.getByTestId('true-cost-card')).toBeInTheDocument();
    });

    it('has data-testid for grid container', () => {
      render(<ThreeNumbersGrid />);

      expect(screen.getByTestId('three-numbers-grid')).toBeInTheDocument();
    });
  });

  describe('responsive grid classes - AC-3.4.3', () => {
    it('has grid-cols-1 for mobile', () => {
      const { container } = render(<ThreeNumbersGrid />);

      const grid = container.querySelector('[class*="grid-cols-1"]');
      expect(grid).toBeInTheDocument();
    });

    it('has md:grid-cols-2 for tablet', () => {
      const { container } = render(<ThreeNumbersGrid />);

      const grid = container.querySelector('[class*="md:grid-cols-2"]');
      expect(grid).toBeInTheDocument();
    });

    it('has lg:grid-cols-3 for desktop', () => {
      const { container } = render(<ThreeNumbersGrid />);

      const grid = container.querySelector('[class*="lg:grid-cols-3"]');
      expect(grid).toBeInTheDocument();
    });

    it('has gap-4 for spacing', () => {
      const { container } = render(<ThreeNumbersGrid />);

      const grid = container.querySelector('[class*="gap-4"]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('animation classes - AC-3.4.4', () => {
    it('has animate-in class on card wrappers', () => {
      const { container } = render(<ThreeNumbersGrid />);

      const animatedElements = container.querySelectorAll('[class*="animate-in"]');
      expect(animatedElements.length).toBe(3);
    });

    it('has fade-in class on card wrappers', () => {
      const { container } = render(<ThreeNumbersGrid />);

      const fadeElements = container.querySelectorAll('[class*="fade-in"]');
      expect(fadeElements.length).toBe(3);
    });

    it('has slide-in-from-bottom-4 class on card wrappers', () => {
      const { container } = render(<ThreeNumbersGrid />);

      const slideElements = container.querySelectorAll('[class*="slide-in-from-bottom-4"]');
      expect(slideElements.length).toBe(3);
    });

    it('has duration-500 class on card wrappers', () => {
      const { container } = render(<ThreeNumbersGrid />);

      const durationElements = container.querySelectorAll('[class*="duration-500"]');
      expect(durationElements.length).toBe(3);
    });

    it('has staggered delay classes', () => {
      const { container } = render(<ThreeNumbersGrid />);

      // Second card should have delay-100
      const delay100Elements = container.querySelectorAll('[class*="delay-100"]');
      expect(delay100Elements.length).toBeGreaterThanOrEqual(1);

      // Third card should have delay-200
      const delay200Elements = container.querySelectorAll('[class*="delay-200"]');
      expect(delay200Elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('loading state - AC-3.4.8', () => {
    it('renders skeleton grid when isLoading is true', () => {
      render(<ThreeNumbersGrid isLoading />);

      expect(screen.getByTestId('three-numbers-grid-skeleton')).toBeInTheDocument();
    });

    it('renders skeleton placeholders with animate-pulse', () => {
      const { container } = render(<ThreeNumbersGrid isLoading />);

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders three skeleton cards when loading', () => {
      const { container } = render(<ThreeNumbersGrid isLoading />);

      // Each skeleton card has a CardHeader and CardContent
      const cards = container.querySelectorAll('[class*="overflow-hidden"]');
      expect(cards.length).toBe(3);
    });

    it('does not render actual card components when loading', () => {
      render(<ThreeNumbersGrid isLoading />);

      expect(screen.queryByTestId('cash-flow-health')).not.toBeInTheDocument();
      expect(screen.queryByTestId('income-expense-card')).not.toBeInTheDocument();
      expect(screen.queryByTestId('true-cost-card')).not.toBeInTheDocument();
    });

    it('has responsive grid classes on skeleton', () => {
      const { container } = render(<ThreeNumbersGrid isLoading />);

      const grid = container.querySelector('[class*="grid-cols-1"]');
      expect(grid).toBeInTheDocument();

      const mdGrid = container.querySelector('[class*="md:grid-cols-2"]');
      expect(mdGrid).toBeInTheDocument();

      const lgGrid = container.querySelector('[class*="lg:grid-cols-3"]');
      expect(lgGrid).toBeInTheDocument();
    });
  });

  describe('default props', () => {
    it('isLoading defaults to false', () => {
      render(<ThreeNumbersGrid />);

      // Should render actual cards, not skeleton
      expect(screen.getByTestId('three-numbers-grid')).toBeInTheDocument();
      expect(screen.queryByTestId('three-numbers-grid-skeleton')).not.toBeInTheDocument();
    });
  });
});
