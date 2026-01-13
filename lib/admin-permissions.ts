import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Check if the current user is an admin
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return false;
      }
      targetUserId = session.user.id;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true },
    });

    return user?.role === 'ADMIN';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Require admin access - throws error if not admin
 * Use this in API routes that require admin access
 */
export async function requireAdmin(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized - please sign in',
    };
  }

  const adminStatus = await isAdmin(session.user.id);

  if (!adminStatus) {
    return {
      success: false,
      error: 'Forbidden - admin access required',
    };
  }

  return {
    success: true,
    userId: session.user.id,
  };
}
