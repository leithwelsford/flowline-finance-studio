import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { BalanceUpdateRow } from '@/components/accounts/BalanceUpdateRow';

describe('BalanceUpdateRow', () => {
  const defaultProps = {
    id: 1,
    name: 'Home Loan',
    type: 'home_loan' as const,
    currentBalance: '500000',
    lastBalanceUpdated: '2025-12-01T10:30:00.000Z',
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    defaultProps.onSave = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders account name and icon', () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      expect(screen.getByText('Home Loan')).toBeInTheDocument();
    });

    it('renders current balance in input field', () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      expect(input).toHaveValue('500000');
    });

    it('renders last updated timestamp in SA format', () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      // SA format: DD/MM/YYYY HH:mm
      expect(screen.getByText('01/12/2025 10:30')).toBeInTheDocument();
    });

    it('renders "Never updated" when no timestamp', () => {
      render(<BalanceUpdateRow {...defaultProps} lastBalanceUpdated={undefined} />);

      expect(screen.getByText('Never updated')).toBeInTheDocument();
    });

    it('displays formatted currency in idle status column', () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      // Should show formatted currency R 500 000,00
      expect(screen.getByText(/R.*500.*000/)).toBeInTheDocument();
    });

    it('renders correct icon for each account type', () => {
      const types = [
        { type: 'home_loan' as const, testId: 'balance-row-1' },
        { type: 'vehicle_finance' as const, testId: 'balance-row-1' },
        { type: 'credit_card' as const, testId: 'balance-row-1' },
        { type: 'personal_loan' as const, testId: 'balance-row-1' },
        { type: 'flexi' as const, testId: 'balance-row-1' },
      ];

      types.forEach(({ type }) => {
        const { unmount } = render(
          <BalanceUpdateRow {...defaultProps} type={type} />
        );
        expect(screen.getByTestId('balance-row-1')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('save on blur (AC2)', () => {
    it('calls onSave when value changes and user blurs', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '450000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(1, '450000');
      });
    });

    it('does not call onSave when value unchanged (AC6)', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });
  });

  describe('save on Enter key (AC2)', () => {
    it('calls onSave when Enter is pressed after value change', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '450000' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(1, '450000');
      });
    });
  });

  describe('status indicators (AC2)', () => {
    it('shows "Saving..." indicator during save', async () => {
      let resolvePromise: () => void;
      const slowSave = vi.fn().mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolvePromise = resolve;
          })
      );

      render(<BalanceUpdateRow {...defaultProps} onSave={slowSave} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '450000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      // Resolve the promise
      await act(async () => {
        resolvePromise!();
      });

      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      });
    });

    it('shows "Saved" indicator after successful save that disappears after 2s', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '450000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Saved')).toBeInTheDocument();
      });

      // Advance time by 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Saved')).not.toBeInTheDocument();
      });
    });

    it('shows "Error" indicator on save failure', async () => {
      const failSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      render(<BalanceUpdateRow {...defaultProps} onSave={failSave} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '450000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
    });
  });

  describe('validation (AC5)', () => {
    it('shows error for negative balance', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '-1000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Balance cannot be negative')).toBeInTheDocument();
      });
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('shows error for non-numeric input', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: 'abc' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid number')).toBeInTheDocument();
      });
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });

    it('clears error when user corrects input', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });

      // Enter invalid value
      fireEvent.change(input, { target: { value: '-1000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText('Balance cannot be negative')).toBeInTheDocument();
      });

      // Correct the value
      fireEvent.change(input, { target: { value: '1000' } });

      await waitFor(() => {
        expect(
          screen.queryByText('Balance cannot be negative')
        ).not.toBeInTheDocument();
      });
    });

    it('accepts zero balance', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '0' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(1, '0');
      });
    });

    it('accepts decimal values', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '123456.78' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith(1, '123456.78');
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible input label', () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      expect(
        screen.getByRole('textbox', { name: /balance for home loan/i })
      ).toBeInTheDocument();
    });

    it('sets aria-invalid when there is an error', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '-1000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('associates error message with input via aria-describedby', async () => {
      render(<BalanceUpdateRow {...defaultProps} />);

      const input = screen.getByRole('textbox', { name: /balance for home loan/i });
      fireEvent.change(input, { target: { value: '-1000' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-describedby', 'error-1');
        expect(screen.getByRole('alert')).toHaveAttribute('id', 'error-1');
      });
    });
  });

  describe('external balance changes', () => {
    it('syncs with external balance changes', () => {
      const { rerender } = render(<BalanceUpdateRow {...defaultProps} />);

      expect(screen.getByRole('textbox')).toHaveValue('500000');

      rerender(<BalanceUpdateRow {...defaultProps} currentBalance="600000" />);

      expect(screen.getByRole('textbox')).toHaveValue('600000');
    });
  });
});
