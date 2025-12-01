import { describe, it, expect } from 'vitest';
import {
  accountFormSchema,
  accountTypeSchema,
  interestTypeSchema,
  formValuesToAccount,
  accountToFormValues,
} from '@/lib/validation/account';

describe('accountTypeSchema', () => {
  it('accepts valid account types', () => {
    expect(accountTypeSchema.parse('home_loan')).toBe('home_loan');
    expect(accountTypeSchema.parse('vehicle_finance')).toBe('vehicle_finance');
    expect(accountTypeSchema.parse('personal_loan')).toBe('personal_loan');
    expect(accountTypeSchema.parse('credit_card')).toBe('credit_card');
  });

  it('rejects invalid account types', () => {
    expect(() => accountTypeSchema.parse('invalid')).toThrow();
    expect(() => accountTypeSchema.parse('')).toThrow();
  });
});

describe('interestTypeSchema', () => {
  it('accepts valid interest types', () => {
    expect(interestTypeSchema.parse('monthly')).toBe('monthly');
    expect(interestTypeSchema.parse('daily')).toBe('daily');
  });

  it('rejects invalid interest types', () => {
    expect(() => interestTypeSchema.parse('weekly')).toThrow();
  });
});

describe('accountFormSchema', () => {
  const validData = {
    name: 'Home Loan',
    type: 'home_loan' as const,
    balance: '500000',
    interestRate: '11.5',
    minimumPayment: '5000',
    lender: 'ABSA',
    interestType: 'monthly' as const,
  };

  it('validates complete valid data', () => {
    const result = accountFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Home Loan');
      expect(result.data.type).toBe('home_loan');
      expect(result.data.balance).toBe('500000');
      expect(result.data.interestRate).toBe('11.5');
      expect(result.data.minimumPayment).toBe('5000');
      expect(result.data.lender).toBe('ABSA');
    }
  });

  it('allows empty lender string', () => {
    const data = { ...validData, lender: '' };
    const result = accountFormSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.lender).toBe('');
    }
  });

  it('requires interestType', () => {
    const data = { ...validData, interestType: undefined };
    const result = accountFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  describe('name validation', () => {
    it('requires name', () => {
      const data = { ...validData, name: '' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Account name is required');
      }
    });

    it('rejects name over 100 characters', () => {
      const data = { ...validData, name: 'a'.repeat(101) };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('balance validation', () => {
    it('requires balance', () => {
      const data = { ...validData, balance: '' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts zero balance', () => {
      const data = { ...validData, balance: '0' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts decimal balance', () => {
      const data = { ...validData, balance: '123456.78' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects negative balance', () => {
      const data = { ...validData, balance: '-100' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects non-numeric balance', () => {
      const data = { ...validData, balance: 'abc' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('interestRate validation', () => {
    it('requires interest rate', () => {
      const data = { ...validData, interestRate: '' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts 0% rate', () => {
      const data = { ...validData, interestRate: '0' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts 100% rate', () => {
      const data = { ...validData, interestRate: '100' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts decimal rate', () => {
      const data = { ...validData, interestRate: '11.75' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects rate over 100%', () => {
      const data = { ...validData, interestRate: '101' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects negative rate', () => {
      const data = { ...validData, interestRate: '-5' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('minimumPayment validation', () => {
    it('requires minimum payment', () => {
      const data = { ...validData, minimumPayment: '' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts zero minimum payment', () => {
      const data = { ...validData, minimumPayment: '0' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects negative minimum payment', () => {
      const data = { ...validData, minimumPayment: '-100' };
      const result = accountFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('formValuesToAccount', () => {
  it('converts percentage interest rate to decimal', () => {
    const formValues = {
      name: 'Test',
      type: 'home_loan' as const,
      balance: '100000',
      interestRate: '11.5',
      minimumPayment: '1000',
      lender: 'Bank',
      interestType: 'monthly' as const,
    };

    const result = formValuesToAccount(formValues);
    expect(result.interestRate).toBe('0.115');
  });

  it('handles 0% rate', () => {
    const formValues = {
      name: 'Test',
      type: 'home_loan' as const,
      balance: '100000',
      interestRate: '0',
      minimumPayment: '1000',
      lender: '',
      interestType: 'monthly' as const,
    };

    const result = formValuesToAccount(formValues);
    expect(result.interestRate).toBe('0');
  });

  it('handles 100% rate', () => {
    const formValues = {
      name: 'Test',
      type: 'credit_card' as const,
      balance: '10000',
      interestRate: '100',
      minimumPayment: '500',
      lender: '',
      interestType: 'daily' as const,
    };

    const result = formValuesToAccount(formValues);
    expect(result.interestRate).toBe('1');
  });
});

describe('accountToFormValues', () => {
  it('converts decimal interest rate to percentage', () => {
    const account = {
      name: 'Test',
      type: 'home_loan',
      balance: '100000',
      interestRate: '0.115',
      minimumPayment: '1000',
      lender: 'Bank',
      interestType: 'monthly',
    };

    const result = accountToFormValues(account);
    expect(result.interestRate).toBe('11.5');
  });

  it('handles 0 decimal rate', () => {
    const account = {
      interestRate: '0',
    };

    const result = accountToFormValues(account);
    expect(result.interestRate).toBe('0');
  });

  it('handles 1 (100%) decimal rate', () => {
    const account = {
      interestRate: '1',
    };

    const result = accountToFormValues(account);
    expect(result.interestRate).toBe('100');
  });
});
