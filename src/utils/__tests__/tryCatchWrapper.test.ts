import { describe, expect, test } from 'bun:test'
import { tryCatch, tryCatchSync } from '../tryCatchWrapper'

describe('tryCatch', () => {
  test('handles successful async operations', async () => {
    const result = await tryCatch(async () => 'success')
    
    expect(result.success).toBe(true)
    expect(result.data).toBe('success')
    expect(result.error).toBeNull()
  })

  test('handles async operation failures', async () => {
    const error = new Error('Async operation failed')
    const result = await tryCatch(async () => {
      throw error
    })

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    if (!result.success) {
      expect(result.error).toBe(error)
    }
  })

  test('handles non-Error throws in async operations', async () => {
    const result = await tryCatch(async () => {
      throw 'string error'
    })

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error.message).toBe('string error')
    }
  })

  test('uses custom error handler for async operations', async () => {
    class CustomError extends Error {
      code: string
      constructor(message: string, code: string) {
        super(message)
        this.code = code
      }
    }

    const result = await tryCatch(
      async () => { throw new Error('Original error') },
      (error) => new CustomError('Handled error', 'E001')
    )

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CustomError)
      expect(result.error.message).toBe('Handled error')
      expect(result.error.code).toBe('E001')
    }
  })
})

describe('tryCatchSync', () => {
  test('handles successful sync operations', () => {
    const result = tryCatchSync(() => 'success')
    
    expect(result.success).toBe(true)
    expect(result.data).toBe('success')
    expect(result.error).toBeNull()
  })

  test('handles sync operation failures', () => {
    const error = new Error('Sync operation failed')
    const result = tryCatchSync(() => {
      throw error
    })

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    if (!result.success) {
      expect(result.error).toBe(error)
    }
  })

  test('handles non-Error throws in sync operations', () => {
    const result = tryCatchSync(() => {
      throw 'string error'
    })

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error.message).toBe('string error')
    }
  })

  test('uses custom error handler for sync operations', () => {
    class CustomError extends Error {
      code: string
      constructor(message: string, code: string) {
        super(message)
        this.code = code
      }
    }

    const result = tryCatchSync(
      () => { throw new Error('Original error') },
      (error) => new CustomError('Handled error', 'E001')
    )

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    if (!result.success) {
      expect(result.error).toBeInstanceOf(CustomError)
      expect(result.error.message).toBe('Handled error')
      expect(result.error.code).toBe('E001')
    }
  })
})

describe('Type Safety', () => {
  test('maintains type safety for successful operations', async () => {
    interface User { id: number; name: string }
    const user: User = { id: 1, name: 'Test' }

    const asyncResult = await tryCatch(async () => user)
    if (asyncResult.success) {
      expect(asyncResult.data.id).toBe(1)
      expect(asyncResult.data.name).toBe('Test')
    }

    const syncResult = tryCatchSync(() => user)
    if (syncResult.success) {
      expect(syncResult.data.id).toBe(1)
      expect(syncResult.data.name).toBe('Test')
    }
  })

  test('maintains type safety for custom errors', async () => {
    class CustomError extends Error {
      code: string
      constructor(code: string) {
        super(`Error code: ${code}`)
        this.code = code
      }
    }

    const asyncResult = await tryCatch<string, CustomError>(
      async () => { throw new Error('fail') },
      () => new CustomError('E001')
    )
    
    if (!asyncResult.success) {
      expect(asyncResult.error.code).toBe('E001')
    }

    const syncResult = tryCatchSync<string, CustomError>(
      () => { throw new Error('fail') },
      () => new CustomError('E001')
    )
    
    if (!syncResult.success) {
      expect(syncResult.error.code).toBe('E001')
    }
  })
}) 