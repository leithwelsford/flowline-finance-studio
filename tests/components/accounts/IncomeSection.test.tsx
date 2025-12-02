import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { IncomeSection } from '@/components/accounts/IncomeSection';
import { db } from '@/lib/db';
import type { IncomeEntry } from '@/types/income';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

const createTestIncome = (overrides: Partial<Omit<IncomeEntry, 'id'>> = {}): Omit<IncomeEntry, 'id'> => ({
  source: 'Salary',
  amount: '45000',
  paymentDate: 25,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('IncomeSection', () => {
  beforeEach(async () => {
    await db.income.clear();
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('shows empty state message when no entries', async () => {
      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText(/no income sources added yet/i)).toBeInTheDocument();
      });
    });

    it('shows informational text about income tracking', async () => {
      render(<IncomeSection />);

      await waitFor(() => {
        expect(
          screen.getByText(/add your monthly income sources/i)
        ).toBeInTheDocument();
      });
    });

    it('shows Add Income Source button in empty state', async () => {
      render(<IncomeSection />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /add income source/i });
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('add flow (AC1, AC2, AC3)', () => {
    it('clicking Add Income Source shows form (AC1)', async () => {
      const user = userEvent.setup();
      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /add income source/i }).length).toBeGreaterThan(0);
      });

      await user.click(screen.getAllByRole('button', { name: /add income source/i })[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/income source/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/monthly amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/payment date/i)).toBeInTheDocument();
      });
    });

    it('form has all required fields from AC1', async () => {
      const user = userEvent.setup();
      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /add income source/i }).length).toBeGreaterThan(0);
      });

      await user.click(screen.getAllByRole('button', { name: /add income source/i })[0]);

      await waitFor(() => {
        // Income source (required, text)
        expect(screen.getByLabelText(/income source/i)).toBeInTheDocument();
        // Monthly amount (required, ZAR currency input, minimum R0)
        expect(screen.getByLabelText(/monthly amount/i)).toBeInTheDocument();
        // Payment date (optional, day of month 1-31)
        expect(screen.getByLabelText(/payment date/i)).toBeInTheDocument();
      });
    });

    it('successfully adding income shows toast (AC3)', async () => {
      const user = userEvent.setup();
      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /add income source/i }).length).toBeGreaterThan(0);
      });

      await user.click(screen.getAllByRole('button', { name: /add income source/i })[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/income source/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/income source/i), 'Salary');
      await user.type(screen.getByLabelText(/monthly amount/i), '45000');
      await user.type(screen.getByLabelText(/payment date/i), '25');

      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Income source saved');
      });
    });

    it('cancel button returns to list view', async () => {
      const user = userEvent.setup();
      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /add income source/i }).length).toBeGreaterThan(0);
      });

      await user.click(screen.getAllByRole('button', { name: /add income source/i })[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.getByText(/no income sources added yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('list view with entries (AC4, AC5)', () => {
    it('displays income entries in list (AC4)', async () => {
      await db.income.add(createTestIncome() as IncomeEntry);

      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeInTheDocument();
      });
    });

    it('displays multiple entries with amounts (AC4)', async () => {
      await db.income.add(createTestIncome({ source: 'Salary', amount: '45000' }) as IncomeEntry);
      await db.income.add(createTestIncome({ source: 'Side Business', amount: '5000' }) as IncomeEntry);

      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeInTheDocument();
        expect(screen.getByText('Side Business')).toBeInTheDocument();
      });
    });

    it('displays total monthly income (AC5)', async () => {
      await db.income.add(createTestIncome({ source: 'Salary', amount: '45000' }) as IncomeEntry);
      await db.income.add(createTestIncome({ source: 'Side Business', amount: '5000' }) as IncomeEntry);

      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText(/total monthly income/i)).toBeInTheDocument();
        // Total: 45000 + 5000 = 50000 - check the total summary bar specifically
        const totalBar = screen.getByText(/total monthly income/i).closest('div');
        expect(totalBar).toBeInTheDocument();
        expect(within(totalBar!).getByText(/R.*50.*000/)).toBeInTheDocument();
      });
    });
  });

  describe('edit flow (AC6, AC7)', () => {
    it('clicking Edit opens form with existing data (AC6)', async () => {
      const user = userEvent.setup();
      await db.income.add(createTestIncome() as IncomeEntry);

      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/income source/i)).toHaveValue('Salary');
        expect(screen.getByLabelText(/monthly amount/i)).toHaveValue(45000);
        expect(screen.getByLabelText(/payment date/i)).toHaveValue(25);
      });
    });

    it('updating income shows success toast (AC7)', async () => {
      const user = userEvent.setup();
      await db.income.add(createTestIncome() as IncomeEntry);

      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/income source/i)).toBeInTheDocument();
      });

      await user.clear(screen.getByLabelText(/monthly amount/i));
      await user.type(screen.getByLabelText(/monthly amount/i), '50000');

      await user.click(screen.getByRole('button', { name: /update income/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Income source updated');
      });
    });
  });

  describe('delete flow (AC8)', () => {
    it('clicking Delete shows confirmation dialog', async () => {
      const user = userEvent.setup();
      await db.income.add(createTestIncome() as IncomeEntry);

      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      });
    });

    it('confirming delete removes entry and shows toast (AC8)', async () => {
      const user = userEvent.setup();
      await db.income.add(createTestIncome() as IncomeEntry);

      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      // Click the Delete button in the dialog
      const dialogDeleteButton = screen.getByRole('button', { name: /^delete$/i });
      await user.click(dialogDeleteButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Income source deleted');
      });

      await waitFor(() => {
        expect(screen.getByText(/no income sources added yet/i)).toBeInTheDocument();
      });
    });

    it('canceling delete keeps entry', async () => {
      const user = userEvent.setup();
      await db.income.add(createTestIncome() as IncomeEntry);

      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /delete/i }));

      await waitFor(() => {
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
        expect(screen.getByText('Salary')).toBeInTheDocument();
      });
    });
  });

  describe('reactive updates (AC9)', () => {
    it('total recalculates when entry added', async () => {
      const user = userEvent.setup();
      await db.income.add(createTestIncome({ source: 'Salary', amount: '45000' }) as IncomeEntry);

      render(<IncomeSection />);

      await waitFor(() => {
        expect(screen.getByText('Salary')).toBeInTheDocument();
        // Check the total bar specifically
        const totalBar = screen.getByText(/total monthly income/i).closest('div');
        expect(within(totalBar!).getByText(/R.*45.*000/)).toBeInTheDocument();
      });

      // Add another entry through the form
      await user.click(screen.getByRole('button', { name: /add income source/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/income source/i)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/income source/i), 'Side Business');
      await user.type(screen.getByLabelText(/monthly amount/i), '5000');

      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(() => {
        // Total should now be 50000 - check in the total bar
        const totalBar = screen.getByText(/total monthly income/i).closest('div');
        expect(within(totalBar!).getByText(/R.*50.*000/)).toBeInTheDocument();
      });
    });
  });
});
