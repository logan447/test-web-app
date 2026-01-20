/**
 * Client-side Error Handling Utilities
 *
 * These utilities help handle API errors in the frontend,
 * providing user-friendly error messages and consistent error handling.
 */

import { showToast } from './toast';

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
// User-Friendly Error Messages
// ============================================================================

const userFriendlyMessages: Record<string, string> = {
  // Auth errors
  UNAUTHORIZED: 'Please sign in to continue',
  INVALID_TOKEN: 'Your session has expired. Please sign in again',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',

  // Permission errors
  FORBIDDEN: "You don't have permission to perform this action",
  INSUFFICIENT_PERMISSIONS: "You don't have the required permissions",

  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again',
  INVALID_INPUT: 'The provided information is invalid',
  INVALID_MODE: 'Invalid mode selected',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Please enter a valid password',

  // Not found errors
  NOT_FOUND: 'The requested item was not found',
  USER_NOT_FOUND: 'User not found',
  PROVIDER_NOT_FOUND: 'Provider not found',
  PROFILE_NOT_FOUND: 'Profile not found',

  // Conflict errors
  CONFLICT: 'A conflict occurred. Please try again',
  ALREADY_EXISTS: 'This item already exists',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',

  // Rate limiting
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again',

  // Server errors
  INTERNAL_ERROR: 'Something went wrong. Please try again later',
  DATABASE_ERROR: 'A database error occurred. Please try again later',
};

// ============================================================================
// Error Handling Functions
// ============================================================================

/**
 * Get a user-friendly message for an error code
 */
export function getUserFriendlyMessage(code: string, fallback?: string): string {
  return userFriendlyMessages[code] || fallback || 'An unexpected error occurred';
}

/**
 * Extract error from API response
 */
export function getApiError(response: ApiResponse<unknown>): ApiErrorBody | null {
  if (!response.success) {
    return response.error;
  }
  return null;
}

/**
 * Check if response is an error
 */
export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

/**
 * Parse error from fetch response
 */
export async function parseApiError(
  response: Response
): Promise<ApiErrorBody | null> {
  try {
    const data = await response.json();
    if (isApiError(data)) {
      return data.error;
    }
    return null;
  } catch {
    return {
      code: 'UNKNOWN_ERROR',
      message: response.statusText || 'Unknown error occurred',
    };
  }
}

// ============================================================================
// Error Display Helpers
// ============================================================================

/**
 * Show toast notification for API error
 */
export function showApiErrorToast(error: ApiErrorBody): void {
  const message = getUserFriendlyMessage(error.code, error.message);
  showToast.error(message);
}

/**
 * Handle fetch response and show error if needed
 * Returns the parsed data on success, null on error
 */
export async function handleApiResponse<T>(
  response: Response,
  options: {
    showErrorToast?: boolean;
    throwOnError?: boolean;
  } = {}
): Promise<T | null> {
  const { showErrorToast = true, throwOnError = false } = options;

  try {
    const data = await response.json();

    if (!response.ok || isApiError(data)) {
      const error = isApiError(data)
        ? data.error
        : { code: 'HTTP_ERROR', message: response.statusText };

      if (showErrorToast) {
        showApiErrorToast(error);
      }

      if (throwOnError) {
        throw new ApiClientError(error.code, error.message, error.details);
      }

      return null;
    }

    // Type guard for success response
    if ('success' in data && data.success && 'data' in data) {
      return data.data as T;
    }

    // Direct data response (legacy format)
    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (showErrorToast) {
      showToast.error('Failed to process response');
    }

    if (throwOnError) {
      throw error;
    }

    return null;
  }
}

/**
 * Fetch wrapper with error handling
 */
export async function apiFetch<T>(
  url: string,
  options: RequestInit & {
    showErrorToast?: boolean;
    throwOnError?: boolean;
  } = {}
): Promise<T | null> {
  const { showErrorToast = true, throwOnError = false, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    return handleApiResponse<T>(response, { showErrorToast, throwOnError });
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    if (showErrorToast) {
      showToast.error('Network error. Please check your connection');
    }

    if (throwOnError) {
      throw error;
    }

    return null;
  }
}

// ============================================================================
// Error Class
// ============================================================================

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.details = details;
  }

  get userMessage(): string {
    return getUserFriendlyMessage(this.code, this.message);
  }
}
