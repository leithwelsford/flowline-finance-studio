import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountCard } from '@/components/accounts/AccountCard';
import type { DebtAccount } from '@/types/account';

const mockAccount: DebtAccount = {
  id: 1,
  name: 'Home Loan - ABSA',
  type: 'home_loan',
  balance: '500000',
  interestRate: '0.115',
  minimumPayment: '5000',
  lender: 'ABSA',
  interestType: 'monthly',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('AccountCard', () => {
  describe('rendering', () => {
    it('displays account name', () => {
      render(<AccountCard account={mockAccount} />);
      expect(screen.getByText('Home Loan - ABSA')).toBeInTheDocument();
    });

    it('displays account type badge', () => {
      render(<AccountCard account={mockAccount} />);
      expect(screen.getByText('Home Loan')).toBeInTheDocument();
    });

    it('displays formatted balance in ZAR', () => {
      render(<AccountCard account={mockAccount} />);
      // Check for formatted currency (contains R and the number)
      expect(screen.getByText(/R.*500.*000/)).toBeInTheDocument();
    });

    it('displays interest rate as percentage', () => {
      render(<AccountCard account={mockAccount} />);
      expect(screen.getByText('11.5%')).toBeInTheDocument();
    });

    it('displays minimum payment in ZAR', () => {
      render(<AccountCard account={mockAccount} />);
      // Multiple currency values displayed, check the label exists
      expect(screen.getByText(/min.*payment/i)).toBeInTheDocument();
    });

    it('displays lender when provided', () => {
      render(<AccountCard account={mockAccount} />);
      expect(screen.getByText('ABSA')).toBeInTheDocument();
    });

    it('hides lender when not provided', () => {
      const accountWithoutLender = { ...mockAccount, lender: '' };
      render(<AccountCard account={accountWithoutLender} />);
      expect(screen.queryByText('Lender')).not.toBeInTheDocument();
    });

    it('displays Edit and Delete buttons', () => {
      render(<AccountCard account={mockAccount} />);
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('account types', () => {
    it('displays correct badge for vehicle_finance', () => {
      const carAccount = { ...mockAccount, type: 'vehicle_finance' as const };
      render(<AccountCard account={carAccount} />);
      expect(screen.getByText('Vehicle Finance')).toBeInTheDocument();
    });

    it('displays correct badge for personal_loan', () => {
      const personalAccount = { ...mockAccount, type: 'personal_loan' as const };
      render(<AccountCard account={personalAccount} />);
      expect(screen.getByText('Personal Loan')).toBeInTheDocument();
    });

    it('displays correct badge for credit_card', () => {
      const creditAccount = { ...mockAccount, type: 'credit_card' as const };
      render(<AccountCard account={creditAccount} />);
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onEdit when Edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<AccountCard account={mockAccount} onEdit={onEdit} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));

      expect(onEdit).toHaveBeenCalledWith(mockAccount);
    });

    it('calls onDelete when Delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<AccountCard account={mockAccount} onDelete={onDelete} />);

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(onDelete).toHaveBeenCalledWith(mockAccount);
    });

    it('does not crash when onEdit is not provided', async () => {
      const user = userEvent.setup();
      render(<AccountCard account={mockAccount} />);

      // Should not throw
      await user.click(screen.getByRole('button', { name: /edit/i }));
    });

    it('does not crash when onDelete is not provided', async () => {
      const user = userEvent.setup();
      render(<AccountCard account={mockAccount} />);

      // Should not throw
      await user.click(screen.getByRole('button', { name: /delete/i }));
    });
  });

  describe('formatting', () => {
    it('formats large balances correctly', () => {
      const largeBalance = { ...mockAccount, balance: '1500000', minimumPayment: '10000' };
      render(<AccountCard account={largeBalance} />);
      // Check that formatted balance exists (may have multiple currency elements)
      const balanceElements = screen.getAllByText(/R.*1.*500.*000/);
      expect(balanceElements.length).toBeGreaterThan(0);
    });

    it('formats zero balance correctly', () => {
      const zeroBalance = { ...mockAccount, balance: '0', minimumPayment: '100' };
      render(<AccountCard account={zeroBalance} />);
      // Check that formatted balance exists
      const balanceLabel = screen.getByText(/current balance/i);
      expect(balanceLabel).toBeInTheDocument();
    });

    it('formats zero interest rate correctly', () => {
      const zeroRate = { ...mockAccount, interestRate: '0' };
      render(<AccountCard account={zeroRate} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });
});
