import type { ApiValidationErrors } from '@/types/api'

/** Thrown for any non-2xx response so callers handle errors in one consistent way. */
export class ApiError extends Error {
  status: number
  fieldErrors: ApiValidationErrors
  code?: string
  constructor(status: number, message: string, fieldErrors: ApiValidationErrors = {}, code?: string) {
    super(message)
    this.code = code
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
  get isUnauthenticated() { return this.status === 401 }
  get isForbidden() { return this.status === 403 }
  get isValidation() { return this.status === 422 }
}
