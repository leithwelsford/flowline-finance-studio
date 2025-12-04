import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { HealthCard } from '@/components/dashboard/HealthCard';

describe('HealthCard', () => {
  describe('rendering', () => {
    it('displays the title in the header', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
        />
      );
      expect(screen.getByText('Cash Flow Health')).toBeInTheDocument();
    });

    it('displays the value', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
        />
      );
      expect(screen.getByText('R 4 500,00')).toBeInTheDocument();
    });

    it('displays the status label', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
        />
      );
      expect(screen.getByText('Breathing')).toBeInTheDocument();
    });

    it('displays subtitle when provided', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
          subtitle="20% of income to debt"
        />
      );
      expect(screen.getByText('20% of income to debt')).toBeInTheDocument();
    });

    it('does not display subtitle when not provided', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
        />
      );
      expect(screen.queryByText(/% of income to debt/)).not.toBeInTheDocument();
    });

    it('renders the icon', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle data-testid="status-icon" />}
        />
      );
      expect(screen.getByTestId('status-icon')).toBeInTheDocument();
    });
  });

  describe('header styling - AC-3.1.5', () => {
    it('has teal background on header', () => {
      const { container } = render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
        />
      );
      const header = container.querySelector('[class*="bg-teal-600"]');
      expect(header).toBeInTheDocument();
    });

    it('has white text in header', () => {
      const { container } = render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
        />
      );
      const header = container.querySelector('[class*="text-white"]');
      expect(header).toBeInTheDocument();
    });
  });

  describe('status colors - AC-3.1.3', () => {
    it('applies green color for healthy status', () => {
      const { container } = render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
        />
      );
      const statusElements = container.querySelectorAll('[class*="text-green-500"]');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('applies amber color for warning status', () => {
      const { container } = render(
        <HealthCard
          title="Cash Flow Health"
          value="R 500,00"
          status="warning"
          statusLabel="Tight"
          icon={<AlertTriangle />}
        />
      );
      const statusElements = container.querySelectorAll('[class*="text-amber-500"]');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('applies red color for critical status', () => {
      const { container } = render(
        <HealthCard
          title="Cash Flow Health"
          value="-R 2 000,00"
          status="critical"
          statusLabel="Drowning"
          icon={<XCircle />}
        />
      );
      const statusElements = container.querySelectorAll('[class*="text-red-500"]');
      expect(statusElements.length).toBeGreaterThan(0);
    });
  });

  describe('status labels - AC-3.1.3', () => {
    it('displays "Breathing" for healthy status', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
        />
      );
      expect(screen.getByText('Breathing')).toBeInTheDocument();
    });

    it('displays "Tight" for warning status', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 500,00"
          status="warning"
          statusLabel="Tight"
          icon={<AlertTriangle />}
        />
      );
      expect(screen.getByText('Tight')).toBeInTheDocument();
    });

    it('displays "Drowning" for critical status', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="-R 2 000,00"
          status="critical"
          statusLabel="Drowning"
          icon={<XCircle />}
        />
      );
      expect(screen.getByText('Drowning')).toBeInTheDocument();
    });

    it('displays "No Income" label when provided', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="-R 5 000,00"
          status="critical"
          statusLabel="No Income"
          icon={<XCircle />}
        />
      );
      expect(screen.getByText('No Income')).toBeInTheDocument();
    });
  });

  describe('value formatting - AC-3.1.2', () => {
    it('displays ZAR formatted positive value', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle />}
        />
      );
      expect(screen.getByText('R 4 500,00')).toBeInTheDocument();
    });

    it('displays ZAR formatted negative value', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="-R 2 000,00"
          status="critical"
          statusLabel="Drowning"
          icon={<XCircle />}
        />
      );
      expect(screen.getByText('-R 2 000,00')).toBeInTheDocument();
    });

    it('displays ZAR formatted zero value', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 0,00"
          status="warning"
          statusLabel="Tight"
          icon={<AlertTriangle />}
        />
      );
      expect(screen.getByText('R 0,00')).toBeInTheDocument();
    });
  });

  describe('icon rendering - AC-3.1.6', () => {
    it('renders CheckCircle icon for healthy status', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 4 500,00"
          status="healthy"
          statusLabel="Breathing"
          icon={<CheckCircle data-testid="check-icon" />}
        />
      );
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('renders AlertTriangle icon for warning status', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="R 500,00"
          status="warning"
          statusLabel="Tight"
          icon={<AlertTriangle data-testid="warning-icon" />}
        />
      );
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    it('renders XCircle icon for critical status', () => {
      render(
        <HealthCard
          title="Cash Flow Health"
          value="-R 2 000,00"
          status="critical"
          statusLabel="Drowning"
          icon={<XCircle data-testid="x-icon" />}
        />
      );
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });
  });
});
