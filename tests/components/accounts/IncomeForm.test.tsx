import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { IncomeForm } from '@/components/accounts/IncomeForm';
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

describe('IncomeForm', () => {
  beforeEach(async () => {
    await db.income.clear();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all required form fields', () => {
      render(<IncomeForm />);

      expect(screen.getByLabelText(/income source/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monthly amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payment date/i)).toBeInTheDocument();
    });

    it('renders save button for new income', () => {
      render(<IncomeForm />);
      expect(screen.getByRole('button', { name: /save income/i })).toBeInTheDocument();
    });

    it('renders update button for existing income', () => {
      const income: IncomeEntry = {
        id: 1,
        source: 'Salary',
        amount: '45000',
        paymentDate: 25,
        createdAt: new Date().toISOString(),
      };

      render(<IncomeForm income={income} />);
      expect(screen.getByRole('button', { name: /update income/i })).toBeInTheDocument();
    });

    it('renders cancel button when onCancel provided', () => {
      render(<IncomeForm onCancel={() => {}} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('edit mode (AC6)', () => {
    it('populates form with existing income data', () => {
      const income: IncomeEntry = {
        id: 1,
        source: 'Salary',
        amount: '45000',
        paymentDate: 25,
        createdAt: new Date().toISOString(),
      };

      render(<IncomeForm income={income} />);

      expect(screen.getByLabelText(/income source/i)).toHaveValue('Salary');
      expect(screen.getByLabelText(/monthly amount/i)).toHaveValue(45000);
      expect(screen.getByLabelText(/payment date/i)).toHaveValue(25);
    });

    it('handles income without payment date', () => {
      const income: IncomeEntry = {
        id: 1,
        source: 'Side Business',
        amount: '5000',
        paymentDate: undefined as unknown as number,
        createdAt: new Date().toISOString(),
      };

      render(<IncomeForm income={income} />);

      expect(screen.getByLabelText(/income source/i)).toHaveValue('Side Business');
      expect(screen.getByLabelText(/monthly amount/i)).toHaveValue(5000);
      expect(screen.getByLabelText(/payment date/i)).toHaveValue(null);
    });
  });

  describe('validation', () => {
    it('shows error when source is empty', async () => {
      const user = userEvent.setup();
      render(<IncomeForm />);

      await user.type(screen.getByLabelText(/monthly amount/i), '45000');
      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(() => {
        expect(screen.getByText(/income source is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when amount is empty', async () => {
      const user = userEvent.setup();
      render(<IncomeForm />);

      await user.type(screen.getByLabelText(/income source/i), 'Salary');
      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(() => {
        expect(screen.getByText(/monthly amount is required/i)).toBeInTheDocument();
      });
    });

    it('allows empty payment date (optional field)', async () => {
      const user = userEvent.setup();
      render(<IncomeForm />);

      await user.type(screen.getByLabelText(/income source/i), 'Salary');
      await user.type(screen.getByLabelText(/monthly amount/i), '45000');
      // Leave payment date empty

      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Income source saved');
      });
    });
  });

  describe('form submission (AC2, AC3, AC7)', () => {
    it('calls onSuccess after successful save', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      render(<IncomeForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/income source/i), 'Salary');
      await user.type(screen.getByLabelText(/monthly amount/i), '45000');
      await user.type(screen.getByLabelText(/payment date/i), '25');

      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Income source saved');
      });
    });

    it('shows success toast "Income source saved" on save (AC3)', async () => {
      const user = userEvent.setup();
      render(<IncomeForm />);

      await user.type(screen.getByLabelText(/income source/i), 'Salary');
      await user.type(screen.getByLabelText(/monthly amount/i), '45000');

      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Income source saved');
      });
    });

    it('shows success toast "Income source updated" on update (AC7)', async () => {
      const user = userEvent.setup();
      const income: IncomeEntry = {
        id: 1,
        source: 'Salary',
        amount: '45000',
        paymentDate: 25,
        createdAt: new Date().toISOString(),
      };

      // Add income to DB first
      await db.income.add(income);

      render(<IncomeForm income={income} />);

      await user.clear(screen.getByLabelText(/income source/i));
      await user.type(screen.getByLabelText(/income source/i), 'Updated Salary');

      await user.click(screen.getByRole('button', { name: /update income/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Income source updated');
      });
    });

    it('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<IncomeForm onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });

    it('saves income with createdAt timestamp (AC2)', async () => {
      const user = userEvent.setup();
      const before = new Date().toISOString();
      render(<IncomeForm />);

      await user.type(screen.getByLabelText(/income source/i), 'Salary');
      await user.type(screen.getByLabelText(/monthly amount/i), '45000');

      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(async () => {
        const entries = await db.income.toArray();
        expect(entries.length).toBe(1);
        expect(entries[0].createdAt >= before).toBe(true);
      });
    });
  });

  describe('data storage', () => {
    it('saves income to database', async () => {
      const user = userEvent.setup();
      render(<IncomeForm />);

      await user.type(screen.getByLabelText(/income source/i), 'Salary');
      await user.type(screen.getByLabelText(/monthly amount/i), '45000');
      await user.type(screen.getByLabelText(/payment date/i), '25');

      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(async () => {
        const entries = await db.income.toArray();
        expect(entries.length).toBe(1);
        expect(entries[0].source).toBe('Salary');
        expect(entries[0].amount).toBe('45000');
        expect(entries[0].paymentDate).toBe(25);
      });
    });

    it('saves decimal amounts correctly', async () => {
      const user = userEvent.setup();
      render(<IncomeForm />);

      await user.type(screen.getByLabelText(/income source/i), 'Salary');
      await user.type(screen.getByLabelText(/monthly amount/i), '45000.55');

      await user.click(screen.getByRole('button', { name: /save income/i }));

      await waitFor(async () => {
        const entries = await db.income.toArray();
        expect(entries[0].amount).toBe('45000.55');
      });
    });
  });
});
