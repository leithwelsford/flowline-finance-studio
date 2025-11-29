import { FlowlineDB } from './schema';

/**
 * Singleton database instance for the application
 *
 * Usage:
 * ```typescript
 * import { db } from '@/lib/db';
 *
 * // Add an account
 * const id = await db.accounts.add({
 *   name: 'Home Loan',
 *   type: 'home_loan',
 *   balance: '500000.00',
 *   // ...
 * });
 *
 * // Query accounts
 * const accounts = await db.accounts.toArray();
 *
 * // Use with useLiveQuery hook
 * const accounts = useLiveQuery(() => db.accounts.toArray());
 * ```
 */
export const db = new FlowlineDB();

// Re-export the class and constants for type usage
export { FlowlineDB, DB_NAME } from './schema';
