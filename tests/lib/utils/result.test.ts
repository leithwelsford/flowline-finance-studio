import { describe, it, expect } from 'vitest'
import { ok, err, isOk, isErr, type Result } from '@/lib/utils/result'

describe('Result type utilities', () => {
  describe('ok()', () => {
    it('creates a success result with data', () => {
      const result = ok('test value')
      expect(result).toEqual({ success: true, data: 'test value' })
    })

    it('creates a success result with number', () => {
      const result = ok(42)
      expect(result).toEqual({ success: true, data: 42 })
    })

    it('creates a success result with object', () => {
      const data = { id: 1, name: 'test' }
      const result = ok(data)
      expect(result).toEqual({ success: true, data })
    })

    it('creates a success result with array', () => {
      const data = [1, 2, 3]
      const result = ok(data)
      expect(result).toEqual({ success: true, data })
    })

    it('creates a success result with null', () => {
      const result = ok(null)
      expect(result).toEqual({ success: true, data: null })
    })
  })

  describe('err()', () => {
    it('creates a failure result with Error', () => {
      const error = new Error('Something went wrong')
      const result = err(error)
      expect(result).toEqual({ success: false, error })
    })

    it('creates a failure result with string error', () => {
      const result = err('string error')
      expect(result).toEqual({ success: false, error: 'string error' })
    })

    it('creates a failure result with custom error object', () => {
      const customError = { code: 'VALIDATION_ERROR', message: 'Invalid input' }
      const result = err(customError)
      expect(result).toEqual({ success: false, error: customError })
    })
  })

  describe('isOk()', () => {
    it('returns true for success result', () => {
      const result = ok('test')
      expect(isOk(result)).toBe(true)
    })

    it('returns false for failure result', () => {
      const result = err(new Error('test'))
      expect(isOk(result)).toBe(false)
    })

    it('type narrows to success variant', () => {
      const result: Result<string> = ok('test')
      if (isOk(result)) {
        // TypeScript should know result.data exists here
        expect(result.data).toBe('test')
      }
    })
  })

  describe('isErr()', () => {
    it('returns true for failure result', () => {
      const result = err(new Error('test'))
      expect(isErr(result)).toBe(true)
    })

    it('returns false for success result', () => {
      const result = ok('test')
      expect(isErr(result)).toBe(false)
    })

    it('type narrows to failure variant', () => {
      const result: Result<string> = err(new Error('test error'))
      if (isErr(result)) {
        // TypeScript should know result.error exists here
        expect(result.error.message).toBe('test error')
      }
    })
  })

  describe('Result type pattern matching', () => {
    it('can pattern match on success', () => {
      const result: Result<number> = ok(42)

      let value: number | null = null
      if (result.success) {
        value = result.data
      }

      expect(value).toBe(42)
    })

    it('can pattern match on failure', () => {
      const result: Result<number> = err(new Error('failed'))

      let errorMessage: string | null = null
      if (!result.success) {
        errorMessage = result.error.message
      }

      expect(errorMessage).toBe('failed')
    })

    it('works with generic function', () => {
      function divide(a: number, b: number): Result<number> {
        if (b === 0) {
          return err(new Error('Division by zero'))
        }
        return ok(a / b)
      }

      const success = divide(10, 2)
      expect(success).toEqual({ success: true, data: 5 })

      const failure = divide(10, 0)
      expect(failure.success).toBe(false)
      if (!failure.success) {
        expect(failure.error.message).toBe('Division by zero')
      }
    })
  })
})
