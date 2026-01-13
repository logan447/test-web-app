import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Generate a secure random verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a verification token for a provider claim
 * @param providerId - The provider profile ID
 * @param userId - The user ID claiming the profile
 * @param email - The email to verify
 * @returns The created verification token record
 */
export async function createProviderVerificationToken(
  providerId: string,
  userId: string,
  email: string
) {
  const token = generateVerificationToken();

  // Token expires in 48 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  const verificationToken = await prisma.providerVerificationToken.create({
    data: {
      providerId,
      userId,
      token,
      email,
      expiresAt,
    },
  });

  return verificationToken;
}

/**
 * Send verification email to the provider
 * @param email - Email address to send to
 * @param token - Verification token
 * @param providerName - Name of the provider organization
 */
export async function sendProviderVerificationEmail(
  email: string,
  token: string,
  providerName: string
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-provider?token=${token}`;

  // TODO: Replace with actual email service (SendGrid, AWS SES, Resend, etc.)
  // For now, log to console for development
  console.log('='.repeat(80));
  console.log('PROVIDER VERIFICATION EMAIL');
  console.log('='.repeat(80));
  console.log(`To: ${email}`);
  console.log(`Subject: Verify Your Claim to ${providerName}`);
  console.log('');
  console.log(`Hi there,`);
  console.log('');
  console.log(`You recently claimed the profile for "${providerName}" on Olera.`);
  console.log('');
  console.log(`To verify your ownership and unlock full access, please click the link below:`);
  console.log('');
  console.log(verificationUrl);
  console.log('');
  console.log(`This link will expire in 48 hours.`);
  console.log('');
  console.log(`If you didn't make this request, please ignore this email.`);
  console.log('');
  console.log('Best,');
  console.log('The Olera Team');
  console.log('='.repeat(80));

  // In production, replace with:
  /*
  await emailService.send({
    to: email,
    subject: `Verify Your Claim to ${providerName}`,
    html: `
      <h1>Verify Your Provider Claim</h1>
      <p>You recently claimed the profile for "${providerName}" on Olera.</p>
      <p>To verify your ownership and unlock full access, please click the button below:</p>
      <a href="${verificationUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        Verify My Claim
      </a>
      <p>Or copy and paste this link: ${verificationUrl}</p>
      <p>This link will expire in 48 hours.</p>
      <p>If you didn't make this request, please ignore this email.</p>
    `,
  });
  */

  return { success: true };
}

/**
 * Verify a provider claim token
 * @param token - The verification token
 * @returns The verification token record if valid
 */
export async function verifyProviderToken(token: string) {
  const verificationToken = await prisma.providerVerificationToken.findUnique({
    where: { token },
    include: {
      provider: true,
      user: true,
    },
  });

  if (!verificationToken) {
    throw new Error('Invalid verification token');
  }

  if (verificationToken.verified) {
    throw new Error('This verification link has already been used');
  }

  if (new Date() > verificationToken.expiresAt) {
    throw new Error('This verification link has expired. Please request a new one.');
  }

  // Mark token as verified
  await prisma.providerVerificationToken.update({
    where: { id: verificationToken.id },
    data: {
      verified: true,
      verifiedAt: new Date(),
    },
  });

  // Update provider verification status
  await prisma.provider.update({
    where: { id: verificationToken.providerId },
    data: {
      verificationStatus: 'verified',
      verified: true,
    },
  });

  return verificationToken;
}

/**
 * Check if a provider claim is verified
 * @param providerId - The provider ID
 * @returns Boolean indicating if the provider is verified
 */
export async function isProviderVerified(providerId: string): Promise<boolean> {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { verificationStatus: true, verified: true },
  });

  return provider?.verificationStatus === 'verified' || provider?.verified === true;
}

/**
 * Get verification status for a provider
 * @param userId - The user ID
 * @returns Verification status object
 */
export async function getProviderVerificationStatus(userId: string) {
  const provider = await prisma.provider.findFirst({
    where: { userId, claimed: true },
    select: {
      id: true,
      name: true,
      verificationStatus: true,
      verified: true,
      email: true,
    },
  });

  if (!provider) {
    return { hasProvider: false };
  }

  const isVerified = provider.verificationStatus === 'verified' || provider.verified === true;

  return {
    hasProvider: true,
    providerId: provider.id,
    providerName: provider.name,
    isVerified,
    verificationStatus: provider.verificationStatus,
    email: provider.email,
  };
}
