import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { FlexiFacilityForm } from '@/components/accounts/FlexiFacilityForm';
import { db } from '@/lib/db';
import type { FlexiFacility } from '@/types/flexi-facility';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('FlexiFacilityForm', () => {
  beforeEach(async () => {
    await db.flexiFacility.clear();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all required form fields', () => {
      render(<FlexiFacilityForm />);

      expect(screen.getByLabelText(/facility name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/facility type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/credit limit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/current balance/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/annual interest rate/i)).toBeInTheDocument();
    });

    it('renders save button for new facility', () => {
      render(<FlexiFacilityForm />);
      expect(screen.getByRole('button', { name: /save facility/i })).toBeInTheDocument();
    });

    it('renders update button for existing facility', () => {
      const facility: FlexiFacility = {
        id: 1,
        name: 'Test Facility',
        type: 'fnb_flexi',
        creditLimit: '200000',
        currentBalance: '50000',
        interestRate: '0.1175',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      render(<FlexiFacilityForm facility={facility} />);
      expect(screen.getByRole('button', { name: /update facility/i })).toBeInTheDocument();
    });

    it('renders cancel button when onCancel provided', () => {
      render(<FlexiFacilityForm onCancel={() => {}} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders facility type dropdown', () => {
      render(<FlexiFacilityForm />);
      // The select trigger should be in the document
      expect(screen.getByLabelText(/facility type/i)).toBeInTheDocument();
    });
  });

  describe('edit mode', () => {
    it('populates form with existing facility data', () => {
      const facility: FlexiFacility = {
        id: 1,
        name: 'My Flexi Facility',
        type: 'fnb_flexi',
        creditLimit: '200000',
        currentBalance: '50000',
        interestRate: '0.1175',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      render(<FlexiFacilityForm facility={facility} />);

      expect(screen.getByLabelText(/facility name/i)).toHaveValue('My Flexi Facility');
      expect(screen.getByLabelText(/credit limit/i)).toHaveValue(200000);
      expect(screen.getByLabelText(/current balance/i)).toHaveValue(50000);
      // Interest rate converted from decimal to percentage
      expect(screen.getByLabelText(/annual interest rate/i)).toHaveValue(11.75);
    });

    it('populates form with negative balance', () => {
      const facility: FlexiFacility = {
        id: 1,
        name: 'My Flexi Facility',
        type: 'standard_bank_access',
        creditLimit: '200000',
        currentBalance: '-25000',
        interestRate: '0.1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      render(<FlexiFacilityForm facility={facility} />);

      expect(screen.getByLabelText(/current balance/i)).toHaveValue(-25000);
    });
  });

  describe('validation', () => {
    it('shows error when required fields are empty', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilityForm />);

      await user.click(screen.getByRole('button', { name: /save facility/i }));

      await waitFor(() => {
        expect(screen.getByText(/facility name is required/i)).toBeInTheDocument();
      });
    });

    it('shows error for negative credit limit', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilityForm />);

      const limitInput = screen.getByLabelText(/credit limit/i);
      await user.type(screen.getByLabelText(/facility name/i), 'Test');
      await user.clear(limitInput);
      await user.type(limitInput, '-100000');
      await user.type(screen.getByLabelText(/current balance/i), '50000');
      await user.type(screen.getByLabelText(/annual interest rate/i), '10');

      await user.click(screen.getByRole('button', { name: /save facility/i }));

      await waitFor(() => {
        expect(toast.success).not.toHaveBeenCalled();
      });
    });

    it('shows error for interest rate over 100', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilityForm />);

      await user.type(screen.getByLabelText(/facility name/i), 'Test');
      await user.type(screen.getByLabelText(/credit limit/i), '200000');
      await user.type(screen.getByLabelText(/current balance/i), '50000');

      const rateInput = screen.getByLabelText(/annual interest rate/i);
      await user.clear(rateInput);
      await user.type(rateInput, '150');

      await user.click(screen.getByRole('button', { name: /save facility/i }));

      await waitFor(() => {
        expect(toast.success).not.toHaveBeenCalled();
      });
    });

    it('allows negative balance (for available credit scenario)', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilityForm />);

      await user.type(screen.getByLabelText(/facility name/i), 'Test Facility');
      await user.type(screen.getByLabelText(/credit limit/i), '200000');
      await user.type(screen.getByLabelText(/current balance/i), '-25000');
      await user.type(screen.getByLabelText(/annual interest rate/i), '11.75');

      await user.click(screen.getByRole('button', { name: /save facility/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Flexi facility saved');
      });
    });
  });

  describe('form submission', () => {
    it('calls onSuccess after successful save', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      render(<FlexiFacilityForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/facility name/i), 'Test Facility');
      await user.type(screen.getByLabelText(/credit limit/i), '200000');
      await user.type(screen.getByLabelText(/current balance/i), '50000');
      await user.type(screen.getByLabelText(/annual interest rate/i), '11.75');

      await user.click(screen.getByRole('button', { name: /save facility/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Flexi facility saved');
      });
    });

    it('shows success toast on save', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilityForm />);

      await user.type(screen.getByLabelText(/facility name/i), 'Test Facility');
      await user.type(screen.getByLabelText(/credit limit/i), '200000');
      await user.type(screen.getByLabelText(/current balance/i), '50000');
      await user.type(screen.getByLabelText(/annual interest rate/i), '11.75');

      await user.click(screen.getByRole('button', { name: /save facility/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Flexi facility saved');
      });
    });

    it('shows success toast on update', async () => {
      const user = userEvent.setup();
      const facility: FlexiFacility = {
        id: 1,
        name: 'Test Facility',
        type: 'fnb_flexi',
        creditLimit: '200000',
        currentBalance: '50000',
        interestRate: '0.1175',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add facility to DB first
      await db.flexiFacility.add(facility);

      render(<FlexiFacilityForm facility={facility} />);

      await user.clear(screen.getByLabelText(/facility name/i));
      await user.type(screen.getByLabelText(/facility name/i), 'Updated Facility');

      await user.click(screen.getByRole('button', { name: /update facility/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Flexi facility updated');
      });
    });

    it('calls onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<FlexiFacilityForm onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });

    it('shows error when trying to add second facility', async () => {
      const user = userEvent.setup();

      // Add first facility to DB
      await db.flexiFacility.add({
        name: 'First Facility',
        type: 'fnb_flexi',
        creditLimit: '200000',
        currentBalance: '50000',
        interestRate: '0.1175',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      render(<FlexiFacilityForm />);

      await user.type(screen.getByLabelText(/facility name/i), 'Second Facility');
      await user.type(screen.getByLabelText(/credit limit/i), '300000');
      await user.type(screen.getByLabelText(/current balance/i), '0');
      await user.type(screen.getByLabelText(/annual interest rate/i), '10');

      await user.click(screen.getByRole('button', { name: /save facility/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Only one flexi facility allowed');
      });
    });
  });

  describe('interest rate conversion', () => {
    it('converts percentage input to decimal for storage', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilityForm />);

      await user.type(screen.getByLabelText(/facility name/i), 'Test');
      await user.type(screen.getByLabelText(/credit limit/i), '200000');
      await user.type(screen.getByLabelText(/current balance/i), '50000');
      await user.type(screen.getByLabelText(/annual interest rate/i), '11.75');

      await user.click(screen.getByRole('button', { name: /save facility/i }));

      await waitFor(async () => {
        const facilities = await db.flexiFacility.toArray();
        expect(facilities.length).toBe(1);
        expect(facilities[0].interestRate).toBe('0.1175');
      });
    });
  });

  describe('facility type selection', () => {
    it('saves FNB Flexi type correctly', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilityForm />);

      await user.type(screen.getByLabelText(/facility name/i), 'Test');
      await user.type(screen.getByLabelText(/credit limit/i), '200000');
      await user.type(screen.getByLabelText(/current balance/i), '50000');
      await user.type(screen.getByLabelText(/annual interest rate/i), '11.75');

      // FNB Flexi is default, so just submit
      await user.click(screen.getByRole('button', { name: /save facility/i }));

      await waitFor(async () => {
        const facilities = await db.flexiFacility.toArray();
        expect(facilities[0].type).toBe('fnb_flexi');
      });
    });

    it('saves Standard Bank Access Bond type correctly when pre-filled in edit mode', async () => {
      const user = userEvent.setup();
      const facility: FlexiFacility = {
        id: 1,
        name: 'Test Facility',
        type: 'standard_bank_access',
        creditLimit: '200000',
        currentBalance: '50000',
        interestRate: '0.1175',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.flexiFacility.add(facility);
      render(<FlexiFacilityForm facility={facility} />);

      await user.click(screen.getByRole('button', { name: /update facility/i }));

      await waitFor(async () => {
        const facilities = await db.flexiFacility.toArray();
        expect(facilities[0].type).toBe('standard_bank_access');
      });
    });
  });
});
