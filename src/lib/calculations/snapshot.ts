/**
 * Financial snapshot builder
 *
 * Creates a FinancialSnapshot from database entities for strategy calculations.
 * All calculations use big.js for precision (ADR-003).
 */
import Big from 'big.js'
import type { FinancialSnapshot } from './types'
import type { DebtAccount } from '@/types/account'
import type { FlexiFacility } from '@/types/flexi-facility'
import type { IncomeEntry } from '@/types/income'
import type { ExpenseEntry } from '@/types/expense'

/**
 * Build a FinancialSnapshot from database entities
 *
 * Calculates availableSurplus as: income - expenses - sum(minimumPayments)
 *
 * @param accounts - Array of debt accounts from database
 * @param flexiFacility - Flexi facility from database (or null)
 * @param incomeEntries - Array of income entries from database
 * @param expenseEntries - Array of expense entries from database
 * @returns FinancialSnapshot ready for strategy calculations
 */
export function buildFinancialSnapshot(
  accounts: DebtAccount[],
  flexiFacility: FlexiFacility | null,
  incomeEntries: IncomeEntry[],
  expenseEntries: ExpenseEntry[]
): FinancialSnapshot {
  // Sum income
  const monthlyIncome = incomeEntries.reduce(
    (sum, entry) => sum.plus(entry.amount),
    Big(0)
  )

  // Sum expenses
  const monthlyExpenses = expenseEntries.reduce(
    (sum, entry) => sum.plus(entry.amount),
    Big(0)
  )

  // Sum minimum payments
  const totalMinPayments = accounts.reduce(
    (sum, acct) => sum.plus(acct.minimumPayment),
    Big(0)
  )

  // Calculate surplus (can be negative if expenses exceed income)
  const availableSurplus = monthlyIncome.minus(monthlyExpenses).minus(totalMinPayments)

  return {
    accounts: accounts.map((a) => ({
      id: a.id!,
      balance: a.balance,
      interestRate: a.interestRate,
      minimumPayment: a.minimumPayment,
      interestType: a.interestType,
    })),
    flexiFacility: flexiFacility
      ? {
          currentBalance: flexiFacility.currentBalance,
          interestRate: flexiFacility.interestRate,
        }
      : null,
    monthlyIncome: monthlyIncome.toString(),
    monthlyExpenses: monthlyExpenses.toString(),
    availableSurplus: availableSurplus.toString(),
    snapshotDate: new Date().toISOString(),
  }
}
