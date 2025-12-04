import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProportionBar } from '@/components/dashboard/ProportionBar';

describe('ProportionBar', () => {
  describe('rendering - AC-3.2.6', () => {
    it('renders with income and expense segments', () => {
      const { container } = render(
        <ProportionBar income="10000" expenses="6000" />
      );

      // Should have both segments
      const tealSegment = container.querySelector('[class*="bg-teal-500"]');
      const slateSegment = container.querySelector('[class*="bg-slate-400"]');

      expect(tealSegment).toBeInTheDocument();
      expect(slateSegment).toBeInTheDocument();
    });

    it('calculates correct segment widths', () => {
      const { container } = render(
        <ProportionBar income="10000" expenses="6000" />
      );

      // Expense = 60%, Discretionary = 40%
      const tealSegment = container.querySelector('[class*="bg-teal-500"]');
      const slateSegment = container.querySelector('[class*="bg-slate-400"]');

      expect(tealSegment).toHaveStyle({ width: '40%' });
      expect(slateSegment).toHaveStyle({ width: '60%' });
    });

    it('handles expenses exceeding income (capped at 100%)', () => {
      const { container } = render(
        <ProportionBar income="10000" expenses="15000" />
      );

      // When expenses > income, expense segment should be 100%
      const slateSegment = container.querySelector('[class*="bg-slate-400"]');
      const tealSegment = container.querySelector('[class*="bg-teal-500"]');

      expect(slateSegment).toHaveStyle({ width: '100%' });
      // Discretionary segment should not exist when negative
      expect(tealSegment).not.toBeInTheDocument();
    });

    it('handles 100% savings (no expenses)', () => {
      const { container } = render(
        <ProportionBar income="10000" expenses="0" />
      );

      // 100% discretionary, 0% expense
      const tealSegment = container.querySelector('[class*="bg-teal-500"]');

      expect(tealSegment).toHaveStyle({ width: '100%' });
    });
  });

  describe('edge cases', () => {
    it('handles zero income gracefully', () => {
      render(<ProportionBar income="0" expenses="5000" />);

      expect(screen.getByText('No income data')).toBeInTheDocument();
    });

    it('handles empty strings as zero', () => {
      render(<ProportionBar income="" expenses="" />);

      expect(screen.getByText('No income data')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible aria-label on container', () => {
      const { container } = render(
        <ProportionBar income="10000" expenses="6000" />
      );

      const bar = container.querySelector('[role="img"]');
      expect(bar).toHaveAttribute('aria-label');
      expect(bar?.getAttribute('aria-label')).toContain('Income');
      expect(bar?.getAttribute('aria-label')).toContain('Expenses');
    });

    it('includes currency values in aria-label', () => {
      const { container } = render(
        <ProportionBar income="10000" expenses="6000" />
      );

      const bar = container.querySelector('[role="img"]');
      const ariaLabel = bar?.getAttribute('aria-label') || '';

      // Should include formatted currency values
      expect(ariaLabel).toContain('R');
    });
  });

  describe('percentage labels', () => {
    it('displays discretionary and expense percentages', () => {
      render(<ProportionBar income="10000" expenses="6000" />);

      // 40% discretionary, 60% expenses
      expect(screen.getByText('Discretionary: 40%')).toBeInTheDocument();
      expect(screen.getByText('Expenses: 60%')).toBeInTheDocument();
    });

    it('displays 100% expenses when overspending', () => {
      render(<ProportionBar income="10000" expenses="15000" />);

      expect(screen.getByText('Discretionary: 0%')).toBeInTheDocument();
      expect(screen.getByText('Expenses: 100%')).toBeInTheDocument();
    });
  });

  describe('big.js precision', () => {
    it('handles decimal values correctly', () => {
      const { container } = render(
        <ProportionBar income="10000.50" expenses="5000.25" />
      );

      // Should render without errors
      const bar = container.querySelector('[role="img"]');
      expect(bar).toBeInTheDocument();
    });
  });
});
