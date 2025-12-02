import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { useFlexiFacility } from '@/hooks/useFlexiFacility';
import { db } from '@/lib/db';
import type { FlexiFacility } from '@/types/flexi-facility';

const testFacility: Omit<FlexiFacility, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'My Flexi Facility',
  type: 'fnb_flexi',
  creditLimit: '200000',
  currentBalance: '50000',
  interestRate: '0.1175',
};

describe('useFlexiFacility', () => {
  beforeEach(async () => {
    await db.flexiFacility.clear();
  });

  describe('initial state', () => {
    it('returns null facility initially', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await waitFor(() => {
        expect(result.current.facility).toBeNull();
      });
    });

    it('returns hasExistingFacility as false when no facility', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await waitFor(() => {
        expect(result.current.hasExistingFacility).toBe(false);
      });
    });

    it('returns zero available credit when no facility', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await waitFor(() => {
        expect(result.current.availableCredit).toBe('0');
      });
    });
  });

  describe('saveFacility', () => {
    it('saves facility to database and returns id', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      let saveResult: Awaited<ReturnType<typeof result.current.saveFacility>>;
      await act(async () => {
        saveResult = await result.current.saveFacility(testFacility);
      });

      expect(saveResult!.success).toBe(true);
      if (saveResult!.success) {
        expect(typeof saveResult.data).toBe('number');
      }

      await waitFor(() => {
        expect(result.current.facility).not.toBeNull();
        expect(result.current.facility?.name).toBe('My Flexi Facility');
      });
    });

    it('sets createdAt and updatedAt timestamps', async () => {
      const { result } = renderHook(() => useFlexiFacility());
      const before = new Date().toISOString();

      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.facility).not.toBeNull();
      });

      const facility = result.current.facility!;
      expect(facility.createdAt).toBeDefined();
      expect(facility.updatedAt).toBeDefined();
      expect(facility.createdAt >= before).toBe(true);
      expect(facility.updatedAt >= before).toBe(true);
    });

    it('sets hasExistingFacility to true after save', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.hasExistingFacility).toBe(true);
      });
    });

    it('returns error when trying to add second facility', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.facility).not.toBeNull();
      });

      let secondSaveResult: Awaited<ReturnType<typeof result.current.saveFacility>>;
      await act(async () => {
        secondSaveResult = await result.current.saveFacility({
          ...testFacility,
          name: 'Second Facility',
        });
      });

      expect(secondSaveResult!.success).toBe(false);
      if (!secondSaveResult!.success) {
        expect(secondSaveResult.error.message).toBe('Only one flexi facility allowed');
      }

      // Verify still only one facility
      await waitFor(() => {
        expect(result.current.facility?.name).toBe('My Flexi Facility');
      });
    });
  });

  describe('updateFacility', () => {
    it('updates facility in database', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.facility).not.toBeNull();
      });

      await act(async () => {
        await result.current.updateFacility({ currentBalance: '75000' });
      });

      await waitFor(() => {
        expect(result.current.facility?.currentBalance).toBe('75000');
      });
    });

    it('updates updatedAt timestamp', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.facility).not.toBeNull();
      });

      const originalUpdatedAt = result.current.facility!.updatedAt;

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await act(async () => {
        await result.current.updateFacility({ name: 'Updated Name' });
      });

      await waitFor(() => {
        expect(result.current.facility!.updatedAt > originalUpdatedAt).toBe(true);
      });
    });

    it('returns success result on update', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.facility).not.toBeNull();
      });

      let updateResult: Awaited<ReturnType<typeof result.current.updateFacility>>;
      await act(async () => {
        updateResult = await result.current.updateFacility({ creditLimit: '250000' });
      });

      expect(updateResult!.success).toBe(true);
    });

    it('returns error when no facility to update', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      let updateResult: Awaited<ReturnType<typeof result.current.updateFacility>>;
      await act(async () => {
        updateResult = await result.current.updateFacility({ name: 'Test' });
      });

      expect(updateResult!.success).toBe(false);
      if (!updateResult!.success) {
        expect(updateResult.error.message).toBe('No flexi facility to update');
      }
    });
  });

  describe('deleteFacility', () => {
    it('removes facility from database', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.facility).not.toBeNull();
      });

      await act(async () => {
        await result.current.deleteFacility();
      });

      await waitFor(() => {
        expect(result.current.facility).toBeNull();
        expect(result.current.hasExistingFacility).toBe(false);
      });
    });

    it('returns success result on delete', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.facility).not.toBeNull();
      });

      let deleteResult: Awaited<ReturnType<typeof result.current.deleteFacility>>;
      await act(async () => {
        deleteResult = await result.current.deleteFacility();
      });

      expect(deleteResult!.success).toBe(true);
    });

    it('returns error when no facility to delete', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      let deleteResult: Awaited<ReturnType<typeof result.current.deleteFacility>>;
      await act(async () => {
        deleteResult = await result.current.deleteFacility();
      });

      expect(deleteResult!.success).toBe(false);
      if (!deleteResult!.success) {
        expect(deleteResult.error.message).toBe('No flexi facility to delete');
      }
    });

    it('allows adding new facility after deletion', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      // Add facility
      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.facility).not.toBeNull();
      });

      // Delete facility
      await act(async () => {
        await result.current.deleteFacility();
      });

      await waitFor(() => {
        expect(result.current.facility).toBeNull();
      });

      // Add new facility
      let saveResult: Awaited<ReturnType<typeof result.current.saveFacility>>;
      await act(async () => {
        saveResult = await result.current.saveFacility({
          ...testFacility,
          name: 'New Facility',
        });
      });

      expect(saveResult!.success).toBe(true);
      await waitFor(() => {
        expect(result.current.facility?.name).toBe('New Facility');
      });
    });
  });

  describe('availableCredit calculation', () => {
    it('calculates available credit correctly', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility(testFacility); // limit: 200000, balance: 50000
      });

      await waitFor(() => {
        expect(result.current.availableCredit).toBe('150000');
      });
    });

    it('handles zero balance (full credit available)', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility({
          ...testFacility,
          currentBalance: '0',
        });
      });

      await waitFor(() => {
        expect(result.current.availableCredit).toBe('200000');
      });
    });

    it('handles balance equal to limit (zero credit available)', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility({
          ...testFacility,
          currentBalance: '200000',
        });
      });

      await waitFor(() => {
        expect(result.current.availableCredit).toBe('0');
      });
    });

    it('handles negative balance (overpaid - extra credit available)', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility({
          ...testFacility,
          creditLimit: '200000',
          currentBalance: '-25000', // Overpaid by 25000
        });
      });

      await waitFor(() => {
        // 200000 - (-25000) = 225000
        expect(result.current.availableCredit).toBe('225000');
      });
    });

    it('handles balance exceeding limit (negative credit)', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility({
          ...testFacility,
          creditLimit: '200000',
          currentBalance: '250000', // Over limit
        });
      });

      await waitFor(() => {
        // 200000 - 250000 = -50000
        expect(result.current.availableCredit).toBe('-50000');
      });
    });

    it('handles decimal values correctly with big.js', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility({
          ...testFacility,
          creditLimit: '200000.50',
          currentBalance: '50000.75',
        });
      });

      await waitFor(() => {
        expect(result.current.availableCredit).toBe('149999.75');
      });
    });

    it('updates when facility is updated', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility(testFacility);
      });

      await waitFor(() => {
        expect(result.current.availableCredit).toBe('150000');
      });

      await act(async () => {
        await result.current.updateFacility({ currentBalance: '100000' });
      });

      await waitFor(() => {
        expect(result.current.availableCredit).toBe('100000');
      });
    });
  });

  describe('facility types', () => {
    it('saves FNB Flexi type correctly', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility({
          ...testFacility,
          type: 'fnb_flexi',
        });
      });

      await waitFor(() => {
        expect(result.current.facility?.type).toBe('fnb_flexi');
      });
    });

    it('saves Standard Bank Access Bond type correctly', async () => {
      const { result } = renderHook(() => useFlexiFacility());

      await act(async () => {
        await result.current.saveFacility({
          ...testFacility,
          type: 'standard_bank_access',
        });
      });

      await waitFor(() => {
        expect(result.current.facility?.type).toBe('standard_bank_access');
      });
    });
  });
});
