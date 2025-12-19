/**
 * Database seed script for testing
 * Creates a complex South African financial scenario
 */

import { db } from './index';
import type { DebtAccount, FlexiFacility, IncomeEntry, ExpenseEntry } from '@/types';
import { STRATEGY_CONFIG_KEY, DEFAULT_STRATEGY_CONFIG } from '@/types/strategy-config';

const now = new Date().toISOString();

/**
 * Complex SA scenario:
 * - Professional earning R85,000/month with side income
 * - Home loan, vehicle finance, personal loan, credit card
 * - FNB Flexi facility available
 * - Realistic expense breakdown
 * - Approximately R15,000 surplus for debt acceleration
 */
export async function seedDatabase(): Promise<void> {
  // Clear existing data
  await db.accounts.clear();
  await db.flexiFacility.clear();
  await db.income.clear();
  await db.expenses.clear();
  await db.balanceSnapshots.clear();

  // === DEBT ACCOUNTS ===
  const accounts: Omit<DebtAccount, 'id'>[] = [
    {
      name: 'Home Loan - ABSA',
      type: 'home_loan',
      balance: '1850000.00',
      interestRate: '0.1175', // 11.75%
      minimumPayment: '19500.00',
      lender: 'ABSA Bank',
      interestType: 'monthly',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'BMW X3 Finance',
      type: 'vehicle_finance',
      balance: '420000.00',
      interestRate: '0.1325', // 13.25%
      minimumPayment: '9800.00',
      lender: 'BMW Financial Services',
      interestType: 'monthly',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Personal Loan - Nedbank',
      type: 'personal_loan',
      balance: '85000.00',
      interestRate: '0.1850', // 18.5%
      minimumPayment: '3200.00',
      lender: 'Nedbank',
      interestType: 'monthly',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'FNB Credit Card',
      type: 'credit_card',
      balance: '45000.00',
      interestRate: '0.2150', // 21.5%
      minimumPayment: '1800.00',
      lender: 'FNB',
      interestType: 'daily',
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.accounts.bulkAdd(accounts);

  // === FLEXI FACILITY ===
  const flexiFacility: Omit<FlexiFacility, 'id'> = {
    name: 'FNB Flexi Reserve',
    type: 'fnb_flexi',
    creditLimit: '150000.00',
    currentBalance: '25000.00', // R25k currently used
    interestRate: '0.1175', // Same as home loan rate
    createdAt: now,
    updatedAt: now,
  };

  await db.flexiFacility.add(flexiFacility);

  // === INCOME ===
  const income: Omit<IncomeEntry, 'id'>[] = [
    {
      source: 'Salary - Tech Company',
      amount: '85000.00',
      paymentDate: 25,
      createdAt: now,
    },
    {
      source: 'Rental Income',
      amount: '8500.00',
      paymentDate: 1,
      createdAt: now,
    },
    {
      source: 'Side Consulting',
      amount: '6000.00',
      paymentDate: 15,
      createdAt: now,
    },
  ];

  await db.income.bulkAdd(income);

  // === EXPENSES ===
  const expenses: Omit<ExpenseEntry, 'id'>[] = [
    {
      category: 'housing',
      amount: '5500.00',
      description: 'Rates, levies, insurance',
      date: now,
      createdAt: now,
    },
    {
      category: 'transport',
      amount: '4500.00',
      description: 'Fuel, maintenance, tolls',
      date: now,
      createdAt: now,
    },
    {
      category: 'food',
      amount: '8000.00',
      description: 'Groceries and dining',
      date: now,
      createdAt: now,
    },
    {
      category: 'utilities',
      amount: '3500.00',
      description: 'Electricity, water, internet, phone',
      date: now,
      createdAt: now,
    },
    {
      category: 'insurance',
      amount: '4200.00',
      description: 'Medical aid, life insurance, short-term',
      date: now,
      createdAt: now,
    },
    {
      category: 'entertainment',
      amount: '3000.00',
      description: 'Streaming, gym, hobbies',
      date: now,
      createdAt: now,
    },
    {
      category: 'other',
      amount: '6000.00',
      description: 'Savings, investments, misc',
      date: now,
      createdAt: now,
    },
  ];

  await db.expenses.bulkAdd(expenses);

  // === STRATEGY CONFIG ===
  await db.settings.put({
    key: STRATEGY_CONFIG_KEY,
    value: JSON.stringify(DEFAULT_STRATEGY_CONFIG),
  });

  console.log('[SEED] Database populated with complex SA scenario');
  console.log('[SEED] Total debt: R2,400,000');
  console.log('[SEED] Monthly income: R99,500');
  console.log('[SEED] Monthly expenses: R34,700 (excluding debt payments)');
  console.log('[SEED] Debt payments: R34,300');
  console.log('[SEED] Available surplus: ~R30,500');
  console.log('[SEED] Flexi facility: R150,000 limit, R25,000 used');
}

/**
 * Clear all database data
 */
export async function clearDatabase(): Promise<void> {
  await db.accounts.clear();
  await db.flexiFacility.clear();
  await db.income.clear();
  await db.expenses.clear();
  await db.balanceSnapshots.clear();
  await db.settings.clear();
  console.log('[SEED] Database cleared');
}

// Export for browser console access
if (typeof window !== 'undefined') {
  (window as unknown as { seedDatabase: typeof seedDatabase }).seedDatabase = seedDatabase;
  (window as unknown as { clearDatabase: typeof clearDatabase }).clearDatabase = clearDatabase;
}
