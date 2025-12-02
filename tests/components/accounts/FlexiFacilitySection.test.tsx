import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { FlexiFacilitySection } from '@/components/accounts/FlexiFacilitySection';
import { db } from '@/lib/db';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('FlexiFacilitySection', () => {
  beforeEach(async () => {
    await db.flexiFacility.clear();
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('displays empty state message when no facility', async () => {
      render(<FlexiFacilitySection />);

      await waitFor(
        () => {
          expect(screen.getByText(/no flexi facility configured yet/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('displays Add Flexi Facility button in empty state', async () => {
      render(<FlexiFacilitySection />);

      await waitFor(
        () => {
          const addButtons = screen.getAllByRole('button', { name: /add flexi facility/i });
          expect(addButtons.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );
    });

    it('displays informational text about flexi facility', async () => {
      render(<FlexiFacilitySection />);

      await waitFor(
        () => {
          expect(screen.getByText(/velocity banking/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('displays single facility constraint message', async () => {
      render(<FlexiFacilitySection />);

      await waitFor(
        () => {
          expect(screen.getByText(/you can only have one flexi facility/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('with existing facility', () => {
    beforeEach(async () => {
      await db.flexiFacility.add({
        name: 'Test Flexi Facility',
        type: 'fnb_flexi',
        creditLimit: '200000',
        currentBalance: '50000',
        interestRate: '0.1175',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    it('displays facility card when facility exists', async () => {
      render(<FlexiFacilitySection />);

      await waitFor(
        () => {
          expect(screen.getByText('Test Flexi Facility')).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('shows Edit button instead of Add when facility exists', async () => {
      render(<FlexiFacilitySection />);

      await waitFor(
        () => {
          // Header should have Edit button
          const editButtons = screen.getAllByRole('button', { name: /edit/i });
          expect(editButtons.length).toBeGreaterThan(0);
        },
        { timeout: 5000 }
      );
    });

    it('hides Add Flexi Facility button when facility exists', async () => {
      render(<FlexiFacilitySection />);

      await waitFor(
        () => {
          expect(screen.queryByRole('button', { name: /add flexi facility/i })).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('add form', () => {
    it('shows add form when Add button is clicked', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilitySection />);

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /add flexi facility/i });
        expect(addButtons.length).toBeGreaterThan(0);
      });

      // Click the first add button (header one)
      const addButtons = screen.getAllByRole('button', { name: /add flexi facility/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/facility name/i)).toBeInTheDocument();
      });
    });

    it('shows cancel button in add form', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilitySection />);

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /add flexi facility/i });
        expect(addButtons.length).toBeGreaterThan(0);
      });

      const addButtons = screen.getAllByRole('button', { name: /add flexi facility/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it('returns to view mode when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilitySection />);

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /add flexi facility/i });
        expect(addButtons.length).toBeGreaterThan(0);
      });

      const addButtons = screen.getAllByRole('button', { name: /add flexi facility/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.getByText(/no flexi facility configured yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      await db.flexiFacility.add({
        name: 'Test Flexi Facility',
        type: 'fnb_flexi',
        creditLimit: '200000',
        currentBalance: '50000',
        interestRate: '0.1175',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    it('shows edit form when Edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilitySection />);

      await waitFor(() => {
        expect(screen.getByText('Test Flexi Facility')).toBeInTheDocument();
      });

      // Click the Edit button in the header
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Flexi Facility')).toBeInTheDocument();
      });
    });

    it('populates form with existing data in edit mode', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilitySection />);

      await waitFor(() => {
        expect(screen.getByText('Test Flexi Facility')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText(/facility name/i)).toHaveValue('Test Flexi Facility');
      });
    });
  });

  describe('delete functionality', () => {
    beforeEach(async () => {
      await db.flexiFacility.add({
        name: 'Test Flexi Facility',
        type: 'fnb_flexi',
        creditLimit: '200000',
        currentBalance: '50000',
        interestRate: '0.1175',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    it('shows delete confirmation dialog when Delete is clicked', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilitySection />);

      await waitFor(() => {
        expect(screen.getByText('Test Flexi Facility')).toBeInTheDocument();
      });

      // Click the Delete button in the card
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Flexi Facility')).toBeInTheDocument();
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      });
    });

    it('deletes facility when confirmed', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilitySection />);

      await waitFor(() => {
        expect(screen.getByText('Test Flexi Facility')).toBeInTheDocument();
      });

      // Click Delete on card
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Confirm deletion
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
      });

      // Click the confirm Delete button in the dialog
      const confirmDeleteButtons = screen.getAllByRole('button', { name: /delete/i });
      // The last one should be the confirm button in the dialog
      await user.click(confirmDeleteButtons[confirmDeleteButtons.length - 1]);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Flexi facility deleted');
        expect(screen.getByText(/no flexi facility configured yet/i)).toBeInTheDocument();
      });
    });

    it('cancels deletion when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<FlexiFacilitySection />);

      await waitFor(() => {
        expect(screen.getByText('Test Flexi Facility')).toBeInTheDocument();
      });

      // Click Delete on card
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Click Cancel
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Facility should still be there
      await waitFor(() => {
        expect(screen.getByText('Test Flexi Facility')).toBeInTheDocument();
      });
    });
  });
});
