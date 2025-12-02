import { describe, it, expect } from 'vitest';
import {
  incomeFormSchema,
  formValuesToIncome,
  incomeToFormValues,
} from '@/lib/validation/income';

describe('incomeFormSchema', () => {
  const validData = {
    source: 'Salary',
    amount: '45000',
    paymentDate: 25,
  };

  it('validates complete valid data', () => {
    const result = incomeFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe('Salary');
      expect(result.data.amount).toBe('45000');
      expect(result.data.paymentDate).toBe(25);
    }
  });

  it('validates data without optional paymentDate', () => {
    const data = { source: 'Rental Income', amount: '8000' };
    const result = incomeFormSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe('Rental Income');
      expect(result.data.amount).toBe('8000');
      expect(result.data.paymentDate).toBeUndefined();
    }
  });

  it('accepts paymentDate as number', () => {
    const data = { source: 'Salary', amount: '45000', paymentDate: 25 };
    const result = incomeFormSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paymentDate).toBe(25);
    }
  });

  it('rejects string paymentDate', () => {
    const data = { source: 'Salary', amount: '45000', paymentDate: '25' };
    const result = incomeFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  describe('source validation', () => {
    it('requires source', () => {
      const data = { ...validData, source: '' };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Income source is required');
      }
    });

    it('accepts source at 100 characters', () => {
      const data = { ...validData, source: 'a'.repeat(100) };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects source over 100 characters', () => {
      const data = { ...validData, source: 'a'.repeat(101) };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Income source must be 100 characters or less');
      }
    });
  });

  describe('amount validation', () => {
    it('requires amount', () => {
      const data = { ...validData, amount: '' };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Monthly amount is required');
      }
    });

    it('accepts zero amount', () => {
      const data = { ...validData, amount: '0' };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts decimal amount', () => {
      const data = { ...validData, amount: '45000.50' };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects negative amount', () => {
      const data = { ...validData, amount: '-1000' };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount must be a non-negative number');
      }
    });

    it('rejects non-numeric amount', () => {
      const data = { ...validData, amount: 'abc' };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('paymentDate validation', () => {
    it('accepts day 1', () => {
      const data = { ...validData, paymentDate: 1 };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentDate).toBe(1);
      }
    });

    it('accepts day 31', () => {
      const data = { ...validData, paymentDate: 31 };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.paymentDate).toBe(31);
      }
    });

    it('rejects day 0', () => {
      const data = { ...validData, paymentDate: 0 };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Payment date must be between 1 and 31');
      }
    });

    it('rejects day 32', () => {
      const data = { ...validData, paymentDate: 32 };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Payment date must be between 1 and 31');
      }
    });

    it('rejects negative day', () => {
      const data = { ...validData, paymentDate: -1 };
      const result = incomeFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('formValuesToIncome', () => {
  it('converts form values to database format', () => {
    const formValues = {
      source: 'Salary',
      amount: '45000',
      paymentDate: 25,
    };

    const result = formValuesToIncome(formValues);
    expect(result.source).toBe('Salary');
    expect(result.amount).toBe('45000');
    expect(result.paymentDate).toBe(25);
  });

  it('omits paymentDate when undefined', () => {
    const formValues = {
      source: 'Side Business',
      amount: '5000',
      paymentDate: undefined,
    };

    const result = formValuesToIncome(formValues);
    expect(result.source).toBe('Side Business');
    expect(result.amount).toBe('5000');
    expect('paymentDate' in result).toBe(false);
  });

  it('includes paymentDate when provided', () => {
    const formValues = {
      source: 'Rental',
      amount: '8000',
      paymentDate: 1,
    };

    const result = formValuesToIncome(formValues);
    expect(result.paymentDate).toBe(1);
  });
});

describe('incomeToFormValues', () => {
  it('converts database income to form values', () => {
    const income = {
      source: 'Salary',
      amount: '45000',
      paymentDate: 25,
    };

    const result = incomeToFormValues(income);
    expect(result.source).toBe('Salary');
    expect(result.amount).toBe('45000');
    expect(result.paymentDate).toBe(25);
  });

  it('handles undefined paymentDate', () => {
    const income = {
      source: 'Side Business',
      amount: '5000',
    };

    const result = incomeToFormValues(income);
    expect(result.source).toBe('Side Business');
    expect(result.amount).toBe('5000');
    expect(result.paymentDate).toBeUndefined();
  });

  it('preserves all fields', () => {
    const income = {
      id: 1,
      source: 'Salary',
      amount: '45000.00',
      paymentDate: 25,
      createdAt: '2024-01-01T00:00:00Z',
    };

    const result = incomeToFormValues(income);
    expect(result.source).toBe('Salary');
    expect(result.amount).toBe('45000.00');
    expect(result.paymentDate).toBe(25);
  });
});
