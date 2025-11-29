import Dexie, { type Table } from 'dexie';
import type {
  DebtAccount,
  FlexiFacility,
  IncomeEntry,
  ExpenseEntry,
  BalanceSnapshot,
  AppSettings,
} from '@/types';

/** Default database name for production use */
export const DB_NAME = 'flowline-finance-studio';

/**
 * FlowlineDB - IndexedDB database for Flowline Finance Studio
 *
 * Uses Dexie.js as IndexedDB wrapper for structured queries,
 * async operations, and React hooks integration.
 *
 * Schema version: 1
 */
export class FlowlineDB extends Dexie {
  /** Debt accounts table (home loans, vehicle finance, personal loans, credit cards) */
  accounts!: Table<DebtAccount, number>;

  /** Flexi facility table (FNB Flexi, Standard Bank Access Bond) */
  flexiFacility!: Table<FlexiFacility, number>;

  /** Income entries table */
  income!: Table<IncomeEntry, number>;

  /** Expense entries table */
  expenses!: Table<ExpenseEntry, number>;

  /** Balance snapshots for progress tracking */
  balanceSnapshots!: Table<BalanceSnapshot, number>;

  /** Application settings (key-value store) */
  settings!: Table<AppSettings, string>;

  constructor(dbName: string = DB_NAME) {
    super(dbName);

    this.version(1).stores({
      // Accounts: auto-increment id, indexed by name, type, createdAt
      accounts: '++id, name, type, createdAt',

      // Flexi facility: auto-increment id, indexed by name, createdAt
      flexiFacility: '++id, name, createdAt',

      // Income: auto-increment id, indexed by source, date
      // Note: 'date' here refers to paymentDate for querying by pay day
      income: '++id, source, date',

      // Expenses: auto-increment id, indexed by category, date
      expenses: '++id, category, date',

      // Balance snapshots: auto-increment id, indexed by accountId, date
      balanceSnapshots: '++id, accountId, date',

      // Settings: key is primary key (not auto-increment)
      settings: 'key',
    });
  }
}
