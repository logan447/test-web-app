/**
 * Validation Schemas
 *
 * Central export for all validation schemas.
 * Use these for both client-side and server-side validation.
 *
 * @example
 * // Server-side validation
 * import { validateLogin } from '@/lib/validations';
 * const result = validateLogin(requestBody);
 * if (!result.success) {
 *   return { error: result.error.flatten() };
 * }
 *
 * @example
 * // Client-side validation (react-hook-form)
 * import { loginSchema } from '@/lib/validations';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * const form = useForm({ resolver: zodResolver(loginSchema) });
 */

// Auth schemas
export {
  loginSchema,
  signupSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  validateLogin,
  validateSignup,
  type LoginInput,
  type SignupInput,
  type PasswordResetRequestInput,
  type PasswordResetInput,
} from './auth';

// User schemas
export {
  modeSwitchSchema,
  profileUpdateSchema,
  familyProfileSchema,
  validateModeSwitch,
  validateProfileUpdate,
  validateFamilyProfile,
  type ModeSwitchInput,
  type ProfileUpdateInput,
  type FamilyProfileInput,
} from './user';

// Provider schemas
export {
  providerTypeSchema,
  careTypeSchema,
  providerIdentitySchema,
  providerBasicSchema,
  providerLocationSchema,
  providerServicesSchema,
  providerPricingSchema,
  providerCreateSchema,
  validateProviderIdentity,
  validateProviderCreate,
  validateProviderBasic,
  providerTypes,
  careTypes,
  type ProviderIdentityInput,
  type ProviderBasicInput,
  type ProviderLocationInput,
  type ProviderServicesInput,
  type ProviderPricingInput,
  type ProviderCreateInput,
} from './provider';
