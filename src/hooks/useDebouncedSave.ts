import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook for debounced save operations
 *
 * Provides a debounced save function that delays execution until
 * the user stops making changes. Cancels pending saves on unmount.
 *
 * @param saveFunction - Async function to call with the value
 * @param delay - Debounce delay in milliseconds (default 500ms)
 * @returns Debounced save function
 *
 * @example
 * ```tsx
 * const debouncedSave = useDebouncedSave(
 *   async (value: string) => {
 *     await saveToDatabase(value);
 *   },
 *   500
 * );
 *
 * // Call on every change - only saves after 500ms of inactivity
 * debouncedSave(newValue);
 * ```
 */
export function useDebouncedSave<T>(
  saveFunction: (value: T) => Promise<void>,
  delay: number = 500
): (value: T) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValueRef = useRef<T | null>(null);
  const saveFunctionRef = useRef(saveFunction);

  // Keep saveFunction ref up to date
  useEffect(() => {
    saveFunctionRef.current = saveFunction;
  }, [saveFunction]);

  const debouncedSave = useCallback(
    (value: T) => {
      pendingValueRef.current = value;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (pendingValueRef.current !== null) {
          await saveFunctionRef.current(pendingValueRef.current);
          pendingValueRef.current = null;
        }
      }, delay);
    },
    [delay]
  );

  // Cleanup on unmount - cancel pending saves
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedSave;
}
