import { vi } from 'vitest';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

/**
 * Test utilities for Olera platform
 *
 * These utilities simplify common testing patterns and provide
 * consistent mocking across tests.
 */

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Create a mock user object
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'FAMILY',
    activeMode: 'FAMILY',
    ...overrides,
  };
}

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'FAMILY' | 'PROVIDER' | 'ADMIN';
  activeMode: 'FAMILY' | 'PROVIDER';
}

/**
 * Create a mock session object
 */
export function createMockSession(user?: Partial<MockUser>) {
  return {
    user: createMockUser(user),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Create a mock provider identity
 */
export function createMockProviderIdentity(overrides: Partial<MockProviderIdentity> = {}): MockProviderIdentity {
  return {
    id: 'test-identity-id',
    userId: 'test-user-id',
    type: 'ORGANIZATION',
    onboardingComplete: false,
    providerId: null,
    ...overrides,
  };
}

interface MockProviderIdentity {
  id: string;
  userId: string;
  type: 'ORGANIZATION' | 'INDIVIDUAL';
  onboardingComplete: boolean;
  providerId: string | null;
}

/**
 * Create a mock family profile
 */
export function createMockFamilyProfile(overrides: Partial<MockFamilyProfile> = {}): MockFamilyProfile {
  return {
    id: 'test-profile-id',
    userId: 'test-user-id',
    lovedOneName: 'Test Loved One',
    careTypes: ['PERSONAL_CARE'],
    city: 'San Diego',
    state: 'CA',
    budgetMin: 3000,
    budgetMax: 5000,
    timeline: 'Within 3 months',
    description: 'Test description',
    ...overrides,
  };
}

interface MockFamilyProfile {
  id: string;
  userId: string;
  lovedOneName: string;
  careTypes: string[];
  city: string;
  state: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  description: string;
}

// ============================================================================
// API Response Helpers
// ============================================================================

/**
 * Create a mock successful API response
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
  };
}

/**
 * Create a mock error API response
 */
export function createErrorResponse(code: string, message: string, details?: object) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Mock a fetch response
 */
export function mockFetchResponse(data: unknown, options: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = options;

  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  });
}

/**
 * Mock a fetch error
 */
export function mockFetchError(message: string) {
  return vi.fn().mockRejectedValue(new Error(message));
}

// ============================================================================
// Custom Render Wrapper
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: ReturnType<typeof createMockSession> | null;
}

/**
 * Custom render function with providers
 *
 * Usage:
 * const { getByText } = customRender(<MyComponent />);
 */
export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { session = null, ...renderOptions } = options;

  // We could wrap with providers here if needed
  // For now, just render directly
  return render(ui, renderOptions);
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };
