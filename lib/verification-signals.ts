/**
 * Verification Signals System
 *
 * Calculates trust signals for provider claim verification
 * Inspired by Yelp, Airbnb, Zillow verification systems
 */

import { prisma } from '@/lib/prisma';

export type VerificationSignals = {
  // Overall assessment
  overallScore: number; // 0-100
  autoApprove: boolean;
  requiresManualReview: boolean;

  // Individual signals
  signals: {
    emailDomainMatch: SignalResult;
    emailVerified: SignalResult;
    professionalEmail: SignalResult;
    nameSimilarity: SignalResult;
    accountAge: SignalResult;
    multipleAttempts: SignalResult;
  };

  // Summary
  strengths: string[];
  concerns: string[];
  recommendation: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'AUTO_REJECT';
};

type SignalResult = {
  score: number; // 0-100
  status: 'strong' | 'moderate' | 'weak' | 'fail';
  detail: string;
};

/**
 * Calculate all verification signals for a claim
 */
export async function calculateVerificationSignals(
  userEmail: string,
  userName: string,
  providerId: string,
  userId: string
): Promise<VerificationSignals> {
  // Fetch provider data
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      name: true,
      email: true,
      website: true,
      phone: true,
      providerType: true,
    },
  });

  if (!provider) {
    throw new Error('Provider not found');
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check for previous claim attempts
  const previousAttempts = await prisma.claimAttempt.findMany({
    where: {
      providerProfileId: providerId,
      NOT: { userId },
    },
  });

  // Calculate individual signals
  const emailDomainMatch = calculateEmailDomainMatch(
    userEmail,
    provider.email,
    provider.website
  );

  const emailVerified = calculateEmailVerified(true); // Assuming email is verified on signup

  const professionalEmail = calculateProfessionalEmail(userEmail);

  const nameSimilarity = calculateNameSimilarity(userName, provider.name);

  const accountAge = calculateAccountAge(user.createdAt);

  const multipleAttempts = calculateMultipleAttempts(previousAttempts.length);

  // Aggregate scores
  const signals = {
    emailDomainMatch,
    emailVerified,
    professionalEmail,
    nameSimilarity,
    accountAge,
    multipleAttempts,
  };

  // Calculate overall score (weighted average)
  const weights = {
    emailDomainMatch: 0.30,    // 30% - strongest signal
    emailVerified: 0.20,        // 20%
    professionalEmail: 0.15,    // 15%
    nameSimilarity: 0.15,       // 15%
    accountAge: 0.10,           // 10%
    multipleAttempts: 0.10,     // 10%
  };

  const overallScore = Math.round(
    emailDomainMatch.score * weights.emailDomainMatch +
    emailVerified.score * weights.emailVerified +
    professionalEmail.score * weights.professionalEmail +
    nameSimilarity.score * weights.nameSimilarity +
    accountAge.score * weights.accountAge +
    multipleAttempts.score * weights.multipleAttempts
  );

  // Determine recommendation
  const { recommendation, autoApprove, requiresManualReview } = determineRecommendation(
    overallScore,
    signals
  );

  // Build strengths and concerns
  const strengths: string[] = [];
  const concerns: string[] = [];

  Object.entries(signals).forEach(([key, signal]) => {
    if (signal.status === 'strong') {
      strengths.push(signal.detail);
    } else if (signal.status === 'weak' || signal.status === 'fail') {
      concerns.push(signal.detail);
    }
  });

  return {
    overallScore,
    autoApprove,
    requiresManualReview,
    signals,
    strengths,
    concerns,
    recommendation,
  };
}

/**
 * Check if user email domain matches provider email/website domain
 */
function calculateEmailDomainMatch(
  userEmail: string,
  providerEmail: string,
  providerWebsite: string | null
): SignalResult {
  const userDomain = extractDomain(userEmail);
  const providerEmailDomain = extractDomain(providerEmail);
  const websiteDomain = providerWebsite ? extractDomain(providerWebsite) : null;

  // Exact domain match
  if (userDomain === providerEmailDomain || userDomain === websiteDomain) {
    return {
      score: 100,
      status: 'strong',
      detail: `Email domain matches provider domain (@${userDomain})`,
    };
  }

  // Subdomain match (e.g., user@hr.company.com, provider@company.com)
  const userBaseDomain = extractBaseDomain(userDomain);
  const providerBaseDomain = extractBaseDomain(providerEmailDomain);
  const websiteBaseDomain = websiteDomain ? extractBaseDomain(websiteDomain) : null;

  if (
    userBaseDomain === providerBaseDomain ||
    userBaseDomain === websiteBaseDomain
  ) {
    return {
      score: 85,
      status: 'strong',
      detail: `Email domain closely matches provider domain (${userBaseDomain})`,
    };
  }

  return {
    score: 0,
    status: 'fail',
    detail: 'Email domain does not match provider domain',
  };
}

/**
 * Check if email is verified
 */
function calculateEmailVerified(isVerified: boolean): SignalResult {
  if (isVerified) {
    return {
      score: 100,
      status: 'strong',
      detail: 'Email address verified',
    };
  }

  return {
    score: 0,
    status: 'fail',
    detail: 'Email address not verified',
  };
}

/**
 * Check if email uses professional domain (not Gmail, Yahoo, etc.)
 */
function calculateProfessionalEmail(email: string): SignalResult {
  const domain = extractDomain(email);
  const genericDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'mail.com',
    'protonmail.com',
  ];

  if (genericDomains.includes(domain.toLowerCase())) {
    return {
      score: 20,
      status: 'weak',
      detail: `Generic email provider (${domain})`,
    };
  }

  return {
    score: 100,
    status: 'strong',
    detail: `Professional business email (@${domain})`,
  };
}

/**
 * Calculate similarity between user name and provider name
 * Uses Levenshtein distance
 */
function calculateNameSimilarity(userName: string, providerName: string): SignalResult {
  const similarity = calculateStringSimilarity(
    userName.toLowerCase().trim(),
    providerName.toLowerCase().trim()
  );

  if (similarity >= 0.8) {
    return {
      score: 100,
      status: 'strong',
      detail: 'Name strongly matches provider name',
    };
  }

  if (similarity >= 0.5) {
    return {
      score: 70,
      status: 'moderate',
      detail: 'Name partially matches provider name',
    };
  }

  if (similarity >= 0.3) {
    return {
      score: 40,
      status: 'weak',
      detail: 'Name weakly matches provider name',
    };
  }

  return {
    score: 0,
    status: 'fail',
    detail: 'Name does not match provider name',
  };
}

/**
 * Calculate account age signal
 */
function calculateAccountAge(createdAt: Date): SignalResult {
  const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (ageInDays >= 30) {
    return {
      score: 100,
      status: 'strong',
      detail: `Account is ${Math.round(ageInDays)} days old`,
    };
  }

  if (ageInDays >= 7) {
    return {
      score: 70,
      status: 'moderate',
      detail: `Account is ${Math.round(ageInDays)} days old`,
    };
  }

  if (ageInDays >= 1) {
    return {
      score: 40,
      status: 'weak',
      detail: `Account is ${Math.round(ageInDays)} days old (new)`,
    };
  }

  return {
    score: 20,
    status: 'weak',
    detail: 'Account created today',
  };
}

/**
 * Check for multiple claim attempts (fraud signal)
 */
function calculateMultipleAttempts(attemptCount: number): SignalResult {
  if (attemptCount === 0) {
    return {
      score: 100,
      status: 'strong',
      detail: 'No previous claim attempts',
    };
  }

  if (attemptCount === 1) {
    return {
      score: 70,
      status: 'moderate',
      detail: '1 previous claim attempt',
    };
  }

  return {
    score: 0,
    status: 'fail',
    detail: `${attemptCount} previous claim attempts (potential fraud)`,
  };
}

/**
 * Determine overall recommendation based on signals
 */
function determineRecommendation(
  overallScore: number,
  signals: VerificationSignals['signals']
): {
  recommendation: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'AUTO_REJECT';
  autoApprove: boolean;
  requiresManualReview: boolean;
} {
  // AUTO_REJECT criteria
  if (signals.multipleAttempts.status === 'fail' && overallScore < 50) {
    return {
      recommendation: 'AUTO_REJECT',
      autoApprove: false,
      requiresManualReview: false,
    };
  }

  // AUTO_APPROVE criteria (high confidence)
  // Must have domain match AND professional email
  if (
    overallScore >= 80 &&
    signals.emailDomainMatch.status === 'strong' &&
    signals.professionalEmail.status === 'strong'
  ) {
    return {
      recommendation: 'AUTO_APPROVE',
      autoApprove: true,
      requiresManualReview: false,
    };
  }

  // MANUAL_REVIEW (default for ambiguous cases)
  return {
    recommendation: 'MANUAL_REVIEW',
    autoApprove: false,
    requiresManualReview: true,
  };
}

/**
 * Extract domain from email or URL
 */
function extractDomain(emailOrUrl: string): string {
  // Remove protocol if URL
  let domain = emailOrUrl.replace(/^https?:\/\//, '');

  // Extract domain from email
  if (domain.includes('@')) {
    domain = domain.split('@')[1];
  }

  // Remove path/query from URL
  domain = domain.split('/')[0];
  domain = domain.split('?')[0];

  // Remove www prefix
  domain = domain.replace(/^www\./, '');

  return domain.toLowerCase().trim();
}

/**
 * Extract base domain (remove subdomain)
 * e.g., hr.company.com -> company.com
 */
function extractBaseDomain(domain: string): string {
  const parts = domain.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return domain;
}

/**
 * Calculate string similarity (0-1) using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0;

  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
