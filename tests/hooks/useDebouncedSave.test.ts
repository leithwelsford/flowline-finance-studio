import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';

describe('useDebouncedSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('debounce behavior', () => {
    it('delays execution by default delay (500ms)', async () => {
      const saveFunction = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useDebouncedSave(saveFunction));

      act(() => {
        result.current('test-value');
      });

      // Not called immediately
      expect(saveFunction).not.toHaveBeenCalled();

      // Advance timers by 400ms - still not called
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(saveFunction).not.toHaveBeenCalled();

      // Advance to 500ms - now called
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      expect(saveFunction).toHaveBeenCalledWith('test-value');
      expect(saveFunction).toHaveBeenCalledTimes(1);
    });

    it('uses custom delay when provided', async () => {
      const saveFunction = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useDebouncedSave(saveFunction, 1000));

      act(() => {
        result.current('test-value');
      });

      // Advance timers by 500ms - not called yet
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(saveFunction).not.toHaveBeenCalled();

      // Advance to 1000ms - now called
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(saveFunction).toHaveBeenCalledWith('test-value');
    });

    it('cancels previous call when new value is set before delay', async () => {
      const saveFunction = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useDebouncedSave(saveFunction, 500));

      act(() => {
        result.current('first-value');
      });

      // Advance 300ms then set new value
      act(() => {
        vi.advanceTimersByTime(300);
      });
      act(() => {
        result.current('second-value');
      });

      // Advance 300ms - first timer would have fired but was cancelled
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(saveFunction).not.toHaveBeenCalled();

      // Advance remaining 200ms for second timer
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      expect(saveFunction).toHaveBeenCalledWith('second-value');
      expect(saveFunction).toHaveBeenCalledTimes(1);
    });

    it('only calls with last value when rapidly called', async () => {
      const saveFunction = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useDebouncedSave(saveFunction, 500));

      act(() => {
        result.current('value-1');
        result.current('value-2');
        result.current('value-3');
        result.current('final-value');
      });

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(saveFunction).toHaveBeenCalledWith('final-value');
      expect(saveFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup on unmount', () => {
    it('cancels pending save when unmounted', async () => {
      const saveFunction = vi.fn().mockResolvedValue(undefined);
      const { result, unmount } = renderHook(() => useDebouncedSave(saveFunction, 500));

      act(() => {
        result.current('test-value');
      });

      // Unmount before timer fires
      unmount();

      // Advance timers past delay
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Save function should not have been called
      expect(saveFunction).not.toHaveBeenCalled();
    });
  });

  describe('callback reference', () => {
    it('uses latest callback even if function changes', async () => {
      const saveFunction1 = vi.fn().mockResolvedValue(undefined);
      const saveFunction2 = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ fn }) => useDebouncedSave(fn, 500),
        { initialProps: { fn: saveFunction1 } }
      );

      act(() => {
        result.current('test-value');
      });

      // Change the save function
      rerender({ fn: saveFunction2 });

      // Advance timers
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Should use the updated callback
      expect(saveFunction1).not.toHaveBeenCalled();
      expect(saveFunction2).toHaveBeenCalledWith('test-value');
    });
  });

  describe('type safety', () => {
    it('works with different value types', async () => {
      // Number
      const saveNumber = vi.fn().mockResolvedValue(undefined);
      const { result: numResult } = renderHook(() =>
        useDebouncedSave<number>(saveNumber, 100)
      );

      act(() => {
        numResult.current(42);
      });
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      expect(saveNumber).toHaveBeenCalledWith(42);

      // Object
      const saveObject = vi.fn().mockResolvedValue(undefined);
      const { result: objResult } = renderHook(() =>
        useDebouncedSave<{ id: number; value: string }>(saveObject, 100)
      );

      act(() => {
        objResult.current({ id: 1, value: 'test' });
      });
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      expect(saveObject).toHaveBeenCalledWith({ id: 1, value: 'test' });
    });
  });
});
