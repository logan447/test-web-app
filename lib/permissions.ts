import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Permission check results
 */
export type PermissionCheck = {
  allowed: boolean;
  reason?: string;
  requiresVerification?: boolean;
  providerId?: string;
  verificationStatus?: string;
};

/**
 * Check if user can edit provider profile
 * Requires:
 * - User is authenticated
 * - User has claimed a provider profile
 * - Provider profile is verified (verificationStatus = 'verified')
 */
export async function canEditProviderProfile(userId: string): Promise<PermissionCheck> {
  try {
    const provider = await prisma.provider.findFirst({
      where: {
        userId,
        claimed: true,
      },
      select: {
        id: true,
        verificationStatus: true,
        verified: true,
      },
    });

    if (!provider) {
      return {
        allowed: false,
        reason: 'No provider profile found',
      };
    }

    const isVerified = provider.verificationStatus === 'verified' || provider.verified === true;

    if (!isVerified) {
      return {
        allowed: false,
        reason: 'Provider profile requires verification',
        requiresVerification: true,
        providerId: provider.id,
        verificationStatus: provider.verificationStatus || 'pending',
      };
    }

    return {
      allowed: true,
      providerId: provider.id,
    };
  } catch (error) {
    console.error('Error checking provider edit permission:', error);
    return {
      allowed: false,
      reason: 'Error checking permissions',
    };
  }
}

/**
 * Check if user can view leads/inquiries
 * Requires same permissions as editing profile
 */
export async function canViewProviderLeads(userId: string): Promise<PermissionCheck> {
  return canEditProviderProfile(userId);
}

/**
 * Check if user can respond to consult requests
 * Requires same permissions as editing profile
 */
export async function canRespondToConsultRequests(userId: string): Promise<PermissionCheck> {
  return canEditProviderProfile(userId);
}

/**
 * Get verification status for the current session user
 */
export async function getCurrentUserVerificationStatus() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        authenticated: false,
        hasProvider: false,
        isVerified: false,
      };
    }

    const provider = await prisma.provider.findFirst({
      where: {
        userId: session.user.id,
        claimed: true,
      },
      select: {
        id: true,
        name: true,
        verificationStatus: true,
        verified: true,
        email: true,
      },
    });

    if (!provider) {
      return {
        authenticated: true,
        hasProvider: false,
        isVerified: false,
      };
    }

    const isVerified = provider.verificationStatus === 'verified' || provider.verified === true;

    return {
      authenticated: true,
      hasProvider: true,
      isVerified,
      providerId: provider.id,
      providerName: provider.name,
      verificationStatus: provider.verificationStatus,
      email: provider.email,
    };
  } catch (error) {
    console.error('Error getting verification status:', error);
    return {
      authenticated: false,
      hasProvider: false,
      isVerified: false,
      error: 'Failed to check verification status',
    };
  }
}

/**
 * Middleware helper to enforce provider verification
 * Use this in API routes that require verified provider access
 */
export async function requireVerifiedProvider(): Promise<{
  success: boolean;
  userId?: string;
  providerId?: string;
  error?: string;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized - please sign in',
    };
  }

  const permissionCheck = await canEditProviderProfile(session.user.id);

  if (!permissionCheck.allowed) {
    if (permissionCheck.requiresVerification) {
      return {
        success: false,
        error: 'Provider profile requires verification. Please check your email for the verification link.',
      };
    }

    return {
      success: false,
      error: permissionCheck.reason || 'Access denied',
    };
  }

  return {
    success: true,
    userId: session.user.id,
    providerId: permissionCheck.providerId,
  };
}
