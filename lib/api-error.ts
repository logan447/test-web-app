import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard API Error Response Format (Manual Ch 35)
 *
 * All API errors follow this structure:
 * {
 *   success: false,
 *   error: {
 *     code: string,      // Machine-readable error code (e.g., "UNAUTHORIZED")
 *     message: string,   // Human-readable error message
 *     details?: object   // Optional additional details
 *   }
 * }
 *
 * Success responses follow:
 * {
 *   success: true,
 *   data: T
 * }
 */

// ============================================================================
// Types
// ============================================================================

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Error Codes
// ============================================================================

export const ErrorCodes = {
  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_MODE: 'INVALID_MODE',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',

  // Not found errors (404)
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',

  // Conflict errors (409)
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',

  // Rate limiting (429)
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ============================================================================
// Error Class
// ============================================================================

export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON(): ApiErrorBody {
    return {
      code: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }

  toResponse(): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      { success: false as const, error: this.toJSON() },
      { status: this.statusCode }
    );
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create an unauthorized error (401)
 */
export function unauthorizedError(message: string = 'Authentication required') {
  return new ApiError(ErrorCodes.UNAUTHORIZED, message, 401);
}

/**
 * Create a forbidden error (403)
 */
export function forbiddenError(message: string = 'Access denied') {
  return new ApiError(ErrorCodes.FORBIDDEN, message, 403);
}

/**
 * Create a validation error (400)
 */
export function validationError(
  message: string,
  details?: Record<string, unknown>
) {
  return new ApiError(ErrorCodes.VALIDATION_ERROR, message, 400, details);
}

/**
 * Create a not found error (404)
 */
export function notFoundError(
  resource: string = 'Resource',
  message?: string
) {
  return new ApiError(
    ErrorCodes.NOT_FOUND,
    message || `${resource} not found`,
    404
  );
}

/**
 * Create a conflict error (409)
 */
export function conflictError(message: string, details?: Record<string, unknown>) {
  return new ApiError(ErrorCodes.CONFLICT, message, 409, details);
}

/**
 * Create a rate limit error (429)
 */
export function rateLimitError(message: string = 'Too many requests') {
  return new ApiError(ErrorCodes.RATE_LIMITED, message, 429);
}

/**
 * Create an internal error (500)
 */
export function internalError(message: string = 'An unexpected error occurred') {
  return new ApiError(ErrorCodes.INTERNAL_ERROR, message, 500);
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Create a success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true as const, data }, { status });
}

/**
 * Create an error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error: { code, message, ...(details && { details }) },
    },
    { status }
  );
}

/**
 * Handle Zod validation errors
 */
export function zodErrorResponse(error: ZodError): NextResponse<ApiErrorResponse> {
  const firstError = error.errors[0];
  return errorResponse(
    ErrorCodes.VALIDATION_ERROR,
    firstError?.message || 'Validation failed',
    400,
    { fieldErrors: error.flatten().fieldErrors }
  );
}

/**
 * Handle unknown errors (catch-all for try/catch)
 */
export function handleError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return error.toResponse();
  }

  if (error instanceof ZodError) {
    return zodErrorResponse(error);
  }

  if (error instanceof Error) {
    // Don't expose internal error messages to clients
    return internalError().toResponse();
  }

  return internalError().toResponse();
}
