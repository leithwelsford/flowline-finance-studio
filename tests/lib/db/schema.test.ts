import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Dexie from 'dexie';
import { FlowlineDB, DB_NAME } from '@/lib/db/schema';
import type { DebtAccount, FlexiFacility, IncomeEntry, ExpenseEntry, BalanceSnapshot, AppSettings } from '@/types';

describe('FlowlineDB', () => {
  let db: FlowlineDB;
  let testDbName: string;

  beforeEach(async () => {
    // Create a unique database name for each test to prevent conflicts
    testDbName = `test-db-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    db = new FlowlineDB(testDbName);
    await db.open();
  });

  afterEach(async () => {
    // Close and delete after each test
    await db.close();
    await Dexie.delete(testDbName);
  });

  describe('Database instance', () => {
    it('should be an instance of FlowlineDB', () => {
      expect(db).toBeInstanceOf(FlowlineDB);
    });

    it('should have correct database name', () => {
      // Test db uses dynamic name, production uses DB_NAME constant
      expect(db.name).toBe(testDbName);
      expect(DB_NAME).toBe('flowline-finance-studio');
    });

    it('should have all required tables', () => {
      expect(db.accounts).toBeDefined();
      expect(db.flexiFacility).toBeDefined();
      expect(db.income).toBeDefined();
      expect(db.expenses).toBeDefined();
      expect(db.balanceSnapshots).toBeDefined();
      expect(db.settings).toBeDefined();
    });
  });

  describe('accounts table CRUD', () => {
    const testAccount: Omit<DebtAccount, 'id'> = {
      name: 'Home Loan',
      type: 'home_loan',
      balance: '500000.00',
      interestRate: '0.115',
      minimumPayment: '5000.00',
      lender: 'Standard Bank',
      interestType: 'monthly',
      createdAt: '2025-11-28T00:00:00.000Z',
      updatedAt: '2025-11-28T00:00:00.000Z',
    };

    it('should add an account and return id', async () => {
      const id = await db.accounts.add(testAccount);
      expect(id).toBeDefined();
      expect(typeof id).toBe('number');
    });

    it('should get an account by id', async () => {
      const id = await db.accounts.add(testAccount);
      const account = await db.accounts.get(id);

      expect(account).toBeDefined();
      expect(account?.name).toBe('Home Loan');
      expect(account?.type).toBe('home_loan');
      expect(account?.balance).toBe('500000.00');
    });

    it('should update an account', async () => {
      const id = await db.accounts.add(testAccount);

      await db.accounts.update(id, {
        balance: '490000.00',
        updatedAt: '2025-11-29T00:00:00.000Z',
      });

      const account = await db.accounts.get(id);
      expect(account?.balance).toBe('490000.00');
      expect(account?.updatedAt).toBe('2025-11-29T00:00:00.000Z');
    });

    it('should delete an account', async () => {
      const id = await db.accounts.add(testAccount);
      await db.accounts.delete(id);

      const account = await db.accounts.get(id);
      expect(account).toBeUndefined();
    });

    it('should list all accounts', async () => {
      const id1 = await db.accounts.add(testAccount);
      expect(id1).toBe(1);

      const id2 = await db.accounts.add({
        name: 'Vehicle Finance',
        type: 'vehicle_finance',
        balance: '250000.00',
        interestRate: '0.12',
        minimumPayment: '4500.00',
        lender: 'FNB',
        interestType: 'monthly',
        createdAt: '2025-11-28T01:00:00.000Z',
        updatedAt: '2025-11-28T01:00:00.000Z',
      });
      expect(id2).toBe(2);

      const accounts = await db.accounts.toArray();
      expect(accounts).toHaveLength(2);
    });

    it('should query accounts by type', async () => {
      await db.accounts.add(testAccount);

      await db.accounts.add({
        name: 'Vehicle Finance',
        type: 'vehicle_finance',
        balance: '250000.00',
        interestRate: '0.12',
        minimumPayment: '4500.00',
        lender: 'FNB',
        interestType: 'monthly',
        createdAt: '2025-11-28T01:00:00.000Z',
        updatedAt: '2025-11-28T01:00:00.000Z',
      });

      const homeLoans = await db.accounts.where('type').equals('home_loan').toArray();
      expect(homeLoans).toHaveLength(1);
      expect(homeLoans[0].name).toBe('Home Loan');
    });
  });

  describe('flexiFacility table', () => {
    const testFacility: Omit<FlexiFacility, 'id'> = {
      name: 'FNB Flexi',
      type: 'fnb_flexi',
      creditLimit: '100000.00',
      currentBalance: '50000.00',
      interestRate: '0.115',
      createdAt: '2025-11-28T00:00:00.000Z',
      updatedAt: '2025-11-28T00:00:00.000Z',
    };

    it('should add and retrieve a flexi facility', async () => {
      const id = await db.flexiFacility.add(testFacility);
      const facility = await db.flexiFacility.get(id);

      expect(facility).toBeDefined();
      expect(facility?.name).toBe('FNB Flexi');
      expect(facility?.creditLimit).toBe('100000.00');
    });
  });

  describe('income table', () => {
    const testIncome: Omit<IncomeEntry, 'id'> = {
      source: 'Salary',
      amount: '45000.00',
      paymentDate: 25,
      createdAt: '2025-11-28T00:00:00.000Z',
    };

    it('should add and retrieve income', async () => {
      const id = await db.income.add(testIncome);
      const income = await db.income.get(id);

      expect(income).toBeDefined();
      expect(income?.source).toBe('Salary');
      expect(income?.amount).toBe('45000.00');
    });

    it('should query income by source', async () => {
      await db.income.add(testIncome);
      await db.income.add({
        source: 'Rental Income',
        amount: '8000.00',
        paymentDate: 1,
        createdAt: '2025-11-28T00:00:00.000Z',
      });

      const salaryIncome = await db.income.where('source').equals('Salary').toArray();
      expect(salaryIncome).toHaveLength(1);
    });
  });

  describe('expenses table', () => {
    const testExpense: Omit<ExpenseEntry, 'id'> = {
      category: 'housing',
      amount: '5000.00',
      date: '2025-11-28T00:00:00.000Z',
      createdAt: '2025-11-28T00:00:00.000Z',
    };

    it('should add and retrieve an expense', async () => {
      const id = await db.expenses.add(testExpense);
      const expense = await db.expenses.get(id);

      expect(expense).toBeDefined();
      expect(expense?.category).toBe('housing');
      expect(expense?.amount).toBe('5000.00');
    });

    it('should query expenses by category', async () => {
      await db.expenses.add(testExpense);
      await db.expenses.add({
        category: 'transport',
        amount: '3000.00',
        date: '2025-11-28T00:00:00.000Z',
        createdAt: '2025-11-28T00:00:00.000Z',
      });

      const housingExpenses = await db.expenses.where('category').equals('housing').toArray();
      expect(housingExpenses).toHaveLength(1);
    });
  });

  describe('balanceSnapshots table', () => {
    it('should add and retrieve a balance snapshot', async () => {
      // First add an account
      const accountId = await db.accounts.add({
        name: 'Home Loan',
        type: 'home_loan',
        balance: '500000.00',
        interestRate: '0.115',
        minimumPayment: '5000.00',
        lender: 'Standard Bank',
        interestType: 'monthly',
        createdAt: '2025-11-28T00:00:00.000Z',
        updatedAt: '2025-11-28T00:00:00.000Z',
      });

      const snapshot: Omit<BalanceSnapshot, 'id'> = {
        accountId,
        date: '2025-11-28T00:00:00.000Z',
        balance: '495000.00',
        notes: 'Monthly snapshot',
        createdAt: '2025-11-28T00:00:00.000Z',
      };

      const id = await db.balanceSnapshots.add(snapshot);
      const retrieved = await db.balanceSnapshots.get(id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.accountId).toBe(accountId);
      expect(retrieved?.balance).toBe('495000.00');
    });

    it('should query snapshots by accountId', async () => {
      const accountId = await db.accounts.add({
        name: 'Home Loan',
        type: 'home_loan',
        balance: '500000.00',
        interestRate: '0.115',
        minimumPayment: '5000.00',
        lender: 'Standard Bank',
        interestType: 'monthly',
        createdAt: '2025-11-28T00:00:00.000Z',
        updatedAt: '2025-11-28T00:00:00.000Z',
      });

      await db.balanceSnapshots.add({
        accountId,
        date: '2025-11-28T00:00:00.000Z',
        balance: '495000.00',
        createdAt: '2025-11-28T00:00:00.000Z',
      });

      await db.balanceSnapshots.add({
        accountId,
        date: '2025-12-28T00:00:00.000Z',
        balance: '490000.00',
        createdAt: '2025-12-28T00:00:00.000Z',
      });

      const snapshots = await db.balanceSnapshots.where('accountId').equals(accountId).toArray();
      expect(snapshots).toHaveLength(2);
    });
  });

  describe('settings table', () => {
    it('should add and retrieve a setting by key', async () => {
      const setting: AppSettings = {
        key: 'theme',
        value: 'dark',
      };

      await db.settings.add(setting);
      const retrieved = await db.settings.get('theme');

      expect(retrieved).toBeDefined();
      expect(retrieved?.key).toBe('theme');
      expect(retrieved?.value).toBe('dark');
    });

    it('should update a setting', async () => {
      await db.settings.add({ key: 'theme', value: 'light' });
      await db.settings.update('theme', { value: 'dark' });

      const setting = await db.settings.get('theme');
      expect(setting?.value).toBe('dark');
    });
  });

  describe('Monetary value precision', () => {
    it('should store monetary values as strings without precision loss', async () => {
      const largeBalance = '1234567890.99';
      const id = await db.accounts.add({
        name: 'Large Account',
        type: 'home_loan',
        balance: largeBalance,
        interestRate: '0.115',
        minimumPayment: '5000.00',
        lender: 'Test Bank',
        interestType: 'monthly',
        createdAt: '2025-11-28T00:00:00.000Z',
        updatedAt: '2025-11-28T00:00:00.000Z',
      });

      const account = await db.accounts.get(id);
      expect(account?.balance).toBe(largeBalance);
    });

    it('should store interest rates as decimal strings', async () => {
      const interestRate = '0.1175'; // 11.75%
      const id = await db.accounts.add({
        name: 'Test Account',
        type: 'home_loan',
        balance: '500000.00',
        interestRate,
        minimumPayment: '5000.00',
        lender: 'Test Bank',
        interestType: 'monthly',
        createdAt: '2025-11-28T00:00:00.000Z',
        updatedAt: '2025-11-28T00:00:00.000Z',
      });

      const account = await db.accounts.get(id);
      expect(account?.interestRate).toBe(interestRate);
    });
  });

  describe('Date storage as ISO strings', () => {
    it('should store and retrieve dates as ISO strings', async () => {
      const isoDate = '2025-11-28T12:30:45.123Z';
      const id = await db.accounts.add({
        name: 'Test Account',
        type: 'home_loan',
        balance: '500000.00',
        interestRate: '0.115',
        minimumPayment: '5000.00',
        lender: 'Test Bank',
        interestType: 'monthly',
        createdAt: isoDate,
        updatedAt: isoDate,
      });

      const account = await db.accounts.get(id);
      expect(account?.createdAt).toBe(isoDate);
      expect(account?.updatedAt).toBe(isoDate);

      // Verify it can be parsed back to a Date
      const parsedDate = new Date(account!.createdAt);
      expect(parsedDate.toISOString()).toBe(isoDate);
    });
  });
});
