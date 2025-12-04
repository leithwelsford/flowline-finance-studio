/**
 * Interest calculation utilities for debt accounts
 *
 * All calculations use big.js for precision (ADR-003).
 */
import Big from 'big.js';
import type { DebtAccount, InterestType } from '@/types/account';
import type { FlexiFacility } from '@/types/flexi-facility';

/**
 * Calculate monthly interest for a debt account
 *
 * Standard loans: (balance × annualRate) / 12
 * Daily compounding: (balance × annualRate) / 365 × 30
 *
 * @param balance - Current balance as string
 * @param annualRate - Annual interest rate as decimal string (e.g., "0.115" for 11.5%)
 * @param interestType - Whether interest is calculated monthly or daily
 * @returns Monthly interest charge as Big
 *
 * @example
 * // Standard loan: R100,000 at 11.5% = R958.33/month
 * calculateMonthlyInterest('100000', '0.115', 'monthly') // Big("958.33...")
 */
export function calculateMonthlyInterest(
  balance: string,
  annualRate: string,
  interestType: InterestType
): Big {
  const balanceValue = new Big(balance || '0');
  const rate = new Big(annualRate || '0');

  // Handle edge cases
  if (balanceValue.eq(0) || rate.eq(0)) {
    return new Big(0);
  }

  if (interestType === 'daily') {
    // Daily compounding: (balance × rate) / 365 × 30
    return balanceValue.times(rate).div(365).times(30);
  }

  // Monthly: (balance × rate) / 12
  return balanceValue.times(rate).div(12);
}

/**
 * Calculate monthly interest for a flexi facility
 *
 * Flexi facilities use daily compounding: (balance × rate) / 365 × 30
 *
 * @param currentBalance - Current balance as string
 * @param annualRate - Annual interest rate as decimal string
 * @returns Monthly interest charge as Big
 */
export function calculateFlexiMonthlyInterest(
  currentBalance: string,
  annualRate: string
): Big {
  const balance = new Big(currentBalance || '0');
  const rate = new Big(annualRate || '0');

  if (balance.eq(0) || rate.eq(0)) {
    return new Big(0);
  }

  // Flexi uses daily compounding
  return balance.times(rate).div(365).times(30);
}

/**
 * Calculate total monthly interest across all debt accounts and flexi facility
 *
 * @param accounts - Array of debt accounts
 * @param flexiFacility - Flexi facility (or null if none)
 * @returns Total monthly interest as Big
 */
export function calculateTotalMonthlyInterest(
  accounts: DebtAccount[],
  flexiFacility: FlexiFacility | null
): Big {
  // Sum interest from all debt accounts
  let total = accounts.reduce((sum, account) => {
    const accountInterest = calculateMonthlyInterest(
      account.balance,
      account.interestRate,
      account.interestType
    );
    return sum.plus(accountInterest);
  }, new Big(0));

  // Add flexi facility interest if exists
  if (flexiFacility) {
    const flexiInterest = calculateFlexiMonthlyInterest(
      flexiFacility.currentBalance,
      flexiFacility.interestRate
    );
    total = total.plus(flexiInterest);
  }

  return total;
}
