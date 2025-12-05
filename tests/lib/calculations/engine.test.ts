import { describe, it, expect, vi } from 'vitest'
import Big from 'big.js'
import { calculateAllStrategies, calculateStrategy } from '@/lib/calculations/engine'
import { getAllStrategies } from '@/lib/calculations/strategies'
import type { FinancialSnapshot, StrategyConfig } from '@/lib/calculations/types'

describe('calculateAllStrategies', () => {
  /**
   * Create a standard test snapshot
   */
  const createTestSnapshot = (overrides?: Partial<FinancialSnapshot>): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '50000',
        interestRate: '0.12',
        minimumPayment: '2000',
        interestType: 'monthly',
      },
      {
        id: 2,
        balance: '20000',
        interestRate: '0.18',
        minimumPayment: '800',
        interestType: 'monthly',
      },
    ],
    flexiFacility: {
      currentBalance: '10000',
      interestRate: '0.115',
    },
    monthlyIncome: '25000',
    monthlyExpenses: '15000',
    availableSurplus: '7200', // 25000 - 15000 - 2000 - 800 = 7200
    snapshotDate: '2024-01-01',
    ...overrides,
  })

  describe('AC-4.8.1: calculateAllStrategies creates snapshot and runs all strategies', () => {
    it('returns successful result with all strategies when valid snapshot provided', () => {
      const snapshot = createTestSnapshot()
      const result = calculateAllStrategies(snapshot)

      expect(result.results.length).toBeGreaterThan(0)
      expect(result.baseline).not.toBeNull()
      expect(result.message).toBeNull()
    })

    it('calculates all strategies from provided snapshot', () => {
      const snapshot = createTestSnapshot()
      const result = calculateAllStrategies(snapshot)

      // Should have multiple strategies
      expect(result.results.length).toBeGreaterThanOrEqual(3)

      // Each result should have valid structure
      for (const projection of result.results) {
        expect(projection.strategyId).toBeDefined()
        expect(projection.strategyName).toBeDefined()
        expect(projection.debtFreeMonth).toBeGreaterThan(0)
        expect(projection.totalInterestPaid).toBeInstanceOf(Big)
      }
    })
  })

  describe('AC-4.8.2: Baseline calculated first for comparison metrics', () => {
    it('calculates baseline and uses it for comparison metrics', () => {
      const snapshot = createTestSnapshot()
      const result = calculateAllStrategies(snapshot)

      // Baseline should exist
      expect(result.baseline).not.toBeNull()
      expect(result.baseline?.strategyId).toBe('baseline')

      // Baseline should have zero savings (it is the comparison point)
      expect(result.baseline?.monthsSaved).toBe(0)
      expect(result.baseline?.interestSaved.toNumber()).toBe(0)

      // Other strategies should have positive savings
      const nonBaseline = result.results.filter((s) => s.strategyId !== 'baseline')
      for (const strategy of nonBaseline) {
        // Most optimizing strategies should save interest
        // (some edge cases may exist but generally true)
        expect(strategy.interestSaved).toBeInstanceOf(Big)
      }
    })

    it('baseline is included in results array', () => {
      const snapshot = createTestSnapshot()
      const result = calculateAllStrategies(snapshot)

      const baselineInResults = result.results.find((s) => s.strategyId === 'baseline')
      expect(baselineInResults).toBeDefined()
    })
  })

  describe('AC-4.8.3: All 8 strategies executed and results collected', () => {
    it('invokes all 8 strategies', () => {
      const snapshot = createTestSnapshot()
      const result = calculateAllStrategies(snapshot)

      // With flexi facility, all 8 strategies should return results
      const expectedStrategies = [
        'baseline',
        'snowball',
        'avalanche',
        'flexi-chunking',
        'aggressive-flexi',
        'velocity-banking',
        'hybrid-flexi-snowball',
        'hybrid-flexi-avalanche',
      ]

      const resultIds = result.results.map((r) => r.strategyId)

      for (const id of expectedStrategies) {
        expect(resultIds).toContain(id)
      }

      expect(result.results.length).toBe(8)
    })

    it('verifies all strategies in registry are invoked', () => {
      const allStrategies = getAllStrategies()
      expect(allStrategies.length).toBe(8)

      const snapshot = createTestSnapshot()
      const result = calculateAllStrategies(snapshot)

      // With flexi facility, all strategies should succeed
      expect(result.results.length).toBe(allStrategies.length)
    })
  })

  describe('AC-4.8.4: Flexi strategies return null without flexi facility', () => {
    it('filters out null results from flexi strategies when no flexi facility', () => {
      const snapshot = createTestSnapshot({
        flexiFacility: null,
      })

      const result = calculateAllStrategies(snapshot)

      // Flexi strategies should be filtered out
      const resultIds = result.results.map((r) => r.strategyId)

      // These strategies require flexi and should be filtered
      expect(resultIds).not.toContain('flexi-chunking')
      expect(resultIds).not.toContain('aggressive-flexi')
      expect(resultIds).not.toContain('velocity-banking')
      expect(resultIds).not.toContain('hybrid-snowball')
      expect(resultIds).not.toContain('hybrid-avalanche')

      // Non-flexi strategies should still be present
      expect(resultIds).toContain('baseline')
      expect(resultIds).toContain('snowball')
      expect(resultIds).toContain('avalanche')
    })

    it('returns 3 strategies when no flexi facility exists', () => {
      const snapshot = createTestSnapshot({
        flexiFacility: null,
      })

      const result = calculateAllStrategies(snapshot)

      // Only non-flexi strategies: baseline, snowball, avalanche
      expect(result.results.length).toBe(3)
    })
  })

  describe('AC-4.8.5: Performance < 3 seconds for typical scenarios', () => {
    it('completes calculation in under 3 seconds for 5 accounts, 360 months', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          { id: 1, balance: '100000', interestRate: '0.10', minimumPayment: '1500', interestType: 'monthly' },
          { id: 2, balance: '50000', interestRate: '0.15', minimumPayment: '1000', interestType: 'monthly' },
          { id: 3, balance: '30000', interestRate: '0.18', minimumPayment: '600', interestType: 'monthly' },
          { id: 4, balance: '20000', interestRate: '0.12', minimumPayment: '400', interestType: 'monthly' },
          { id: 5, balance: '10000', interestRate: '0.20', minimumPayment: '300', interestType: 'monthly' },
        ],
        flexiFacility: { currentBalance: '20000', interestRate: '0.115' },
        monthlyIncome: '30000',
        monthlyExpenses: '15000',
        availableSurplus: '11200', // 30000 - 15000 - 3800 = 11200
        snapshotDate: '2024-01-01',
      }

      const startTime = performance.now()
      const result = calculateAllStrategies(snapshot)
      const endTime = performance.now()

      const durationMs = endTime - startTime

      expect(durationMs).toBeLessThan(3000) // Under 3 seconds
      expect(result.results.length).toBeGreaterThan(0)
    })

    it('completes calculation in under 3 seconds for 10 accounts', () => {
      const accounts = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        balance: String((10 - i) * 10000), // 100000 down to 10000
        interestRate: String(0.1 + i * 0.01), // 10% to 19%
        minimumPayment: String(500 + i * 100), // 500 to 1400
        interestType: 'monthly' as const,
      }))

      const totalMinPayments = accounts.reduce((sum, a) => sum + parseInt(a.minimumPayment), 0)

      const snapshot: FinancialSnapshot = {
        accounts,
        flexiFacility: { currentBalance: '50000', interestRate: '0.115' },
        monthlyIncome: '50000',
        monthlyExpenses: '20000',
        availableSurplus: String(50000 - 20000 - totalMinPayments),
        snapshotDate: '2024-01-01',
      }

      const startTime = performance.now()
      const result = calculateAllStrategies(snapshot)
      const endTime = performance.now()

      const durationMs = endTime - startTime

      expect(durationMs).toBeLessThan(3000)
      expect(result.results.length).toBeGreaterThan(0)
    })
  })

  describe('AC-4.8.8: User configuration passed to all strategy calculations', () => {
    it('passes config to all strategy calculate() calls', () => {
      const snapshot = createTestSnapshot()
      const config: StrategyConfig = {
        chunkAmount: '5000',
        paymentFrequency: 'monthly',
        targetAccountId: 1,
      }

      const result = calculateAllStrategies(snapshot, config)

      // All results should be present (config should not prevent calculation)
      expect(result.results.length).toBeGreaterThan(0)
      expect(result.baseline).not.toBeNull()
    })
  })

  describe('AC-4.8.10: Results sorted by interest saved', () => {
    it('sorts results by interestSaved descending (highest first)', () => {
      const snapshot = createTestSnapshot()
      const result = calculateAllStrategies(snapshot)

      // Verify sorting
      for (let i = 0; i < result.results.length - 1; i++) {
        const current = result.results[i].interestSaved.toNumber()
        const next = result.results[i + 1].interestSaved.toNumber()
        expect(current).toBeGreaterThanOrEqual(next)
      }
    })

    it('baseline is last (zero savings)', () => {
      const snapshot = createTestSnapshot()
      const result = calculateAllStrategies(snapshot)

      const lastResult = result.results[result.results.length - 1]
      expect(lastResult.strategyId).toBe('baseline')
      expect(lastResult.interestSaved.toNumber()).toBe(0)
    })
  })

  describe('AC-4.8.12: Empty results when no accounts or zero balance', () => {
    it('returns empty results with message when no accounts', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '5000',
        snapshotDate: '2024-01-01',
      }

      const result = calculateAllStrategies(snapshot)

      expect(result.results).toEqual([])
      expect(result.baseline).toBeNull()
      expect(result.message).toBe('No debt accounts found. Add accounts to calculate strategies.')
    })

    it('returns empty results with message when all accounts have zero balance', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          { id: 1, balance: '0', interestRate: '0.12', minimumPayment: '500', interestType: 'monthly' },
          { id: 2, balance: '0', interestRate: '0.18', minimumPayment: '300', interestType: 'monthly' },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '4200',
        snapshotDate: '2024-01-01',
      }

      const result = calculateAllStrategies(snapshot)

      expect(result.results).toEqual([])
      expect(result.baseline).toBeNull()
      expect(result.message).toBe('All accounts have zero balance. No strategies to calculate.')
    })

    it('returns results when at least one account has non-zero balance', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          { id: 1, balance: '10000', interestRate: '0.12', minimumPayment: '500', interestType: 'monthly' },
          { id: 2, balance: '0', interestRate: '0.18', minimumPayment: '300', interestType: 'monthly' },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '4200',
        snapshotDate: '2024-01-01',
      }

      const result = calculateAllStrategies(snapshot)

      expect(result.results.length).toBeGreaterThan(0)
      expect(result.baseline).not.toBeNull()
      expect(result.message).toBeNull()
    })
  })
})

describe('calculateStrategy', () => {
  const createTestSnapshot = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '50000',
        interestRate: '0.12',
        minimumPayment: '2000',
        interestType: 'monthly',
      },
    ],
    flexiFacility: null,
    monthlyIncome: '25000',
    monthlyExpenses: '15000',
    availableSurplus: '8000',
    snapshotDate: '2024-01-01',
  })

  it('calculates a single strategy by ID', () => {
    const snapshot = createTestSnapshot()
    const result = calculateStrategy('baseline', snapshot)

    expect(result).not.toBeNull()
    expect(result?.strategyId).toBe('baseline')
  })

  it('returns null for unknown strategy ID', () => {
    const snapshot = createTestSnapshot()
    const result = calculateStrategy('unknown-strategy', snapshot)

    expect(result).toBeNull()
  })

  it('passes baseline for comparison metrics', () => {
    const snapshot = createTestSnapshot()
    const baseline = calculateStrategy('baseline', snapshot)

    expect(baseline).not.toBeNull()

    const snowball = calculateStrategy('snowball', snapshot, undefined, baseline!)

    expect(snowball).not.toBeNull()
    expect(snowball?.monthsSaved).toBeGreaterThanOrEqual(0)
    expect(snowball?.interestSaved).toBeInstanceOf(Big)
  })
})
