import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheckCircle, AlertTriangle, Wallet } from 'lucide-react';
import { SnapshotMetricCard } from '@/components/accounts/SnapshotMetricCard';

describe('SnapshotMetricCard', () => {
  describe('rendering', () => {
    it('displays the label', () => {
      render(<SnapshotMetricCard label="Total Debt" value="R 500,000.00" />);
      expect(screen.getByText('Total Debt')).toBeInTheDocument();
    });

    it('displays the value', () => {
      render(<SnapshotMetricCard label="Total Debt" value="R 500,000.00" />);
      expect(screen.getByText('R 500,000.00')).toBeInTheDocument();
    });

    it('renders without icon by default', () => {
      render(<SnapshotMetricCard label="Total Debt" value="R 500,000.00" />);
      // No icon should be present - check via SVG absence in value container
      const valueContainer = screen.getByTestId('metric-value-total-debt');
      expect(valueContainer.previousElementSibling).toBeNull();
    });

    it('renders with icon when provided', () => {
      render(
        <SnapshotMetricCard
          label="Available Surplus"
          value="R 10,000.00"
          icon={CheckCircle}
        />
      );
      // Icon should be in the document (lucide icons render as SVG)
      const container = screen.getByTestId('metric-value-available-surplus').parentElement;
      expect(container?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('variant styles', () => {
    it('applies default variant styling', () => {
      render(<SnapshotMetricCard label="Total Debt" value="R 500,000.00" />);
      const value = screen.getByTestId('metric-value-total-debt');
      expect(value).toHaveClass('text-slate-900');
    });

    it('applies positive variant styling (green)', () => {
      render(
        <SnapshotMetricCard
          label="Available Surplus"
          value="R 10,000.00"
          variant="positive"
          icon={CheckCircle}
        />
      );
      const value = screen.getByTestId('metric-value-available-surplus');
      expect(value).toHaveClass('text-green-500');
    });

    it('applies negative variant styling (red)', () => {
      render(
        <SnapshotMetricCard
          label="Available Surplus"
          value="-R 5,000.00"
          variant="negative"
          icon={AlertTriangle}
        />
      );
      const value = screen.getByTestId('metric-value-available-surplus');
      expect(value).toHaveClass('text-red-500');
    });

    it('applies neutral variant styling', () => {
      render(
        <SnapshotMetricCard
          label="Account Count"
          value="5"
          variant="neutral"
        />
      );
      const value = screen.getByTestId('metric-value-account-count');
      expect(value).toHaveClass('text-slate-600');
    });

    it('applies icon color matching variant', () => {
      render(
        <SnapshotMetricCard
          label="Available Surplus"
          value="R 10,000.00"
          variant="positive"
          icon={CheckCircle}
        />
      );
      const container = screen.getByTestId('metric-value-available-surplus').parentElement;
      const icon = container?.querySelector('svg');
      expect(icon).toHaveClass('text-green-500');
    });
  });

  describe('label formatting', () => {
    it('generates correct test id from multi-word label', () => {
      render(
        <SnapshotMetricCard label="Total Monthly Income" value="R 45,000.00" />
      );
      expect(screen.getByTestId('metric-value-total-monthly-income')).toBeInTheDocument();
    });

    it('generates correct test id from single-word label', () => {
      render(<SnapshotMetricCard label="Accounts" value="5" />);
      expect(screen.getByTestId('metric-value-accounts')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('icon has aria-hidden attribute', () => {
      render(
        <SnapshotMetricCard
          label="Status"
          value="Good"
          icon={Wallet}
        />
      );
      const container = screen.getByTestId('metric-value-status').parentElement;
      const icon = container?.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('label is visible for screen readers', () => {
      render(<SnapshotMetricCard label="Total Debt" value="R 500,000.00" />);
      const label = screen.getByText('Total Debt');
      expect(label).toBeVisible();
    });
  });

  describe('edge cases', () => {
    it('handles zero values', () => {
      render(<SnapshotMetricCard label="Total Debt" value="R 0.00" />);
      expect(screen.getByText('R 0.00')).toBeInTheDocument();
    });

    it('handles negative values', () => {
      render(
        <SnapshotMetricCard
          label="Available Surplus"
          value="-R 5,000.00"
          variant="negative"
        />
      );
      expect(screen.getByText('-R 5,000.00')).toBeInTheDocument();
    });

    it('handles empty string value', () => {
      render(<SnapshotMetricCard label="Empty" value="" />);
      expect(screen.getByTestId('metric-value-empty')).toBeInTheDocument();
    });
  });
});
