import { describe, it, expect } from 'vitest'
import Big from 'big.js'
import { buildFinancialSnapshot } from '@/lib/calculations/snapshot'
import type { DebtAccount } from '@/types/account'
import type { FlexiFacility } from '@/types/flexi-facility'
import type { IncomeEntry } from '@/types/income'
import type { ExpenseEntry } from '@/types/expense'

describe('buildFinancialSnapshot', () => {
  const createTestAccounts = (): DebtAccount[] => [
    {
      id: 1,
      name: 'Home Loan',
      type: 'home_loan',
      balance: '500000',
      interestRate: '0.115',
      minimumPayment: '5000',
      lender: 'FNB',
      interestType: 'monthly',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Car Finance',
      type: 'vehicle_finance',
      balance: '150000',
      interestRate: '0.12',
      minimumPayment: '3000',
      lender: 'Wesbank',
      interestType: 'monthly',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ]

  const createTestFlexiFacility = (): FlexiFacility => ({
    id: 1,
    name: 'FNB Flexi',
    type: 'fnb_flexi',
    creditLimit: '200000',
    currentBalance: '50000',
    interestRate: '0.115',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  })

  const createTestIncome = (): IncomeEntry[] => [
    {
      id: 1,
      source: 'Salary',
      amount: '50000',
      paymentDate: 25,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      source: 'Rental Income',
      amount: '8000',
      paymentDate: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ]

  const createTestExpenses = (): ExpenseEntry[] => [
    {
      id: 1,
      category: 'food',
      amount: '5000',
      date: '2024-01-01',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      category: 'utilities',
      amount: '2000',
      date: '2024-01-01',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 3,
      category: 'transport',
      amount: '3000',
      date: '2024-01-01',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ]

  describe('AC-4.8.1: Snapshot built correctly from data', () => {
    it('builds snapshot with correct account data', () => {
      const accounts = createTestAccounts()
      const snapshot = buildFinancialSnapshot(accounts, null, [], [])

      expect(snapshot.accounts.length).toBe(2)

      // First account
      expect(snapshot.accounts[0].id).toBe(1)
      expect(snapshot.accounts[0].balance).toBe('500000')
      expect(snapshot.accounts[0].interestRate).toBe('0.115')
      expect(snapshot.accounts[0].minimumPayment).toBe('5000')
      expect(snapshot.accounts[0].interestType).toBe('monthly')

      // Second account
      expect(snapshot.accounts[1].id).toBe(2)
      expect(snapshot.accounts[1].balance).toBe('150000')
      expect(snapshot.accounts[1].interestRate).toBe('0.12')
      expect(snapshot.accounts[1].minimumPayment).toBe('3000')
      expect(snapshot.accounts[1].interestType).toBe('monthly')
    })

    it('builds snapshot with flexi facility when provided', () => {
      const accounts = createTestAccounts()
      const flexi = createTestFlexiFacility()
      const snapshot = buildFinancialSnapshot(accounts, flexi, [], [])

      expect(snapshot.flexiFacility).not.toBeNull()
      expect(snapshot.flexiFacility?.currentBalance).toBe('50000')
      expect(snapshot.flexiFacility?.interestRate).toBe('0.115')
    })

    it('builds snapshot with null flexi when not provided', () => {
      const accounts = createTestAccounts()
      const snapshot = buildFinancialSnapshot(accounts, null, [], [])

      expect(snapshot.flexiFacility).toBeNull()
    })

    it('builds snapshot with snapshotDate as ISO string', () => {
      const accounts = createTestAccounts()
      const snapshot = buildFinancialSnapshot(accounts, null, [], [])

      expect(snapshot.snapshotDate).toBeDefined()
      expect(typeof snapshot.snapshotDate).toBe('string')
      // Should be valid ISO date string
      expect(new Date(snapshot.snapshotDate).toISOString()).toBe(snapshot.snapshotDate)
    })
  })

  describe('AC-4.8.1: Calculate availableSurplus correctly', () => {
    it('calculates availableSurplus = income - expenses - minPayments', () => {
      const accounts = createTestAccounts() // minPayments: 5000 + 3000 = 8000
      const income = createTestIncome() // total: 50000 + 8000 = 58000
      const expenses = createTestExpenses() // total: 5000 + 2000 + 3000 = 10000

      // Expected: 58000 - 10000 - 8000 = 40000
      const snapshot = buildFinancialSnapshot(accounts, null, income, expenses)

      expect(snapshot.monthlyIncome).toBe('58000')
      expect(snapshot.monthlyExpenses).toBe('10000')
      expect(snapshot.availableSurplus).toBe('40000')
    })

    it('calculates negative surplus when expenses exceed income', () => {
      const accounts: DebtAccount[] = [
        {
          id: 1,
          name: 'Home Loan',
          type: 'home_loan',
          balance: '500000',
          interestRate: '0.115',
          minimumPayment: '30000', // High minimum payment
          lender: 'FNB',
          interestType: 'monthly',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]

      const income: IncomeEntry[] = [
        { id: 1, source: 'Salary', amount: '20000', paymentDate: 25, createdAt: '2024-01-01T00:00:00.000Z' },
      ]

      const expenses: ExpenseEntry[] = [
        { id: 1, category: 'food', amount: '5000', date: '2024-01-01', createdAt: '2024-01-01T00:00:00.000Z' },
      ]

      // Expected: 20000 - 5000 - 30000 = -15000
      const snapshot = buildFinancialSnapshot(accounts, null, income, expenses)

      expect(snapshot.availableSurplus).toBe('-15000')
    })

    it('handles empty income and expenses', () => {
      const accounts = createTestAccounts() // minPayments: 8000

      // Expected: 0 - 0 - 8000 = -8000
      const snapshot = buildFinancialSnapshot(accounts, null, [], [])

      expect(snapshot.monthlyIncome).toBe('0')
      expect(snapshot.monthlyExpenses).toBe('0')
      expect(snapshot.availableSurplus).toBe('-8000')
    })

    it('handles empty accounts', () => {
      const income = createTestIncome() // 58000
      const expenses = createTestExpenses() // 10000

      // Expected: 58000 - 10000 - 0 = 48000
      const snapshot = buildFinancialSnapshot([], null, income, expenses)

      expect(snapshot.accounts.length).toBe(0)
      expect(snapshot.availableSurplus).toBe('48000')
    })
  })

  describe('Uses big.js for precision (ADR-003)', () => {
    it('handles decimal values precisely', () => {
      const accounts: DebtAccount[] = [
        {
          id: 1,
          name: 'Card',
          type: 'credit_card',
          balance: '1234.56',
          interestRate: '0.195',
          minimumPayment: '123.45',
          lender: 'Bank',
          interestType: 'daily',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]

      const income: IncomeEntry[] = [
        { id: 1, source: 'Salary', amount: '1000.50', paymentDate: 25, createdAt: '2024-01-01T00:00:00.000Z' },
      ]

      const expenses: ExpenseEntry[] = [
        { id: 1, category: 'food', amount: '500.25', date: '2024-01-01', createdAt: '2024-01-01T00:00:00.000Z' },
      ]

      // Expected: 1000.50 - 500.25 - 123.45 = 376.80
      const snapshot = buildFinancialSnapshot(accounts, null, income, expenses)

      expect(snapshot.monthlyIncome).toBe('1000.5')
      expect(snapshot.monthlyExpenses).toBe('500.25')
      expect(snapshot.availableSurplus).toBe('376.8')
    })

    it('handles very large numbers precisely', () => {
      const accounts: DebtAccount[] = [
        {
          id: 1,
          name: 'Big Loan',
          type: 'home_loan',
          balance: '9999999999.99',
          interestRate: '0.115',
          minimumPayment: '100000.00',
          lender: 'Bank',
          interestType: 'monthly',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ]

      const income: IncomeEntry[] = [
        { id: 1, source: 'Salary', amount: '500000.00', paymentDate: 25, createdAt: '2024-01-01T00:00:00.000Z' },
      ]

      const expenses: ExpenseEntry[] = [
        { id: 1, category: 'other', amount: '200000.00', date: '2024-01-01', createdAt: '2024-01-01T00:00:00.000Z' },
      ]

      // Expected: 500000 - 200000 - 100000 = 200000
      const snapshot = buildFinancialSnapshot(accounts, null, income, expenses)

      expect(snapshot.monthlyIncome).toBe('500000')
      expect(snapshot.monthlyExpenses).toBe('200000')
      expect(snapshot.availableSurplus).toBe('200000')
    })
  })
})
