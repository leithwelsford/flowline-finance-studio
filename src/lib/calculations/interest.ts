/**
 * Interest calculation utilities for debt accounts
 *
 * All calculations use big.js for precision (ADR-003).
 * Rates are stored as decimals (0.115 = 11.5%).
 */
import Big from 'big.js';
import type { DebtAccount, InterestType } from '@/types/account';
import type { FlexiFacility } from '@/types/flexi-facility';
import type { CompoundingFrequency, TotalPaymentResult } from './types';

/**
 * Current South African Prime Rate (as of 2025)
 * Prime rate is 11.75% (0.1175 as decimal)
 * This may change with SARB announcements
 */
export const SA_PRIME_RATE = '0.1175';

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

/**
 * Calculate daily interest for a balance (flexi facilities, daily compounding)
 *
 * Formula: balance × (annualRate / 365)
 *
 * @param balance - Current balance as string
 * @param annualRate - Annual interest rate as decimal string (e.g., "0.12" for 12%)
 * @returns Daily interest charge as Big, rounded to 2 decimal places
 *
 * @example
 * // R50,000 at 12% annual = R16.44/day
 * calculateDailyInterest('50000', '0.12') // Big("16.44")
 */
export function calculateDailyInterest(balance: string, annualRate: string): Big {
  const balanceValue = new Big(balance || '0');
  const rate = new Big(annualRate || '0');

  // Validate inputs
  if (balanceValue.lt(0)) {
    throw new Error('Balance cannot be negative');
  }
  if (rate.lt(0)) {
    throw new Error('Rate cannot be negative');
  }
  if (rate.gt(1)) {
    throw new Error('Rate cannot exceed 100% (1.0)');
  }

  // Handle edge cases
  if (balanceValue.eq(0) || rate.eq(0)) {
    return new Big(0);
  }

  // Daily interest: balance × (rate / 365)
  return balanceValue.times(rate).div(365).round(2, Big.roundHalfUp);
}

/**
 * Calculate monthly interest from daily interest
 *
 * Formula: dailyInterest × daysInMonth
 *
 * @param dailyInterest - Daily interest as Big
 * @param daysInMonth - Number of days in the month (default: 30)
 * @returns Monthly interest approximation as Big, rounded to 2 decimal places
 *
 * @example
 * // R16.44/day × 30 days = R493.20/month
 * calculateMonthlyFromDaily(Big('16.44'), 30) // Big("493.20")
 */
export function calculateMonthlyFromDaily(
  dailyInterest: Big,
  daysInMonth: number = 30
): Big {
  if (daysInMonth < 28 || daysInMonth > 31) {
    throw new Error('Days in month must be between 28 and 31');
  }

  return dailyInterest.times(daysInMonth).round(2, Big.roundHalfUp);
}

/**
 * Calculate effective interest rate with prime rate linkage
 *
 * SA loans are often quoted as "prime + X%"
 * Formula: primeRate + margin
 *
 * @param primeRate - Base prime rate as decimal string (e.g., "0.1175" for 11.75%)
 * @param margin - Margin above prime as decimal string (e.g., "0.02" for 2%)
 * @returns Effective rate as Big
 *
 * @example
 * // Prime (11.75%) + 2% margin = 13.75%
 * calculateEffectiveRate('0.1175', '0.02') // Big("0.1375")
 */
export function calculateEffectiveRate(primeRate: string, margin: string): Big {
  const prime = new Big(primeRate || '0');
  const marginValue = new Big(margin || '0');

  // Validate inputs
  if (prime.lt(0)) {
    throw new Error('Prime rate cannot be negative');
  }
  if (marginValue.lt(0)) {
    throw new Error('Margin cannot be negative');
  }

  const effectiveRate = prime.plus(marginValue);

  // Validate combined rate
  if (effectiveRate.gt(1)) {
    throw new Error('Combined rate cannot exceed 100% (1.0)');
  }

  return effectiveRate;
}

/**
 * Calculate compound interest over a period
 *
 * Daily: P × (1 + r/365)^n - P
 * Monthly: P × (1 + r/12)^n - P
 *
 * @param principal - Initial balance as string
 * @param rate - Annual interest rate as decimal string
 * @param periods - Number of compounding periods
 * @param frequency - Compounding frequency ('daily' or 'monthly')
 * @returns Total interest accrued as Big, rounded to 2 decimal places
 *
 * @example
 * // R100,000 at 12% for 12 months, monthly compounding
 * calculateCompoundInterest('100000', '0.12', 12, 'monthly')
 */
export function calculateCompoundInterest(
  principal: string,
  rate: string,
  periods: number,
  frequency: CompoundingFrequency
): Big {
  const p = new Big(principal || '0');
  const r = new Big(rate || '0');

  // Validate inputs
  if (p.lt(0)) {
    throw new Error('Principal cannot be negative');
  }
  if (r.lt(0)) {
    throw new Error('Rate cannot be negative');
  }
  if (r.gt(1)) {
    throw new Error('Rate cannot exceed 100% (1.0)');
  }
  if (periods < 0) {
    throw new Error('Periods cannot be negative');
  }

  // Handle edge cases
  if (p.eq(0) || r.eq(0) || periods === 0) {
    return new Big(0);
  }

  // Calculate periodic rate based on frequency
  const periodsPerYear = frequency === 'daily' ? 365 : 12;
  const periodicRate = r.div(periodsPerYear);

  // Compound interest formula: P × (1 + r)^n - P
  // big.js pow() only works with integers, so we use manual multiplication for precision
  let compoundFactor = new Big(1);
  const onePlusRate = new Big(1).plus(periodicRate);

  for (let i = 0; i < periods; i++) {
    compoundFactor = compoundFactor.times(onePlusRate);
  }

  const finalAmount = p.times(compoundFactor);
  const interest = finalAmount.minus(p);

  return interest.round(2, Big.roundHalfUp);
}

/**
 * Calculate total payment and interest over a loan period
 *
 * @param principal - Initial balance as string
 * @param rate - Annual interest rate as decimal string
 * @param monthlyPayment - Monthly payment amount as string
 * @param months - Number of months
 * @returns Object with totalPaid and totalInterest as Big values
 *
 * @example
 * calculateTotalPayment('100000', '0.115', '2000', 60)
 */
export function calculateTotalPayment(
  principal: string,
  rate: string,
  monthlyPayment: string,
  months: number
): TotalPaymentResult {
  const p = new Big(principal || '0');
  const r = new Big(rate || '0');
  const payment = new Big(monthlyPayment || '0');

  // Validate inputs
  if (p.lt(0)) {
    throw new Error('Principal cannot be negative');
  }
  if (r.lt(0)) {
    throw new Error('Rate cannot be negative');
  }
  if (payment.lt(0)) {
    throw new Error('Monthly payment cannot be negative');
  }
  if (months < 0) {
    throw new Error('Months cannot be negative');
  }

  // Handle edge cases
  if (p.eq(0) || months === 0) {
    return {
      totalPaid: new Big(0),
      totalInterest: new Big(0),
    };
  }

  let balance = p;
  let totalInterestPaid = new Big(0);
  let totalPaid = new Big(0);
  const monthlyRate = r.div(12);

  for (let i = 0; i < months && balance.gt(0); i++) {
    // Calculate interest for this month
    const interestCharge = balance.times(monthlyRate).round(2, Big.roundHalfUp);
    totalInterestPaid = totalInterestPaid.plus(interestCharge);

    // Calculate actual payment (can't pay more than balance + interest)
    const amountOwed = balance.plus(interestCharge);
    const actualPayment = payment.gt(amountOwed) ? amountOwed : payment;

    totalPaid = totalPaid.plus(actualPayment);

    // Reduce balance by (payment - interest)
    const principalPayment = actualPayment.minus(interestCharge);
    balance = balance.minus(principalPayment);

    // Ensure balance doesn't go negative due to rounding
    if (balance.lt(0)) {
      balance = new Big(0);
    }
  }

  return {
    totalPaid: totalPaid.round(2, Big.roundHalfUp),
    totalInterest: totalInterestPaid.round(2, Big.roundHalfUp),
  };
}
