import { describe, it, expect } from 'vitest';
import {
  expenseFormSchema,
  expenseCategorySchema,
  formValuesToExpense,
  expenseToFormValues,
} from '@/lib/validation/expense';

describe('expenseCategorySchema', () => {
  const validCategories = [
    'housing',
    'transport',
    'food',
    'utilities',
    'insurance',
    'entertainment',
    'other',
  ];

  it.each(validCategories)('accepts valid category: %s', (category) => {
    const result = expenseCategorySchema.safeParse(category);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(category);
    }
  });

  it('rejects invalid category', () => {
    const result = expenseCategorySchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = expenseCategorySchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects undefined', () => {
    const result = expenseCategorySchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });
});

describe('expenseFormSchema', () => {
  const validData = {
    category: 'housing' as const,
    amount: '12000',
    description: 'Monthly rent',
  };

  it('validates complete valid data', () => {
    const result = expenseFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe('housing');
      expect(result.data.amount).toBe('12000');
      expect(result.data.description).toBe('Monthly rent');
    }
  });

  it('validates data without optional description', () => {
    const data = { category: 'food' as const, amount: '5000' };
    const result = expenseFormSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe('food');
      expect(result.data.amount).toBe('5000');
      expect(result.data.description).toBeUndefined();
    }
  });

  it('accepts empty description string', () => {
    const data = { ...validData, description: '' };
    const result = expenseFormSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('');
    }
  });

  describe('category validation', () => {
    it('requires category', () => {
      const data = { amount: '12000' };
      const result = expenseFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid category', () => {
      const data = { ...validData, category: 'groceries' };
      const result = expenseFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it.each([
      'housing',
      'transport',
      'food',
      'utilities',
      'insurance',
      'entertainment',
      'other',
    ])('accepts category: %s', (category) => {
      const data = { ...validData, category };
      const result = expenseFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('amount validation', () => {
    it('requires amount', () => {
      const data = { ...validData, amount: '' };
      const result = expenseFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Monthly amount is required');
      }
    });

    it('accepts zero amount', () => {
      const data = { ...validData, amount: '0' };
      const result = expenseFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts decimal amount', () => {
      const data = { ...validData, amount: '12000.50' };
      const result = expenseFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects negative amount', () => {
      const data = { ...validData, amount: '-1000' };
      const result = expenseFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount must be a non-negative number');
      }
    });

    it('rejects non-numeric amount', () => {
      const data = { ...validData, amount: 'abc' };
      const result = expenseFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts large amounts', () => {
      const data = { ...validData, amount: '999999999' };
      const result = expenseFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('formValuesToExpense', () => {
  it('converts form values to database format', () => {
    const formValues = {
      category: 'housing' as const,
      amount: '12000',
      description: 'Monthly rent',
    };

    const result = formValuesToExpense(formValues);
    expect(result.category).toBe('housing');
    expect(result.amount).toBe('12000');
    expect(result.description).toBe('Monthly rent');
  });

  it('omits description when undefined', () => {
    const formValues = {
      category: 'food' as const,
      amount: '5000',
      description: undefined,
    };

    const result = formValuesToExpense(formValues);
    expect(result.category).toBe('food');
    expect(result.amount).toBe('5000');
    expect('description' in result).toBe(false);
  });

  it('omits description when empty string', () => {
    const formValues = {
      category: 'transport' as const,
      amount: '3500',
      description: '',
    };

    const result = formValuesToExpense(formValues);
    expect('description' in result).toBe(false);
  });

  it('includes description when provided', () => {
    const formValues = {
      category: 'utilities' as const,
      amount: '1800',
      description: 'Electricity and water',
    };

    const result = formValuesToExpense(formValues);
    expect(result.description).toBe('Electricity and water');
  });
});

describe('expenseToFormValues', () => {
  it('converts database expense to form values', () => {
    const expense = {
      category: 'housing' as const,
      amount: '12000',
      description: 'Monthly rent',
    };

    const result = expenseToFormValues(expense);
    expect(result.category).toBe('housing');
    expect(result.amount).toBe('12000');
    expect(result.description).toBe('Monthly rent');
  });

  it('handles undefined description', () => {
    const expense = {
      category: 'food' as const,
      amount: '5000',
    };

    const result = expenseToFormValues(expense);
    expect(result.category).toBe('food');
    expect(result.amount).toBe('5000');
    expect(result.description).toBeUndefined();
  });

  it('preserves all fields from database entry', () => {
    const expense = {
      id: 1,
      category: 'utilities' as const,
      amount: '1800.00',
      description: 'Electricity',
      date: '2024-01-01',
      createdAt: '2024-01-01T00:00:00Z',
    };

    const result = expenseToFormValues(expense);
    expect(result.category).toBe('utilities');
    expect(result.amount).toBe('1800.00');
    expect(result.description).toBe('Electricity');
  });
});
