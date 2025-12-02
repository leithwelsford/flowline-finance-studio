import { describe, it, expect } from 'vitest';
import {
  flexiFacilityFormSchema,
  flexiFacilityTypeSchema,
  formValuesToFlexiFacility,
  flexiFacilityToFormValues,
} from '@/lib/validation/flexi-facility';

describe('flexiFacilityTypeSchema', () => {
  it('accepts valid facility types', () => {
    expect(flexiFacilityTypeSchema.parse('fnb_flexi')).toBe('fnb_flexi');
    expect(flexiFacilityTypeSchema.parse('standard_bank_access')).toBe('standard_bank_access');
  });

  it('rejects invalid facility types', () => {
    expect(() => flexiFacilityTypeSchema.parse('invalid')).toThrow();
    expect(() => flexiFacilityTypeSchema.parse('')).toThrow();
    expect(() => flexiFacilityTypeSchema.parse('nedbank_flexi')).toThrow();
  });
});

describe('flexiFacilityFormSchema', () => {
  const validData = {
    name: 'My Flexi Facility',
    type: 'fnb_flexi' as const,
    creditLimit: '200000',
    currentBalance: '50000',
    interestRate: '11.75',
  };

  it('validates complete valid data', () => {
    const result = flexiFacilityFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('My Flexi Facility');
      expect(result.data.type).toBe('fnb_flexi');
      expect(result.data.creditLimit).toBe('200000');
      expect(result.data.currentBalance).toBe('50000');
      expect(result.data.interestRate).toBe('11.75');
    }
  });

  it('accepts Standard Bank Access Bond type', () => {
    const data = { ...validData, type: 'standard_bank_access' as const };
    const result = flexiFacilityFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  describe('name validation', () => {
    it('requires name', () => {
      const data = { ...validData, name: '' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Facility name is required');
      }
    });

    it('accepts name at 100 characters', () => {
      const data = { ...validData, name: 'a'.repeat(100) };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects name over 100 characters', () => {
      const data = { ...validData, name: 'a'.repeat(101) };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('creditLimit validation', () => {
    it('requires credit limit', () => {
      const data = { ...validData, creditLimit: '' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts zero credit limit', () => {
      const data = { ...validData, creditLimit: '0' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts decimal credit limit', () => {
      const data = { ...validData, creditLimit: '250000.50' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects negative credit limit', () => {
      const data = { ...validData, creditLimit: '-100000' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Credit limit must be a non-negative number');
      }
    });

    it('rejects non-numeric credit limit', () => {
      const data = { ...validData, creditLimit: 'abc' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('currentBalance validation', () => {
    it('requires current balance', () => {
      const data = { ...validData, currentBalance: '' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts zero balance', () => {
      const data = { ...validData, currentBalance: '0' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts positive balance', () => {
      const data = { ...validData, currentBalance: '75000' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts negative balance (available credit)', () => {
      const data = { ...validData, currentBalance: '-25000' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts decimal balance', () => {
      const data = { ...validData, currentBalance: '50000.75' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects non-numeric balance', () => {
      const data = { ...validData, currentBalance: 'abc' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Current balance must be a valid number');
      }
    });
  });

  describe('interestRate validation', () => {
    it('requires interest rate', () => {
      const data = { ...validData, interestRate: '' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts 0% rate', () => {
      const data = { ...validData, interestRate: '0' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts 100% rate', () => {
      const data = { ...validData, interestRate: '100' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts decimal rate', () => {
      const data = { ...validData, interestRate: '11.75' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects rate over 100%', () => {
      const data = { ...validData, interestRate: '101' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects negative rate', () => {
      const data = { ...validData, interestRate: '-5' };
      const result = flexiFacilityFormSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('formValuesToFlexiFacility', () => {
  it('converts percentage interest rate to decimal', () => {
    const formValues = {
      name: 'Test Facility',
      type: 'fnb_flexi' as const,
      creditLimit: '200000',
      currentBalance: '50000',
      interestRate: '11.75',
    };

    const result = formValuesToFlexiFacility(formValues);
    expect(result.interestRate).toBe('0.1175');
  });

  it('handles 0% rate', () => {
    const formValues = {
      name: 'Test Facility',
      type: 'fnb_flexi' as const,
      creditLimit: '200000',
      currentBalance: '50000',
      interestRate: '0',
    };

    const result = formValuesToFlexiFacility(formValues);
    expect(result.interestRate).toBe('0');
  });

  it('handles 100% rate', () => {
    const formValues = {
      name: 'Test Facility',
      type: 'standard_bank_access' as const,
      creditLimit: '100000',
      currentBalance: '0',
      interestRate: '100',
    };

    const result = formValuesToFlexiFacility(formValues);
    expect(result.interestRate).toBe('1');
  });

  it('preserves other fields unchanged', () => {
    const formValues = {
      name: 'My Access Bond',
      type: 'standard_bank_access' as const,
      creditLimit: '500000',
      currentBalance: '-10000',
      interestRate: '10',
    };

    const result = formValuesToFlexiFacility(formValues);
    expect(result.name).toBe('My Access Bond');
    expect(result.type).toBe('standard_bank_access');
    expect(result.creditLimit).toBe('500000');
    expect(result.currentBalance).toBe('-10000');
  });
});

describe('flexiFacilityToFormValues', () => {
  it('converts decimal interest rate to percentage', () => {
    const facility = {
      name: 'Test Facility',
      type: 'fnb_flexi',
      creditLimit: '200000',
      currentBalance: '50000',
      interestRate: '0.1175',
    };

    const result = flexiFacilityToFormValues(facility);
    expect(result.interestRate).toBe('11.75');
  });

  it('handles 0 decimal rate', () => {
    const facility = {
      interestRate: '0',
    };

    const result = flexiFacilityToFormValues(facility);
    expect(result.interestRate).toBe('0');
  });

  it('handles 1 (100%) decimal rate', () => {
    const facility = {
      interestRate: '1',
    };

    const result = flexiFacilityToFormValues(facility);
    expect(result.interestRate).toBe('100');
  });

  it('preserves other fields unchanged', () => {
    const facility = {
      name: 'My Access Bond',
      type: 'standard_bank_access',
      creditLimit: '500000',
      currentBalance: '-10000',
      interestRate: '0.1',
    };

    const result = flexiFacilityToFormValues(facility);
    expect(result.name).toBe('My Access Bond');
    expect(result.type).toBe('standard_bank_access');
    expect(result.creditLimit).toBe('500000');
    expect(result.currentBalance).toBe('-10000');
  });
});
