import { describe, it, expect, beforeEach } from 'vitest'
import Big from 'big.js'
import 'fake-indexeddb/auto'
import { db } from '@/lib/db'
import { buildFinancialSnapshot } from '@/lib/calculations/snapshot'
import { calculateAllStrategies } from '@/lib/calculations/engine'
import type { DebtAccount } from '@/types/account'
import type { FlexiFacility } from '@/types/flexi-facility'
import type { IncomeEntry } from '@/types/income'
import type { ExpenseEntry } from '@/types/expense'
import type { StrategyConfig } from '@/lib/calculations/types'

describe('Integration: Full calculation flow', () => {
  beforeEach(async () => {
    await db.accounts.clear()
    await db.income.clear()
    await db.expenses.clear()
    await db.flexiFacility.clear()
    await db.settings.clear()
  })

  describe('AC-4.8.1-12: Full flow from DB data to calculated results', () => {
    it('calculates strategies from database data end-to-end', async () => {
      // Step 1: Add data to database
      const now = new Date().toISOString()

      const account1Id = await db.accounts.add({
        name: 'Home Loan',
        type: 'home_loan',
        balance: '500000',
        interestRate: '0.115',
        minimumPayment: '5000',
        lender: 'FNB',
        interestType: 'monthly',
        createdAt: now,
        updatedAt: now,
      } as DebtAccount)

      const account2Id = await db.accounts.add({
        name: 'Car Finance',
        type: 'vehicle_finance',
        balance: '150000',
        interestRate: '0.135',
        minimumPayment: '3500',
        lender: 'Wesbank',
        interestType: 'monthly',
        createdAt: now,
        updatedAt: now,
      } as DebtAccount)

      await db.income.add({
        source: 'Salary',
        amount: '60000',
        paymentDate: 25,
        createdAt: now,
      } as IncomeEntry)

      await db.expenses.add({
        category: 'housing',
        amount: '5000',
        date: '2024-01-01',
        createdAt: now,
      } as ExpenseEntry)

      await db.expenses.add({
        category: 'food',
        amount: '8000',
        date: '2024-01-01',
        createdAt: now,
      } as ExpenseEntry)

      await db.flexiFacility.add({
        name: 'FNB Flexi',
        type: 'fnb_flexi',
        creditLimit: '200000',
        currentBalance: '50000',
        interestRate: '0.115',
        createdAt: now,
        updatedAt: now,
      } as FlexiFacility)

      // Step 2: Retrieve data from database
      const accounts = await db.accounts.toArray()
      const facility = await db.flexiFacility.toCollection().first()
      const incomeEntries = await db.income.toArray()
      const expenseEntries = await db.expenses.toArray()

      // Verify data was stored
      expect(accounts.length).toBe(2)
      expect(facility).toBeDefined()
      expect(incomeEntries.length).toBe(1)
      expect(expenseEntries.length).toBe(2)

      // Step 3: Build snapshot from database data
      const snapshot = buildFinancialSnapshot(accounts, facility ?? null, incomeEntries, expenseEntries)

      // Verify snapshot
      expect(snapshot.accounts.length).toBe(2)
      expect(snapshot.flexiFacility).not.toBeNull()
      expect(snapshot.monthlyIncome).toBe('60000')
      expect(snapshot.monthlyExpenses).toBe('13000') // 5000 + 8000

      // Expected surplus: 60000 - 13000 - (5000 + 3500) = 38500
      expect(snapshot.availableSurplus).toBe('38500')

      // Step 4: Calculate all strategies
      const result = calculateAllStrategies(snapshot)

      // Verify results
      expect(result.results.length).toBe(8) // All 8 strategies with flexi
      expect(result.baseline).not.toBeNull()
      expect(result.message).toBeNull()

      // Verify baseline
      expect(result.baseline?.strategyId).toBe('baseline')
      expect(result.baseline?.totalInterestPaid.toNumber()).toBeGreaterThan(0)
      expect(result.baseline?.debtFreeMonth).toBeGreaterThan(0)

      // Verify sorting (highest savings first)
      for (let i = 0; i < result.results.length - 1; i++) {
        const current = result.results[i].interestSaved.toNumber()
        const next = result.results[i + 1].interestSaved.toNumber()
        expect(current).toBeGreaterThanOrEqual(next)
      }

      // Verify baseline is last (zero savings)
      const lastResult = result.results[result.results.length - 1]
      expect(lastResult.strategyId).toBe('baseline')
    })

    it('config passed through correctly', async () => {
      const now = new Date().toISOString()

      await db.accounts.add({
        name: 'Test Loan',
        type: 'personal_loan',
        balance: '50000',
        interestRate: '0.15',
        minimumPayment: '1500',
        lender: 'Bank',
        interestType: 'monthly',
        createdAt: now,
        updatedAt: now,
      } as DebtAccount)

      await db.income.add({
        source: 'Salary',
        amount: '20000',
        paymentDate: 25,
        createdAt: now,
      } as IncomeEntry)

      await db.expenses.add({
        category: 'other',
        amount: '5000',
        date: '2024-01-01',
        createdAt: now,
      } as ExpenseEntry)

      const accounts = await db.accounts.toArray()
      const incomeEntries = await db.income.toArray()
      const expenseEntries = await db.expenses.toArray()

      const snapshot = buildFinancialSnapshot(accounts, null, incomeEntries, expenseEntries)

      // Calculate with config
      const config: StrategyConfig = {
        chunkAmount: '5000',
        paymentFrequency: 'monthly',
        targetAccountId: accounts[0].id,
      }

      const result = calculateAllStrategies(snapshot, config)

      // Should still calculate successfully
      expect(result.results.length).toBeGreaterThan(0)
      expect(result.baseline).not.toBeNull()
    })

    it('store updated with results pattern', async () => {
      // This tests the pattern: data -> snapshot -> engine -> results
      // The actual store integration is tested in useStrategies.test.ts

      const now = new Date().toISOString()

      await db.accounts.add({
        name: 'Credit Card',
        type: 'credit_card',
        balance: '25000',
        interestRate: '0.195',
        minimumPayment: '750',
        lender: 'Bank',
        interestType: 'daily',
        createdAt: now,
        updatedAt: now,
      } as DebtAccount)

      await db.income.add({
        source: 'Salary',
        amount: '15000',
        paymentDate: 25,
        createdAt: now,
      } as IncomeEntry)

      const accounts = await db.accounts.toArray()
      const incomeEntries = await db.income.toArray()

      const snapshot = buildFinancialSnapshot(accounts, null, incomeEntries, [])
      const result = calculateAllStrategies(snapshot)

      // Verify we can extract data suitable for store
      expect(result.results).toBeDefined()
      expect(result.baseline).toBeDefined()

      // Each result has the shape expected by the store
      for (const projection of result.results) {
        expect(projection.strategyId).toBeDefined()
        expect(projection.strategyName).toBeDefined()
        expect(projection.effortLevel).toBeDefined()
        expect(projection.debtFreeMonth).toBeDefined()
        expect(projection.debtFreeDate).toBeDefined()
        expect(projection.totalInterestPaid).toBeInstanceOf(Big)
        expect(projection.totalPrincipalPaid).toBeInstanceOf(Big)
        expect(typeof projection.monthsSaved).toBe('number')
        expect(projection.interestSaved).toBeInstanceOf(Big)
        expect(Array.isArray(projection.monthlyProjections)).toBe(true)
      }
    })
  })

  describe('Edge cases', () => {
    it('handles single account scenario', async () => {
      const now = new Date().toISOString()

      await db.accounts.add({
        name: 'Single Loan',
        type: 'personal_loan',
        balance: '30000',
        interestRate: '0.12',
        minimumPayment: '1000',
        lender: 'Bank',
        interestType: 'monthly',
        createdAt: now,
        updatedAt: now,
      } as DebtAccount)

      await db.income.add({
        source: 'Salary',
        amount: '10000',
        paymentDate: 25,
        createdAt: now,
      } as IncomeEntry)

      const accounts = await db.accounts.toArray()
      const incomeEntries = await db.income.toArray()

      const snapshot = buildFinancialSnapshot(accounts, null, incomeEntries, [])
      const result = calculateAllStrategies(snapshot)

      // Should still work with single account
      expect(result.results.length).toBe(3) // baseline, snowball, avalanche (no flexi)
      expect(result.baseline).not.toBeNull()
    })

    it('handles multiple accounts with different interest types', async () => {
      const now = new Date().toISOString()

      await db.accounts.add({
        name: 'Home Loan',
        type: 'home_loan',
        balance: '100000',
        interestRate: '0.10',
        minimumPayment: '1500',
        lender: 'Bank',
        interestType: 'monthly',
        createdAt: now,
        updatedAt: now,
      } as DebtAccount)

      await db.accounts.add({
        name: 'Credit Card',
        type: 'credit_card',
        balance: '10000',
        interestRate: '0.20',
        minimumPayment: '300',
        lender: 'Bank',
        interestType: 'daily',
        createdAt: now,
        updatedAt: now,
      } as DebtAccount)

      await db.income.add({
        source: 'Salary',
        amount: '20000',
        paymentDate: 25,
        createdAt: now,
      } as IncomeEntry)

      const accounts = await db.accounts.toArray()
      const incomeEntries = await db.income.toArray()

      const snapshot = buildFinancialSnapshot(accounts, null, incomeEntries, [])
      const result = calculateAllStrategies(snapshot)

      expect(result.results.length).toBe(3)
      expect(result.baseline).not.toBeNull()

      // Verify both accounts are in snapshot
      expect(snapshot.accounts.length).toBe(2)
      expect(snapshot.accounts.some((a) => a.interestType === 'monthly')).toBe(true)
      expect(snapshot.accounts.some((a) => a.interestType === 'daily')).toBe(true)
    })

    it('handles zero income scenario', async () => {
      const now = new Date().toISOString()

      await db.accounts.add({
        name: 'Test Loan',
        type: 'personal_loan',
        balance: '10000',
        interestRate: '0.15',
        minimumPayment: '500',
        lender: 'Bank',
        interestType: 'monthly',
        createdAt: now,
        updatedAt: now,
      } as DebtAccount)

      // No income added

      const accounts = await db.accounts.toArray()

      const snapshot = buildFinancialSnapshot(accounts, null, [], [])

      // Negative surplus (no income but has min payments)
      expect(snapshot.availableSurplus).toBe('-500')

      // Should still calculate (baseline can run even with negative surplus)
      const result = calculateAllStrategies(snapshot)
      expect(result.results.length).toBeGreaterThan(0)
    })
  })
})
