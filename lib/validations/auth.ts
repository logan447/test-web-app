import { z } from 'zod';

/**
 * Auth validation schemas (Manual Ch 1, Ch 35)
 *
 * These schemas validate authentication-related inputs
 * and can be used on both client and server.
 */

// ============================================================================
// Shared Constants
// ============================================================================

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;

// ============================================================================
// Login Schema
// ============================================================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// Signup Schema
// ============================================================================

export const signupSchema = z.object({
  name: z
    .string()
    .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters`)
    .max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters`)
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  phone: z
    .string()
    .optional()
    .transform(val => val || null),
  role: z
    .enum(['FAMILY', 'PROVIDER'])
    .default('FAMILY'),
  intent: z
    .enum(['family', 'provider'])
    .optional()
    .default('family'),
});

export type SignupInput = z.infer<typeof signupSchema>;

// ============================================================================
// Password Reset Request Schema
// ============================================================================

export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

// ============================================================================
// Password Reset Schema
// ============================================================================

export const passwordResetSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate login input and return result
 */
export function validateLogin(data: unknown) {
  return loginSchema.safeParse(data);
}

/**
 * Validate signup input and return result
 */
export function validateSignup(data: unknown) {
  return signupSchema.safeParse(data);
}
