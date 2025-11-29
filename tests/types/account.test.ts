import { describe, it, expect } from 'vitest';
import type {
  DebtAccount,
  AccountType,
  InterestType,
  FlexiFacility,
  FlexiFacilityType,
  IncomeEntry,
  ExpenseEntry,
  ExpenseCategory,
  BalanceSnapshot,
  AppSettings,
} from '@/types';

describe('Type Definitions', () => {
  describe('DebtAccount', () => {
    it('should create a valid DebtAccount object', () => {
      const account: DebtAccount = {
        id: 1,
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

      expect(account.name).toBe('Home Loan');
      expect(account.type).toBe('home_loan');
      expect(account.balance).toBe('500000.00');
      expect(account.interestRate).toBe('0.115');
    });

    it('should allow optional id for new records', () => {
      const account: DebtAccount = {
        name: 'Vehicle Finance',
        type: 'vehicle_finance',
        balance: '250000.00',
        interestRate: '0.12',
        minimumPayment: '4500.00',
        lender: 'FNB',
        interestType: 'monthly',
        createdAt: '2025-11-28T00:00:00.000Z',
        updatedAt: '2025-11-28T00:00:00.000Z',
      };

      expect(account.id).toBeUndefined();
    });
  });

  describe('AccountType union', () => {
    it('should accept all valid account types', () => {
      const types: AccountType[] = [
        'home_loan',
        'vehicle_finance',
        'personal_loan',
        'credit_card',
      ];

      expect(types).toHaveLength(4);
      expect(types).toContain('home_loan');
      expect(types).toContain('vehicle_finance');
      expect(types).toContain('personal_loan');
      expect(types).toContain('credit_card');
    });
  });

  describe('InterestType union', () => {
    it('should accept monthly and daily interest types', () => {
      const types: InterestType[] = ['monthly', 'daily'];

      expect(types).toHaveLength(2);
      expect(types).toContain('monthly');
      expect(types).toContain('daily');
    });
  });

  describe('FlexiFacility', () => {
    it('should create a valid FlexiFacility object', () => {
      const facility: FlexiFacility = {
        id: 1,
        name: 'FNB Flexi',
        type: 'fnb_flexi',
        creditLimit: '100000.00',
        currentBalance: '50000.00',
        interestRate: '0.115',
        createdAt: '2025-11-28T00:00:00.000Z',
        updatedAt: '2025-11-28T00:00:00.000Z',
      };

      expect(facility.name).toBe('FNB Flexi');
      expect(facility.type).toBe('fnb_flexi');
      expect(facility.creditLimit).toBe('100000.00');
    });
  });

  describe('FlexiFacilityType union', () => {
    it('should accept all valid flexi facility types', () => {
      const types: FlexiFacilityType[] = ['fnb_flexi', 'standard_bank_access'];

      expect(types).toHaveLength(2);
      expect(types).toContain('fnb_flexi');
      expect(types).toContain('standard_bank_access');
    });
  });

  describe('IncomeEntry', () => {
    it('should create a valid IncomeEntry object', () => {
      const income: IncomeEntry = {
        id: 1,
        source: 'Salary',
        amount: '45000.00',
        paymentDate: 25,
        createdAt: '2025-11-28T00:00:00.000Z',
      };

      expect(income.source).toBe('Salary');
      expect(income.amount).toBe('45000.00');
      expect(income.paymentDate).toBe(25);
    });
  });

  describe('ExpenseEntry', () => {
    it('should create a valid ExpenseEntry object', () => {
      const expense: ExpenseEntry = {
        id: 1,
        category: 'housing',
        amount: '5000.00',
        date: '2025-11-28T00:00:00.000Z',
        createdAt: '2025-11-28T00:00:00.000Z',
      };

      expect(expense.category).toBe('housing');
      expect(expense.amount).toBe('5000.00');
    });
  });

  describe('ExpenseCategory union', () => {
    it('should accept all valid expense categories', () => {
      const categories: ExpenseCategory[] = [
        'housing',
        'transport',
        'food',
        'utilities',
        'insurance',
        'entertainment',
        'other',
      ];

      expect(categories).toHaveLength(7);
      expect(categories).toContain('housing');
      expect(categories).toContain('transport');
      expect(categories).toContain('food');
      expect(categories).toContain('utilities');
      expect(categories).toContain('insurance');
      expect(categories).toContain('entertainment');
      expect(categories).toContain('other');
    });
  });

  describe('BalanceSnapshot', () => {
    it('should create a valid BalanceSnapshot object', () => {
      const snapshot: BalanceSnapshot = {
        id: 1,
        accountId: 1,
        date: '2025-11-28T00:00:00.000Z',
        balance: '495000.00',
        notes: 'Monthly snapshot',
        createdAt: '2025-11-28T00:00:00.000Z',
      };

      expect(snapshot.accountId).toBe(1);
      expect(snapshot.balance).toBe('495000.00');
      expect(snapshot.notes).toBe('Monthly snapshot');
    });

    it('should allow optional notes', () => {
      const snapshot: BalanceSnapshot = {
        accountId: 1,
        date: '2025-11-28T00:00:00.000Z',
        balance: '495000.00',
        createdAt: '2025-11-28T00:00:00.000Z',
      };

      expect(snapshot.notes).toBeUndefined();
    });
  });

  describe('AppSettings', () => {
    it('should create a valid AppSettings object', () => {
      const setting: AppSettings = {
        key: 'theme',
        value: 'dark',
      };

      expect(setting.key).toBe('theme');
      expect(setting.value).toBe('dark');
    });
  });

  describe('Monetary values as strings', () => {
    it('should store balance as string for precision', () => {
      const account: DebtAccount = {
        name: 'Test Account',
        type: 'home_loan',
        balance: '500000.00',
        interestRate: '0.115',
        minimumPayment: '5000.00',
        lender: 'Test Bank',
        interestType: 'monthly',
        createdAt: '2025-11-28T00:00:00.000Z',
        updatedAt: '2025-11-28T00:00:00.000Z',
      };

      // Verify balance is string type
      expect(typeof account.balance).toBe('string');
      expect(typeof account.interestRate).toBe('string');
      expect(typeof account.minimumPayment).toBe('string');

      // Verify precision is preserved
      expect(account.balance).toBe('500000.00');
    });
  });

  describe('Dates as ISO strings', () => {
    it('should store dates as ISO strings', () => {
      const isoDate = '2025-11-28T00:00:00.000Z';
      const account: DebtAccount = {
        name: 'Test Account',
        type: 'home_loan',
        balance: '500000.00',
        interestRate: '0.115',
        minimumPayment: '5000.00',
        lender: 'Test Bank',
        interestType: 'monthly',
        createdAt: isoDate,
        updatedAt: isoDate,
      };

      // Verify dates are string type
      expect(typeof account.createdAt).toBe('string');
      expect(typeof account.updatedAt).toBe('string');

      // Verify ISO format is preserved
      expect(account.createdAt).toBe(isoDate);
      expect(new Date(account.createdAt).toISOString()).toBe(isoDate);
    });
  });
});
