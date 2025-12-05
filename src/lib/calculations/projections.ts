/**
 * Projection generator for debt payoff simulation
 *
 * Generates month-by-month projections showing how debt will be paid off
 * under different payment strategies. This is the core engine used by all
 * debt reduction strategies.
 *
 * All calculations use big.js for precision (ADR-003).
 */
import Big from 'big.js';
import { addMonths, format } from 'date-fns';
import { calculateMonthlyInterest, calculateFlexiMonthlyInterest } from './interest';
import type {
  AccountSnapshot,
  MonthlyProjection,
  PaymentAllocator,
  ProjectionConfig,
  FinancialSnapshot,
  SimulatedAccount,
  SimulatedFlexi,
} from './types';

/** Default maximum projection months (30 years) */
const DEFAULT_MAX_MONTHS = 360;

/**
 * Generate a month-by-month debt payoff projection
 *
 * @param snapshot - Financial snapshot with accounts, income, expenses
 * @param allocator - Function that determines how surplus is distributed
 * @param config - Optional configuration (maxMonths, startDate)
 * @returns Array of MonthlyProjection objects
 *
 * @example
 * const projection = generateProjection(snapshot, createBaselineAllocator());
 */
export function generateProjection(
  snapshot: FinancialSnapshot,
  allocator: PaymentAllocator,
  config?: ProjectionConfig
): MonthlyProjection[] {
  const maxMonths = config?.maxMonths ?? DEFAULT_MAX_MONTHS;
  const startDate = config?.startDate ?? snapshot.snapshotDate ?? new Date().toISOString();

  // Clone accounts for simulation (mutated during projection)
  const simulatedAccounts: SimulatedAccount[] = snapshot.accounts.map((acc) => ({
    id: acc.id,
    balance: new Big(acc.balance || '0'),
    interestRate: new Big(acc.interestRate || '0'),
    minimumPayment: new Big(acc.minimumPayment || '0'),
    interestType: acc.interestType,
  }));

  // Clone flexi if exists
  const simulatedFlexi: SimulatedFlexi | null = snapshot.flexiFacility
    ? {
        balance: new Big(snapshot.flexiFacility.currentBalance || '0'),
        interestRate: new Big(snapshot.flexiFacility.interestRate || '0'),
      }
    : null;

  const availableSurplus = new Big(snapshot.availableSurplus || '0');
  const projections: MonthlyProjection[] = [];

  // Running totals for cumulative interest and principal
  let cumulativeInterest = new Big(0);
  let cumulativePrincipal = new Big(0);

  // Parse start date for month calculations
  const baseDate = new Date(startDate);

  // Main projection loop
  for (let month = 1; month <= maxMonths; month++) {
    // Calculate date for this month
    const monthDate = addMonths(baseDate, month - 1);
    const dateStr = format(monthDate, 'yyyy-MM-dd');

    // Calculate this month's snapshot
    const monthSnapshot = calculateMonthSnapshot(
      month,
      dateStr,
      simulatedAccounts,
      simulatedFlexi,
      availableSurplus,
      allocator,
      cumulativeInterest,
      cumulativePrincipal
    );

    projections.push(monthSnapshot);

    // Update cumulative totals
    cumulativeInterest = monthSnapshot.totalInterestPaid;
    cumulativePrincipal = monthSnapshot.totalPrincipalPaid;

    // Check exit condition: all debt paid off
    if (monthSnapshot.totalDebt.eq(0)) {
      break;
    }
  }

  return projections;
}

/**
 * Calculate snapshot for a single month
 *
 * @param month - Month number (1-based)
 * @param date - ISO date string
 * @param accounts - Simulated accounts (mutated)
 * @param flexi - Simulated flexi facility (mutated)
 * @param availableSurplus - Available surplus after min payments
 * @param allocator - Payment allocation function
 * @param prevCumulativeInterest - Interest paid in previous months
 * @param prevCumulativePrincipal - Principal paid in previous months
 */
function calculateMonthSnapshot(
  month: number,
  date: string,
  accounts: SimulatedAccount[],
  flexi: SimulatedFlexi | null,
  availableSurplus: Big,
  allocator: PaymentAllocator,
  prevCumulativeInterest: Big,
  prevCumulativePrincipal: Big
): MonthlyProjection {
  const accountSnapshots: AccountSnapshot[] = [];
  let monthInterest = new Big(0);
  let monthPrincipal = new Big(0);
  let totalMinPayments = new Big(0);
  let remainingSurplus = availableSurplus;

  // Phase 1: Calculate interest and apply minimum payments
  for (const account of accounts) {
    const startBalance = account.balance;

    // Skip accounts with zero balance
    if (startBalance.lte(0)) {
      accountSnapshots.push({
        accountId: account.id,
        startBalance: new Big(0),
        interestCharged: new Big(0),
        paymentApplied: new Big(0),
        principalPaid: new Big(0),
        endBalance: new Big(0),
      });
      continue;
    }

    // Calculate interest for this month
    const interestCharged = calculateMonthlyInterest(
      startBalance.toString(),
      account.interestRate.toString(),
      account.interestType
    ).round(2, Big.roundHalfUp);

    // Balance after interest
    const balanceWithInterest = startBalance.plus(interestCharged);

    // Minimum payment (capped at balance + interest to avoid overpayment)
    const minPayment = account.minimumPayment.gt(balanceWithInterest)
      ? balanceWithInterest
      : account.minimumPayment;

    totalMinPayments = totalMinPayments.plus(minPayment);

    // Calculate new balance after minimum payment
    let endBalance = balanceWithInterest.minus(minPayment);
    if (endBalance.lt(0)) {
      endBalance = new Big(0);
    }

    // Principal paid = min payment - interest (if min payment covers interest)
    let principalFromMin = minPayment.minus(interestCharged);
    if (principalFromMin.lt(0)) {
      principalFromMin = new Big(0);
    }

    // Update account balance for tracking
    account.balance = endBalance;

    // Store temporary snapshot (will be updated with extra payments)
    accountSnapshots.push({
      accountId: account.id,
      startBalance: startBalance.round(2, Big.roundHalfUp),
      interestCharged,
      paymentApplied: minPayment.round(2, Big.roundHalfUp),
      principalPaid: principalFromMin.round(2, Big.roundHalfUp),
      endBalance: endBalance.round(2, Big.roundHalfUp),
    });

    monthInterest = monthInterest.plus(interestCharged);
    monthPrincipal = monthPrincipal.plus(principalFromMin);
  }

  // Calculate freed surplus from paid-off accounts (their min payments become available)
  // This is calculated from minimum payments of accounts that reached zero this month
  // For simplicity, assume surplus is pre-calculated and includes all minimum payments

  // Phase 2: Allocate surplus payments
  // Surplus = availableSurplus (which should already account for min payments)
  // If accounts were paid off, their min payments are now available
  const activeAccounts = accounts.filter((a) => a.balance.gt(0));

  // Get allocations from strategy
  const allocations = allocator(remainingSurplus, activeAccounts, flexi);

  // Apply extra payments
  for (const allocation of allocations) {
    const accountIdx = accountSnapshots.findIndex((s) => s.accountId === allocation.accountId);
    if (accountIdx === -1) continue;

    const snapshot = accountSnapshots[accountIdx];
    const account = accounts.find((a) => a.id === allocation.accountId);
    if (!account) continue;

    // Cap allocation at remaining balance
    const maxPayment = account.balance;
    const extraPayment = allocation.amount.gt(maxPayment) ? maxPayment : allocation.amount;

    if (extraPayment.gt(0)) {
      // Update snapshot with extra payment
      snapshot.paymentApplied = snapshot.paymentApplied.plus(extraPayment).round(2, Big.roundHalfUp);
      snapshot.principalPaid = snapshot.principalPaid.plus(extraPayment).round(2, Big.roundHalfUp);
      snapshot.endBalance = snapshot.endBalance.minus(extraPayment);

      if (snapshot.endBalance.lt(0)) {
        snapshot.endBalance = new Big(0);
      }
      snapshot.endBalance = snapshot.endBalance.round(2, Big.roundHalfUp);

      // Update account balance
      account.balance = snapshot.endBalance;

      monthPrincipal = monthPrincipal.plus(extraPayment);
    }
  }

  // Handle flexi facility interest (if exists)
  let flexiBalance: Big | undefined;
  if (flexi && flexi.balance.gt(0)) {
    const flexiInterest = calculateFlexiMonthlyInterest(
      flexi.balance.toString(),
      flexi.interestRate.toString()
    ).round(2, Big.roundHalfUp);

    flexi.balance = flexi.balance.plus(flexiInterest).round(2, Big.roundHalfUp);
    flexiBalance = flexi.balance;
    monthInterest = monthInterest.plus(flexiInterest);
  } else if (flexi) {
    flexiBalance = flexi.balance;
  }

  // Calculate totals
  const totalDebt = accounts.reduce(
    (sum, acc) => sum.plus(acc.balance),
    flexi ? flexi.balance : new Big(0)
  ).round(2, Big.roundHalfUp);

  const totalInterestPaid = prevCumulativeInterest.plus(monthInterest).round(2, Big.roundHalfUp);
  const totalPrincipalPaid = prevCumulativePrincipal.plus(monthPrincipal).round(2, Big.roundHalfUp);

  return {
    month,
    date,
    accounts: accountSnapshots,
    flexiBalance,
    totalDebt,
    totalInterestPaid,
    totalPrincipalPaid,
  };
}

/**
 * Create a baseline payment allocator (minimum payments only)
 *
 * The baseline allocator returns no extra allocations, meaning
 * only minimum payments are applied. Used by the baseline strategy
 * to show what happens with no extra effort.
 *
 * @returns PaymentAllocator that returns empty allocations
 */
export function createBaselineAllocator(): PaymentAllocator {
  return () => [];
}

/**
 * Build a FinancialSnapshot from raw data
 *
 * @param accounts - Array of debt accounts
 * @param flexi - Flexi facility or null
 * @param monthlyIncome - Monthly income as string
 * @param monthlyExpenses - Monthly expenses as string
 * @returns FinancialSnapshot ready for projection
 */
export function buildSnapshot(
  accounts: { id: number; balance: string; interestRate: string; minimumPayment: string; interestType: 'monthly' | 'daily' }[],
  flexi: { currentBalance: string; interestRate: string } | null,
  monthlyIncome: string,
  monthlyExpenses: string
): FinancialSnapshot {
  const income = new Big(monthlyIncome || '0');
  const expenses = new Big(monthlyExpenses || '0');

  // Calculate total minimum payments
  const totalMinPayments = accounts.reduce(
    (sum, acc) => sum.plus(new Big(acc.minimumPayment || '0')),
    new Big(0)
  );

  // Calculate available surplus
  let surplus = income.minus(expenses).minus(totalMinPayments);

  // Handle negative surplus
  if (surplus.lt(0)) {
    console.warn(
      `Negative surplus detected: income (${income.toString()}) - expenses (${expenses.toString()}) - minPayments (${totalMinPayments.toString()}) = ${surplus.toString()}. Using 0.`
    );
    surplus = new Big(0);
  }

  return {
    accounts,
    flexiFacility: flexi,
    monthlyIncome,
    monthlyExpenses,
    availableSurplus: surplus.round(2, Big.roundHalfUp).toString(),
    snapshotDate: new Date().toISOString().split('T')[0],
  };
}
