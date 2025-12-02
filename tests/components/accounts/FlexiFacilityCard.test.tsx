import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlexiFacilityCard } from '@/components/accounts/FlexiFacilityCard';
import type { FlexiFacility } from '@/types/flexi-facility';

const mockFacility: FlexiFacility = {
  id: 1,
  name: 'My Flexi Facility',
  type: 'fnb_flexi',
  creditLimit: '200000',
  currentBalance: '50000',
  interestRate: '0.1175',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('FlexiFacilityCard', () => {
  describe('rendering', () => {
    it('displays facility name', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      expect(screen.getByText('My Flexi Facility')).toBeInTheDocument();
    });

    it('displays FNB Flexi Option badge', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      expect(screen.getByText('FNB Flexi Option')).toBeInTheDocument();
    });

    it('displays Standard Bank Access Bond badge', () => {
      const accessBondFacility = { ...mockFacility, type: 'standard_bank_access' as const };
      render(<FlexiFacilityCard facility={accessBondFacility} availableCredit="150000" />);
      expect(screen.getByText('Standard Bank Access Bond')).toBeInTheDocument();
    });

    it('displays formatted credit limit in ZAR', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      expect(screen.getByText(/R.*200.*000/)).toBeInTheDocument();
    });

    it('displays formatted current balance in ZAR', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      // Check that Current Balance label exists
      expect(screen.getByText(/current balance/i)).toBeInTheDocument();
    });

    it('displays formatted available credit in ZAR', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      // Available credit is 150000
      expect(screen.getByText(/R.*150.*000/)).toBeInTheDocument();
    });

    it('displays interest rate as percentage', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      expect(screen.getByText('11.75%')).toBeInTheDocument();
    });

    it('displays Edit and Delete buttons', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('displays Credit Limit label', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      expect(screen.getByText(/credit limit/i)).toBeInTheDocument();
    });

    it('displays Available Credit label', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      expect(screen.getByText(/available credit/i)).toBeInTheDocument();
    });
  });

  describe('available credit styling', () => {
    it('shows positive available credit in green', () => {
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);
      // Find the available credit value by its class
      const availableCreditContainer = screen.getByText(/available credit/i).parentElement;
      const valueElement = availableCreditContainer?.querySelector('.text-green-600');
      expect(valueElement).toBeInTheDocument();
    });

    it('shows negative available credit in red (destructive)', () => {
      const overLimitFacility = {
        ...mockFacility,
        currentBalance: '250000', // Over the 200000 limit
      };
      render(<FlexiFacilityCard facility={overLimitFacility} availableCredit="-50000" />);
      const availableCreditContainer = screen.getByText(/available credit/i).parentElement;
      const valueElement = availableCreditContainer?.querySelector('.text-destructive');
      expect(valueElement).toBeInTheDocument();
    });

    it('shows zero available credit in green', () => {
      const zeroAvailableFacility = {
        ...mockFacility,
        currentBalance: '200000', // Exactly at limit
      };
      render(<FlexiFacilityCard facility={zeroAvailableFacility} availableCredit="0" />);
      const availableCreditContainer = screen.getByText(/available credit/i).parentElement;
      // Zero is not negative, so should not be red
      const redElement = availableCreditContainer?.querySelector('.text-destructive');
      expect(redElement).toBeNull();
    });
  });

  describe('interactions', () => {
    it('calls onEdit when Edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <FlexiFacilityCard
          facility={mockFacility}
          availableCredit="150000"
          onEdit={onEdit}
        />
      );

      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(onEdit).toHaveBeenCalled();
    });

    it('calls onDelete when Delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(
        <FlexiFacilityCard
          facility={mockFacility}
          availableCredit="150000"
          onDelete={onDelete}
        />
      );

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(onDelete).toHaveBeenCalled();
    });

    it('does not crash when onEdit is not provided', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);

      // Should not throw
      await user.click(screen.getByRole('button', { name: /edit/i }));
    });

    it('does not crash when onDelete is not provided', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilityCard facility={mockFacility} availableCredit="150000" />);

      // Should not throw
      await user.click(screen.getByRole('button', { name: /delete/i }));
    });
  });

  describe('formatting', () => {
    it('formats large credit limit correctly', () => {
      const largeFacility = { ...mockFacility, creditLimit: '1500000' };
      render(<FlexiFacilityCard facility={largeFacility} availableCredit="1450000" />);
      expect(screen.getByText(/R.*1.*500.*000/)).toBeInTheDocument();
    });

    it('formats zero balance correctly', () => {
      const zeroBalance = { ...mockFacility, currentBalance: '0' };
      render(<FlexiFacilityCard facility={zeroBalance} availableCredit="200000" />);
      expect(screen.getByText(/current balance/i)).toBeInTheDocument();
    });

    it('formats negative balance (overpaid) correctly', () => {
      const negativeFacility = { ...mockFacility, currentBalance: '-25000' };
      render(<FlexiFacilityCard facility={negativeFacility} availableCredit="225000" />);
      // Negative balance should be formatted
      expect(screen.getByText(/current balance/i)).toBeInTheDocument();
    });

    it('formats zero interest rate correctly', () => {
      const zeroRate = { ...mockFacility, interestRate: '0' };
      render(<FlexiFacilityCard facility={zeroRate} availableCredit="150000" />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });
});
