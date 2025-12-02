import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Big from 'big.js';
import { db } from '@/lib/db';
import { ok, err, type Result } from '@/lib/utils/result';
import type { FlexiFacility } from '@/types/flexi-facility';

/**
 * Flexi facility data for creating a new facility (without id and timestamps)
 */
export type NewFlexiFacilityData = Omit<FlexiFacility, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Return type for useFlexiFacility hook
 */
export interface UseFlexiFacilityReturn {
  /** The current flexi facility (null if none exists) */
  facility: FlexiFacility | null;
  /** Whether the query is still loading */
  isLoading: boolean;
  /** Whether a facility already exists */
  hasExistingFacility: boolean;
  /** Add a new flexi facility (returns error if one already exists) */
  saveFacility: (facility: NewFlexiFacilityData) => Promise<Result<number>>;
  /** Update the existing facility */
  updateFacility: (updates: Partial<FlexiFacility>) => Promise<Result<void>>;
  /** Delete the existing facility */
  deleteFacility: () => Promise<Result<void>>;
  /** Available credit: creditLimit - currentBalance */
  availableCredit: string;
}

/**
 * Hook for managing flexi facility with Dexie
 *
 * Only ONE flexi facility is allowed per user. This hook provides
 * reactive access via useLiveQuery and CRUD operations with single
 * facility constraint enforcement.
 *
 * @example
 * ```tsx
 * const { facility, saveFacility, availableCredit, hasExistingFacility } = useFlexiFacility();
 *
 * const handleSave = async (data) => {
 *   const result = await saveFacility(data);
 *   if (result.success) {
 *     toast.success('Flexi facility saved');
 *   } else {
 *     toast.error(result.error.message);
 *   }
 * };
 * ```
 */
export function useFlexiFacility(): UseFlexiFacilityReturn {
  // Get the first (and only) facility
  const facility = useLiveQuery(() => db.flexiFacility.toCollection().first()) ?? null;
  const isLoading = facility === undefined;
  const hasExistingFacility = facility !== null && facility !== undefined;

  /**
   * Save a new flexi facility
   * Returns error if a facility already exists
   */
  const saveFacility = async (data: NewFlexiFacilityData): Promise<Result<number>> => {
    try {
      // Check if a facility already exists
      const existingCount = await db.flexiFacility.count();
      if (existingCount > 0) {
        return err(new Error('Only one flexi facility allowed'));
      }

      const now = new Date().toISOString();
      const id = await db.flexiFacility.add({
        ...data,
        createdAt: now,
        updatedAt: now,
      } as FlexiFacility);
      return ok(id);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to save flexi facility'));
    }
  };

  /**
   * Update the existing flexi facility
   */
  const updateFacility = async (updates: Partial<FlexiFacility>): Promise<Result<void>> => {
    try {
      if (!facility?.id) {
        return err(new Error('No flexi facility to update'));
      }

      const now = new Date().toISOString();
      await db.flexiFacility.update(facility.id, {
        ...updates,
        updatedAt: now,
      });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update flexi facility'));
    }
  };

  /**
   * Delete the existing flexi facility
   */
  const deleteFacility = async (): Promise<Result<void>> => {
    try {
      if (!facility?.id) {
        return err(new Error('No flexi facility to delete'));
      }

      await db.flexiFacility.delete(facility.id);
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to delete flexi facility'));
    }
  };

  /**
   * Calculate available credit: creditLimit - currentBalance
   * Uses big.js for precision
   */
  const availableCredit = useMemo(() => {
    if (!facility) return '0';
    try {
      const limit = new Big(facility.creditLimit || '0');
      const balance = new Big(facility.currentBalance || '0');
      return limit.minus(balance).toString();
    } catch {
      return '0';
    }
  }, [facility]);

  return {
    facility,
    isLoading,
    hasExistingFacility,
    saveFacility,
    updateFacility,
    deleteFacility,
    availableCredit,
  };
}
