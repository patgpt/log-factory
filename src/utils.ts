import * as path from 'path'
import type { Bytes, SafePath } from './types'

// Helper functions for type safety
export const createSafePath = (filePath: string): SafePath => {
  // Normalize the path to handle any platform-specific separators
  const normalizedPath = path.normalize(filePath)
  // Ensure absolute paths are handled correctly
  const safePath = path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.resolve(process.cwd(), normalizedPath)
  return safePath as SafePath
}

export const getDefaultLogPath = (): SafePath => {
  const cwd = createSafePath(process.cwd())
  return joinSafePaths(cwd, 'logs')
}

export const joinSafePaths = (...paths: (string | SafePath)[]): SafePath => {
  return createSafePath(path.join(...paths.map(p => p.toString())))
}

export const createSafePathWithSuffix = (basePath: SafePath, suffix: string): SafePath => {
  return createSafePath(`${basePath}${suffix}`)
}

export const createBytes = (bytes: number): Bytes => {
  if (bytes < 0) {
    throw new Error('Bytes cannot be negative')
  }
  return bytes as Bytes
}

export const MB = (size: number): Bytes => createBytes(size * 1024 * 1024) 