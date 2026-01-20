import { z } from 'zod';

/**
 * User validation schemas (Manual Ch 2, Ch 35)
 *
 * These schemas validate user-related inputs including
 * profile updates and mode switching.
 */

// ============================================================================
// Mode Switch Schema
// ============================================================================

export const modeSwitchSchema = z.object({
  mode: z.enum(['FAMILY', 'PROVIDER'], {
    errorMap: () => ({
      message: 'Invalid mode. Must be FAMILY or PROVIDER',
    }),
  }),
});

export type ModeSwitchInput = z.infer<typeof modeSwitchSchema>;

// ============================================================================
// Profile Update Schema
// ============================================================================

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
    .optional()
    .nullable()
    .transform(val => val || null),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ============================================================================
// Family Profile Schema
// ============================================================================

export const familyProfileSchema = z.object({
  lovedOneName: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters')
    .trim()
    .optional(),
  ageRange: z
    .string()
    .optional(),
  gender: z
    .enum(['Male', 'Female', 'Other', 'Prefer not to say'])
    .optional(),
  careTypes: z
    .array(z.string())
    .min(1, 'At least one care type is required')
    .optional(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be at most 100 characters')
    .trim()
    .optional(),
  state: z
    .string()
    .min(2, 'State is required')
    .max(2, 'State must be 2 characters')
    .toUpperCase()
    .optional(),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
    .optional(),
  budgetMin: z
    .number()
    .min(0, 'Budget minimum must be positive')
    .optional(),
  budgetMax: z
    .number()
    .min(0, 'Budget maximum must be positive')
    .optional(),
  timeline: z
    .string()
    .optional(),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  medicalConditions: z
    .array(z.string())
    .optional(),
  livingSituation: z
    .string()
    .optional(),
  careLevel: z
    .enum(['minimal', 'moderate', 'extensive', 'memory'])
    .optional(),
  mobilityStatus: z
    .enum(['independent', 'cane', 'walker', 'wheelchair', 'bedridden'])
    .optional(),
}).refine(
  (data) => {
    if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
      return data.budgetMin <= data.budgetMax;
    }
    return true;
  },
  {
    message: 'Budget minimum must be less than or equal to budget maximum',
    path: ['budgetMax'],
  }
);

export type FamilyProfileInput = z.infer<typeof familyProfileSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate mode switch input
 */
export function validateModeSwitch(data: unknown) {
  return modeSwitchSchema.safeParse(data);
}

/**
 * Validate profile update input
 */
export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.safeParse(data);
}

/**
 * Validate family profile input
 */
export function validateFamilyProfile(data: unknown) {
  return familyProfileSchema.safeParse(data);
}
