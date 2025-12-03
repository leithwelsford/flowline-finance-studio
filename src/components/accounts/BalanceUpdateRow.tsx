import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Check, Loader2, AlertCircle, Home, Car, CreditCard, Banknote } from 'lucide-react';
import Big from 'big.js';
import { Input } from '@/components/ui/input';
import { formatCurrency, parseCurrencyInput } from '@/lib/format/currency';
import { format } from 'date-fns';
import type { AccountType } from '@/types/account';

/**
 * Save status states for the balance update row
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Props for BalanceUpdateRow component
 */
export interface BalanceUpdateRowProps {
  /** Unique identifier for the account/facility */
  id: number;
  /** Display name for the account/facility */
  name: string;
  /** Type of account or 'flexi' for flexi facility */
  type: AccountType | 'flexi';
  /** Current balance as string */
  currentBalance: string;
  /** ISO timestamp of last balance update */
  lastBalanceUpdated?: string;
  /** Callback to save the new balance */
  onSave: (id: number, newBalance: string) => Promise<void>;
}

/**
 * Get icon component for account type
 */
function getAccountIcon(type: AccountType | 'flexi') {
  switch (type) {
    case 'home_loan':
      return Home;
    case 'vehicle_finance':
      return Car;
    case 'credit_card':
      return CreditCard;
    case 'personal_loan':
    case 'flexi':
    default:
      return Banknote;
  }
}

/**
 * Validate balance input
 * @param value - The input value to validate
 * @returns Error message if invalid, null if valid
 */
function validateBalance(value: string): string | null {
  // Check for negative sign before parsing (parseCurrencyInput strips it)
  const trimmed = value.trim();
  if (trimmed.startsWith('-')) {
    return 'Balance cannot be negative';
  }

  // Check if input contains any digits (parseCurrencyInput returns '0' for non-numeric)
  if (!/\d/.test(trimmed)) {
    return 'Please enter a valid number';
  }

  const parsed = parseCurrencyInput(value);

  // Check if it's a valid number
  try {
    const num = new Big(parsed);

    // Must be non-negative
    if (num.lt(0)) {
      return 'Balance cannot be negative';
    }

    return null;
  } catch {
    return 'Please enter a valid number';
  }
}

/**
 * Format timestamp for display in SA format
 */
function formatLastUpdated(timestamp?: string): string {
  if (!timestamp) {
    return 'Never updated';
  }
  try {
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
}

/**
 * BalanceUpdateRow component
 *
 * A single row in the quick balance update view with inline editing,
 * validation, and save status indicators.
 */
export function BalanceUpdateRow({
  id,
  name,
  type,
  currentBalance,
  lastBalanceUpdated,
  onSave,
}: BalanceUpdateRowProps) {
  const [editValue, setEditValue] = useState(currentBalance);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [originalValue, setOriginalValue] = useState(currentBalance);

  // Sync with external changes to currentBalance
  useEffect(() => {
    setEditValue(currentBalance);
    setOriginalValue(currentBalance);
  }, [currentBalance]);

  const Icon = getAccountIcon(type);

  /**
   * Handle save operation
   */
  const handleSave = useCallback(async () => {
    // Parse the input value
    const parsed = parseCurrencyInput(editValue);

    // Validate
    const validationError = validateBalance(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Clear any previous error
    setError(null);

    // Check if value changed (comparing parsed values for precision)
    try {
      const newValue = new Big(parsed);
      const oldValue = new Big(originalValue || '0');

      if (newValue.eq(oldValue)) {
        // No change, don't save
        return;
      }
    } catch {
      // If parsing fails, proceed with save (will be caught by validation)
    }

    // Save
    setStatus('saving');
    try {
      await onSave(id, parsed);
      setStatus('saved');
      setOriginalValue(parsed);
      setEditValue(parsed);

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch {
      setStatus('error');
      setError('Failed to save');
    }
  }, [editValue, originalValue, id, onSave]);

  /**
   * Handle blur event
   */
  const handleBlur = () => {
    handleSave();
  };

  /**
   * Handle key down - Enter triggers save
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    // Clear error on change
    if (error) {
      setError(null);
    }
  };

  return (
    <div
      className="flex items-center gap-4 py-3 border-b border-slate-200 last:border-b-0"
      data-testid={`balance-row-${id}`}
    >
      {/* Account icon and name */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
          <Icon className="h-5 w-5 text-teal-600" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{name}</span>
          <span className="text-xs text-slate-400">
            {formatLastUpdated(lastBalanceUpdated)}
          </span>
        </div>
      </div>

      {/* Balance input */}
      <div className="flex-1 max-w-[200px]">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            R
          </span>
          <Input
            type="text"
            value={editValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`pl-8 text-right ${
              error
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'focus-visible:ring-teal-500'
            }`}
            aria-label={`Balance for ${name}`}
            aria-invalid={!!error}
            aria-describedby={error ? `error-${id}` : undefined}
            data-testid={`balance-input-${id}`}
          />
        </div>
        {error && (
          <p
            id={`error-${id}`}
            className="mt-1 text-xs text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      {/* Status indicator */}
      <div className="w-24 flex items-center justify-end">
        {status === 'saving' && (
          <span className="flex items-center gap-1 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        )}
        {status === 'saved' && (
          <span className="flex items-center gap-1 text-sm text-green-500">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            Error
          </span>
        )}
        {status === 'idle' && (
          <span className="text-sm text-slate-400">
            {formatCurrency(currentBalance)}
          </span>
        )}
      </div>
    </div>
  );
}
