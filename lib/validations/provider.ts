import { z } from 'zod';

/**
 * Provider validation schemas (Manual Ch 8, Ch 35)
 *
 * These schemas validate provider-related inputs including
 * identity creation and profile updates.
 */

// ============================================================================
// Provider Type Enum
// ============================================================================

export const providerTypes = [
  'ASSISTED_LIVING_FACILITY',
  'MEMORY_CARE_FACILITY',
  'INDEPENDENT_LIVING_FACILITY',
  'NURSING_HOME',
  'HOME_CARE_AGENCY',
  'HOSPICE_PROVIDER',
  'ADULT_DAY_CARE',
  'REHABILITATION_CENTER',
  'INDEPENDENT_CAREGIVER',
] as const;

export const providerTypeSchema = z.enum(providerTypes);

// ============================================================================
// Care Type Enum
// ============================================================================

export const careTypes = [
  'PERSONAL_CARE',
  'COMPANION_CARE',
  'SKILLED_NURSING',
  'MEMORY_CARE',
  'RESPITE_CARE',
  'HOSPICE_CARE',
  'PHYSICAL_THERAPY',
  'OCCUPATIONAL_THERAPY',
  'SPEECH_THERAPY',
  'MEAL_PREPARATION',
  'TRANSPORTATION',
  'HOUSEKEEPING',
  'MEDICATION_MANAGEMENT',
] as const;

export const careTypeSchema = z.enum(careTypes);

// ============================================================================
// Provider Identity Schema
// ============================================================================

export const providerIdentitySchema = z.object({
  type: z.enum(['ORGANIZATION', 'INDIVIDUAL'], {
    errorMap: () => ({
      message: 'Type must be ORGANIZATION or INDIVIDUAL',
    }),
  }),
});

export type ProviderIdentityInput = z.infer<typeof providerIdentitySchema>;

// ============================================================================
// Provider Profile Schema (Basic)
// ============================================================================

export const providerBasicSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be at most 200 characters')
    .trim(),
  providerType: providerTypeSchema,
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be at most 5000 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email address'),
  phone: z
    .string()
    .min(10, 'Phone number is required')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  website: z
    .string()
    .url('Invalid website URL')
    .optional()
    .nullable(),
});

export type ProviderBasicInput = z.infer<typeof providerBasicSchema>;

// ============================================================================
// Provider Location Schema
// ============================================================================

export const providerLocationSchema = z.object({
  address: z
    .string()
    .min(5, 'Address is required')
    .max(200, 'Address must be at most 200 characters'),
  city: z
    .string()
    .min(2, 'City is required')
    .max(100, 'City must be at most 100 characters'),
  state: z
    .string()
    .length(2, 'State must be 2 characters')
    .toUpperCase(),
  zipCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  serviceRadius: z
    .number()
    .min(1, 'Service radius must be at least 1 mile')
    .max(500, 'Service radius must be at most 500 miles')
    .optional(),
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),
});

export type ProviderLocationInput = z.infer<typeof providerLocationSchema>;

// ============================================================================
// Provider Services Schema
// ============================================================================

export const providerServicesSchema = z.object({
  careTypesOffered: z
    .array(careTypeSchema)
    .min(1, 'At least one care type is required'),
  capacity: z
    .number()
    .min(1, 'Capacity must be at least 1')
    .optional(),
  acceptingNewClients: z
    .boolean()
    .default(true),
});

export type ProviderServicesInput = z.infer<typeof providerServicesSchema>;

// ============================================================================
// Provider Pricing Schema
// ============================================================================

export const providerPricingSchema = z.object({
  priceMin: z
    .number()
    .min(0, 'Price must be positive')
    .optional(),
  priceMax: z
    .number()
    .min(0, 'Price must be positive')
    .optional(),
  pricingNotes: z
    .string()
    .max(1000, 'Pricing notes must be at most 1000 characters')
    .optional(),
  acceptsMedicaid: z
    .boolean()
    .optional(),
  acceptsMedicare: z
    .boolean()
    .optional(),
  acceptsPrivatePay: z
    .boolean()
    .optional(),
  acceptsLongTermCareInsurance: z
    .boolean()
    .optional(),
}).refine(
  (data) => {
    if (data.priceMin !== undefined && data.priceMax !== undefined) {
      return data.priceMin <= data.priceMax;
    }
    return true;
  },
  {
    message: 'Minimum price must be less than or equal to maximum price',
    path: ['priceMax'],
  }
);

export type ProviderPricingInput = z.infer<typeof providerPricingSchema>;

// ============================================================================
// Provider Pricing Base Schema (without refine)
// ============================================================================

export const providerPricingBaseSchema = z.object({
  priceMin: z
    .number()
    .min(0, 'Price must be positive')
    .optional(),
  priceMax: z
    .number()
    .min(0, 'Price must be positive')
    .optional(),
  pricingNotes: z
    .string()
    .max(1000, 'Pricing notes must be at most 1000 characters')
    .optional(),
  acceptsMedicaid: z
    .boolean()
    .optional(),
  acceptsMedicare: z
    .boolean()
    .optional(),
  acceptsPrivatePay: z
    .boolean()
    .optional(),
  acceptsLongTermCareInsurance: z
    .boolean()
    .optional(),
});

// ============================================================================
// Full Provider Profile Schema (Create)
// ============================================================================

export const providerCreateSchema = providerBasicSchema
  .merge(providerLocationSchema)
  .merge(providerServicesSchema)
  .merge(providerPricingBaseSchema.partial());

export type ProviderCreateInput = z.infer<typeof providerCreateSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate provider identity creation input
 */
export function validateProviderIdentity(data: unknown) {
  return providerIdentitySchema.safeParse(data);
}

/**
 * Validate provider profile creation input
 */
export function validateProviderCreate(data: unknown) {
  return providerCreateSchema.safeParse(data);
}

/**
 * Validate provider basic info input
 */
export function validateProviderBasic(data: unknown) {
  return providerBasicSchema.safeParse(data);
}
