import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { FinancialSnapshot } from '@/components/accounts/FinancialSnapshot';
import { db } from '@/lib/db';

describe('FinancialSnapshot', () => {
  beforeEach(async () => {
    await db.accounts.clear();
    await db.income.clear();
    await db.expenses.clear();
    await db.flexiFacility.clear();
  });

  describe('empty state (AC5)', () => {
    it('displays empty state message when no data exists', async () => {
      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(
          screen.getByText(/add accounts, income, and expenses/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('data display (AC1)', () => {
    it('displays total debt from accounts', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.getByText('Total Debt')).toBeInTheDocument();
        expect(screen.getByTestId('metric-value-total-debt')).toHaveTextContent(
          /R.*500.*000/
        );
      });
    });

    it('displays total monthly income', async () => {
      await act(async () => {
        await db.income.add({
          source: 'Salary',
          amount: '45000',
          frequency: 'monthly',
          createdAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.getByText('Total Monthly Income')).toBeInTheDocument();
        expect(
          screen.getByTestId('metric-value-total-monthly-income')
        ).toHaveTextContent(/R.*45.*000/);
      });
    });

    it('displays total monthly expenses', async () => {
      await act(async () => {
        await db.expenses.add({
          description: 'Groceries',
          amount: '5000',
          category: 'Food',
          createdAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.getByText('Total Monthly Expenses')).toBeInTheDocument();
        expect(
          screen.getByTestId('metric-value-total-monthly-expenses')
        ).toHaveTextContent(/R.*5.*000/);
      });
    });

    it('displays minimum debt payments', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '8000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.getByText('Minimum Debt Payments')).toBeInTheDocument();
        expect(
          screen.getByTestId('metric-value-minimum-debt-payments')
        ).toHaveTextContent(/R.*8.*000/);
      });
    });

    it('displays available surplus', async () => {
      await act(async () => {
        await db.income.add({
          source: 'Salary',
          amount: '50000',
          frequency: 'monthly',
          createdAt: new Date().toISOString(),
        });
        await db.expenses.add({
          description: 'Living',
          amount: '15000',
          category: 'Food',
          createdAt: new Date().toISOString(),
        });
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '10000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      // Surplus = 50000 - 15000 - 10000 = 25000
      await waitFor(() => {
        expect(screen.getByText('Available Surplus')).toBeInTheDocument();
        expect(
          screen.getByTestId('metric-value-available-surplus')
        ).toHaveTextContent(/R.*25.*000/);
      });
    });

    it('displays account count', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await db.accounts.add({
          name: 'Car Loan',
          type: 'vehicle_finance',
          balance: '250000',
          interestRate: '0.12',
          minimumPayment: '4000',
          lender: 'WesBank',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.getByText('Number of Accounts')).toBeInTheDocument();
        expect(
          screen.getByTestId('metric-value-number-of-accounts')
        ).toHaveTextContent('2');
      });
    });
  });

  describe('surplus styling (AC2, AC3)', () => {
    it('shows negative surplus in red with warning icon (AC2)', async () => {
      await act(async () => {
        // Add expenses without income to create negative surplus
        await db.expenses.add({
          description: 'Living',
          amount: '20000',
          category: 'Food',
          createdAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        const surplusValue = screen.getByTestId('metric-value-available-surplus');
        expect(surplusValue).toHaveClass('text-red-500');
        // Check for warning icon (AlertTriangle renders as SVG)
        const container = surplusValue.parentElement;
        expect(container?.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('shows positive surplus in green with check icon (AC3)', async () => {
      await act(async () => {
        await db.income.add({
          source: 'Salary',
          amount: '50000',
          frequency: 'monthly',
          createdAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        const surplusValue = screen.getByTestId('metric-value-available-surplus');
        expect(surplusValue).toHaveClass('text-green-500');
        // Check for success icon (CheckCircle renders as SVG)
        const container = surplusValue.parentElement;
        expect(container?.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('shows zero surplus in neutral color without icon', async () => {
      await act(async () => {
        await db.income.add({
          source: 'Salary',
          amount: '10000',
          frequency: 'monthly',
          createdAt: new Date().toISOString(),
        });
        await db.expenses.add({
          description: 'Living',
          amount: '10000',
          category: 'Food',
          createdAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        const surplusValue = screen.getByTestId('metric-value-available-surplus');
        expect(surplusValue).toHaveClass('text-slate-600');
      });
    });
  });

  describe('flexi facility indicator (AC6)', () => {
    it('shows flexi facility badge when facility exists', async () => {
      await act(async () => {
        await db.flexiFacility.add({
          name: 'Access Bond',
          type: 'access_bond',
          creditLimit: '100000',
          currentBalance: '25000',
          interestRate: '0.115',
          linkedAccountId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        // Add account to prevent empty state
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        // Available credit = 100000 - 25000 = 75000
        expect(screen.getByText(/flexi.*75.*000.*available/i)).toBeInTheDocument();
      });
    });

    it('does not show flexi badge when no facility exists', async () => {
      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.queryByText(/flexi/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('card structure', () => {
    it('renders with Financial Snapshot title', async () => {
      await act(async () => {
        await db.income.add({
          source: 'Salary',
          amount: '45000',
          frequency: 'monthly',
          createdAt: new Date().toISOString(),
        });
      });

      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.getByText('Financial Snapshot')).toBeInTheDocument();
      });
    });

    it('has correct test id', async () => {
      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.getByTestId('financial-snapshot')).toBeInTheDocument();
      });
    });
  });

  describe('reactive updates (AC4)', () => {
    it('updates when account is added', async () => {
      render(<FinancialSnapshot />);

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });

      await act(async () => {
        await db.accounts.add({
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '5000',
          lender: 'ABSA',
          interestType: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

      await waitFor(() => {
        expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
        expect(screen.getByTestId('metric-value-total-debt')).toHaveTextContent(
          /R.*500.*000/
        );
      });
    });
  });
});
