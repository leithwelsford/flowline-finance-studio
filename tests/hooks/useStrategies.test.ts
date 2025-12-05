import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import Big from 'big.js'
import { useStrategies } from '@/hooks/useStrategies'
import { useCalculationStore } from '@/store'
import { db } from '@/lib/db'
import type { DebtAccount } from '@/types/account'
import type { IncomeEntry } from '@/types/income'
import type { ExpenseEntry } from '@/types/expense'
import type { FlexiFacility } from '@/types/flexi-facility'

const testAccount: Omit<DebtAccount, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Test Home Loan',
  type: 'home_loan',
  balance: '100000',
  interestRate: '0.12',
  minimumPayment: '2000',
  lender: 'FNB',
  interestType: 'monthly',
}

const testIncome: Omit<IncomeEntry, 'id' | 'createdAt'> = {
  source: 'Salary',
  amount: '30000',
  paymentDate: 25,
}

const testExpense: Omit<ExpenseEntry, 'id' | 'createdAt'> = {
  category: 'housing',
  amount: '10000',
  date: '2024-01-01',
}

const testFlexi: Omit<FlexiFacility, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'FNB Flexi',
  type: 'fnb_flexi',
  creditLimit: '200000',
  currentBalance: '50000',
  interestRate: '0.115',
}

describe('useStrategies', () => {
  beforeEach(async () => {
    // Clear all tables
    await db.accounts.clear()
    await db.income.clear()
    await db.expenses.clear()
    await db.flexiFacility.clear()
    await db.settings.clear()

    // Reset store
    useCalculationStore.getState().clearResults()
  })

  describe('AC-4.8.7: useStrategies hook returns required values', () => {
    it('returns strategies array', async () => {
      const { result } = renderHook(() => useStrategies())

      expect(Array.isArray(result.current.strategies)).toBe(true)
    })

    it('returns baseline (initially null)', async () => {
      const { result } = renderHook(() => useStrategies())

      expect(result.current.baseline).toBeNull()
    })

    it('returns isCalculating boolean', async () => {
      const { result } = renderHook(() => useStrategies())

      expect(typeof result.current.isCalculating).toBe('boolean')
    })

    it('returns calculateStrategies function', async () => {
      const { result } = renderHook(() => useStrategies())

      expect(typeof result.current.calculateStrategies).toBe('function')
    })

    it('returns bestStrategy (initially null)', async () => {
      const { result } = renderHook(() => useStrategies())

      expect(result.current.bestStrategy).toBeNull()
    })

    it('returns lastCalculated (initially null)', async () => {
      const { result } = renderHook(() => useStrategies())

      expect(result.current.lastCalculated).toBeNull()
    })

    it('returns error (initially null)', async () => {
      const { result } = renderHook(() => useStrategies())

      expect(result.current.error).toBeNull()
    })
  })

  describe('AC-4.8.9: Loading state management', () => {
    it('isCalculating starts false', async () => {
      const { result } = renderHook(() => useStrategies())

      expect(result.current.isCalculating).toBe(false)
    })

    it('isDataLoading indicates data fetch in progress', async () => {
      const { result } = renderHook(() => useStrategies())

      // Initially loading
      expect(typeof result.current.isDataLoading).toBe('boolean')
    })
  })

  describe('AC-4.8.7: bestStrategy computed correctly', () => {
    it('bestStrategy is null when no strategies calculated', async () => {
      const { result } = renderHook(() => useStrategies())

      expect(result.current.bestStrategy).toBeNull()
    })
  })
})

describe('calculationStore', () => {
  beforeEach(() => {
    useCalculationStore.getState().clearResults()
  })

  describe('AC-4.8.6: calculationStore state structure', () => {
    it('has results array', () => {
      const state = useCalculationStore.getState()
      expect(Array.isArray(state.results)).toBe(true)
    })

    it('has baseline (nullable)', () => {
      const state = useCalculationStore.getState()
      expect(state.baseline).toBeNull()
    })

    it('has isCalculating boolean', () => {
      const state = useCalculationStore.getState()
      expect(typeof state.isCalculating).toBe('boolean')
    })

    it('has lastCalculated (nullable string)', () => {
      const state = useCalculationStore.getState()
      expect(state.lastCalculated).toBeNull()
    })

    it('has error (nullable string)', () => {
      const state = useCalculationStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('AC-4.8.6: calculationStore actions', () => {
    it('setResults updates results array', () => {
      const mockResults = [
        {
          strategyId: 'test',
          strategyName: 'Test',
          effortLevel: 'low' as const,
          debtFreeMonth: 12,
          debtFreeDate: '2025-01-01',
          totalInterestPaid: new Big('1000'),
          totalPrincipalPaid: new Big('10000'),
          monthsSaved: 0,
          interestSaved: new Big('0'),
          monthlyProjections: [],
        },
      ]

      useCalculationStore.getState().setResults(mockResults)

      expect(useCalculationStore.getState().results).toEqual(mockResults)
    })

    it('setBaseline updates baseline', () => {
      const mockBaseline = {
        strategyId: 'baseline',
        strategyName: 'Baseline',
        effortLevel: 'low' as const,
        debtFreeMonth: 24,
        debtFreeDate: '2026-01-01',
        totalInterestPaid: new Big('5000'),
        totalPrincipalPaid: new Big('50000'),
        monthsSaved: 0,
        interestSaved: new Big('0'),
        monthlyProjections: [],
      }

      useCalculationStore.getState().setBaseline(mockBaseline)

      expect(useCalculationStore.getState().baseline).toEqual(mockBaseline)
    })

    it('setCalculating updates isCalculating', () => {
      useCalculationStore.getState().setCalculating(true)
      expect(useCalculationStore.getState().isCalculating).toBe(true)

      useCalculationStore.getState().setCalculating(false)
      expect(useCalculationStore.getState().isCalculating).toBe(false)
    })

    it('setError updates error', () => {
      useCalculationStore.getState().setError('Test error')
      expect(useCalculationStore.getState().error).toBe('Test error')

      useCalculationStore.getState().setError(null)
      expect(useCalculationStore.getState().error).toBeNull()
    })

    it('clearResults resets all state', () => {
      // Set some state
      useCalculationStore.getState().setResults([])
      useCalculationStore.getState().setLastCalculated('2024-01-01T00:00:00.000Z')
      useCalculationStore.getState().setError('Some error')

      // Clear
      useCalculationStore.getState().clearResults()

      const state = useCalculationStore.getState()
      expect(state.results).toEqual([])
      expect(state.baseline).toBeNull()
      expect(state.lastCalculated).toBeNull()
      expect(state.error).toBeNull()
    })
  })
})
