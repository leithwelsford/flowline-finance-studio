/**
 * Application settings interface
 * Generic key-value store for application configuration
 *
 * Uses string key as primary key (not auto-increment)
 */
export interface AppSettings {
  /** Setting key (primary key) */
  key: string;
  /** Setting value (stored as string, can be JSON stringified for complex values) */
  value: string;
}
