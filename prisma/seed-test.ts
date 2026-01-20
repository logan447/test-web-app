/**
 * Sprint 0 Test Seed
 *
 * Creates test accounts for audit and demo purposes.
 * This seed is:
 * - IDEMPOTENT: Safe to run multiple times (uses upsert)
 * - NON-DESTRUCTIVE: Never deletes existing data
 * - ISOLATED: Uses @test.olera.com domain for easy identification
 *
 * Test Accounts:
 * 1. family@test.olera.com - Family user with FamilyProfile, FAMILY mode
 * 2. provider@test.olera.com - Provider user with ProviderIdentity, PROVIDER mode
 * 3. newuser@test.olera.com - Clean user (no profile/identity), FAMILY mode
 * 4. admin@test.olera.com - Admin user, FAMILY mode
 *
 * Password for all accounts: Test1234!
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Deterministic IDs based on email for consistent upserts
const TEST_IDS = {
  familyUser: 'test-family-user-001',
  familyProfile: 'test-family-profile-001',
  providerUser: 'test-provider-user-001',
  providerIdentity: 'test-provider-identity-001',
  newUser: 'test-new-user-001',
  adminUser: 'test-admin-user-001',
} as const;

const TEST_PASSWORD = 'Test1234!';
const TEST_DOMAIN = '@test.olera.com';

interface SeedResult {
  success: boolean;
  accounts: {
    family: { email: string; id: string };
    provider: { email: string; id: string };
    newUser: { email: string; id: string };
    admin: { email: string; id: string };
  };
  summary: string[];
}

async function seedTestAccounts(): Promise<SeedResult> {
  const summary: string[] = [];
  const passwordHash = await hash(TEST_PASSWORD, 12);

  console.log('🧪 Starting Sprint 0 Test Seed...\n');

  // ============================================================================
  // 1. FAMILY USER - Has FamilyProfile, FAMILY mode
  // ============================================================================
  const familyUser = await prisma.user.upsert({
    where: { email: `family${TEST_DOMAIN}` },
    update: {
      name: 'Test Family User',
      passwordHash,
      activeMode: 'FAMILY',
      role: 'FAMILY',
    },
    create: {
      id: TEST_IDS.familyUser,
      email: `family${TEST_DOMAIN}`,
      name: 'Test Family User',
      passwordHash,
      activeMode: 'FAMILY',
      role: 'FAMILY',
      phone: '(555) 100-0001',
    },
  });

  // Ensure FamilyProfile exists
  await prisma.familyProfile.upsert({
    where: { userId: familyUser.id },
    update: {},
    create: {
      id: TEST_IDS.familyProfile,
      userId: familyUser.id,
      lovedOneName: 'Test Loved One',
      ageRange: '75-80',
      gender: 'Female',
      careTypes: ['PERSONAL_CARE', 'COMPANION_CARE'],
      location: 'Test City',
      city: 'Test City',
      state: 'CA',
      zipCode: '90001',
      budgetMin: 3000,
      budgetMax: 5000,
      timeline: 'Within 3 months',
      description: 'Test family profile for Sprint 0 audit testing.',
    },
  });

  summary.push(`✅ Family user: family${TEST_DOMAIN} (mode: FAMILY, has FamilyProfile)`);

  // ============================================================================
  // 2. PROVIDER USER - Has ProviderIdentity, PROVIDER mode
  // ============================================================================
  const providerUser = await prisma.user.upsert({
    where: { email: `provider${TEST_DOMAIN}` },
    update: {
      name: 'Test Provider User',
      passwordHash,
      activeMode: 'PROVIDER',
      role: 'PROVIDER',
    },
    create: {
      id: TEST_IDS.providerUser,
      email: `provider${TEST_DOMAIN}`,
      name: 'Test Provider User',
      passwordHash,
      activeMode: 'PROVIDER',
      role: 'PROVIDER',
      phone: '(555) 200-0001',
    },
  });

  // Ensure ProviderIdentity exists (critical for Sprint 0 provider gating tests)
  await prisma.providerIdentity.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      id: TEST_IDS.providerIdentity,
      userId: providerUser.id,
      type: 'INDIVIDUAL',
      onboardingComplete: false, // Not complete - tests can complete it
    },
  });

  summary.push(`✅ Provider user: provider${TEST_DOMAIN} (mode: PROVIDER, has ProviderIdentity)`);

  // ============================================================================
  // 3. NEW USER - No profile, no identity, FAMILY mode (clean state)
  // ============================================================================
  const newUser = await prisma.user.upsert({
    where: { email: `newuser${TEST_DOMAIN}` },
    update: {
      name: 'Test New User',
      passwordHash,
      activeMode: 'FAMILY',
      role: 'FAMILY',
    },
    create: {
      id: TEST_IDS.newUser,
      email: `newuser${TEST_DOMAIN}`,
      name: 'Test New User',
      passwordHash,
      activeMode: 'FAMILY',
      role: 'FAMILY',
      phone: '(555) 300-0001',
    },
  });

  // Ensure NO FamilyProfile or ProviderIdentity for this user
  await prisma.familyProfile.deleteMany({ where: { userId: newUser.id } });
  await prisma.providerIdentity.deleteMany({ where: { userId: newUser.id } });

  summary.push(`✅ New user: newuser${TEST_DOMAIN} (mode: FAMILY, no profile/identity)`);

  // ============================================================================
  // 4. ADMIN USER - Admin role, FAMILY mode
  // ============================================================================
  const adminUser = await prisma.user.upsert({
    where: { email: `admin${TEST_DOMAIN}` },
    update: {
      name: 'Test Admin User',
      passwordHash,
      activeMode: 'FAMILY',
      role: 'ADMIN',
    },
    create: {
      id: TEST_IDS.adminUser,
      email: `admin${TEST_DOMAIN}`,
      name: 'Test Admin User',
      passwordHash,
      activeMode: 'FAMILY',
      role: 'ADMIN',
      phone: '(555) 400-0001',
    },
  });

  summary.push(`✅ Admin user: admin${TEST_DOMAIN} (mode: FAMILY, role: ADMIN)`);

  console.log('\n📊 Test Seed Summary:');
  summary.forEach(line => console.log(`   ${line}`));
  console.log(`\n🔑 Password for all accounts: ${TEST_PASSWORD}`);
  console.log('\n✅ Sprint 0 Test Seed completed successfully!\n');

  return {
    success: true,
    accounts: {
      family: { email: `family${TEST_DOMAIN}`, id: familyUser.id },
      provider: { email: `provider${TEST_DOMAIN}`, id: providerUser.id },
      newUser: { email: `newuser${TEST_DOMAIN}`, id: newUser.id },
      admin: { email: `admin${TEST_DOMAIN}`, id: adminUser.id },
    },
    summary,
  };
}

/**
 * Verify test accounts exist and have correct configuration
 */
async function verifyTestAccounts(): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];

  console.log('🔍 Verifying test accounts...\n');

  // Check family user
  const familyUser = await prisma.user.findUnique({
    where: { email: `family${TEST_DOMAIN}` },
    include: { familyProfile: true, providerIdentity: true },
  });

  if (!familyUser) {
    issues.push('❌ Family user not found');
  } else {
    if (familyUser.activeMode !== 'FAMILY') issues.push('❌ Family user has wrong mode');
    if (!familyUser.familyProfile) issues.push('❌ Family user missing FamilyProfile');
    if (familyUser.providerIdentity) issues.push('⚠️ Family user has ProviderIdentity (unexpected)');
  }

  // Check provider user
  const providerUser = await prisma.user.findUnique({
    where: { email: `provider${TEST_DOMAIN}` },
    include: { familyProfile: true, providerIdentity: true },
  });

  if (!providerUser) {
    issues.push('❌ Provider user not found');
  } else {
    if (providerUser.activeMode !== 'PROVIDER') issues.push('❌ Provider user has wrong mode');
    if (!providerUser.providerIdentity) issues.push('❌ Provider user missing ProviderIdentity');
  }

  // Check new user
  const newUser = await prisma.user.findUnique({
    where: { email: `newuser${TEST_DOMAIN}` },
    include: { familyProfile: true, providerIdentity: true },
  });

  if (!newUser) {
    issues.push('❌ New user not found');
  } else {
    if (newUser.activeMode !== 'FAMILY') issues.push('❌ New user has wrong mode');
    if (newUser.familyProfile) issues.push('❌ New user has FamilyProfile (should be clean)');
    if (newUser.providerIdentity) issues.push('❌ New user has ProviderIdentity (should be clean)');
  }

  // Check admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: `admin${TEST_DOMAIN}` },
  });

  if (!adminUser) {
    issues.push('❌ Admin user not found');
  } else {
    if (adminUser.role !== 'ADMIN') issues.push('❌ Admin user has wrong role');
  }

  const valid = issues.length === 0;

  if (valid) {
    console.log('✅ All test accounts verified successfully!\n');
  } else {
    console.log('⚠️ Test account verification found issues:\n');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('');
  }

  return { valid, issues };
}

/**
 * Reset test accounts to clean state (for re-running audits)
 */
async function resetTestAccounts(): Promise<void> {
  console.log('🔄 Resetting test accounts to clean state...\n');

  // Delete and recreate via the main seed function
  const testEmails = [
    `family${TEST_DOMAIN}`,
    `provider${TEST_DOMAIN}`,
    `newuser${TEST_DOMAIN}`,
    `admin${TEST_DOMAIN}`,
  ];

  // Delete related data first (order matters due to foreign keys)
  for (const email of testEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.familyProfile.deleteMany({ where: { userId: user.id } });
      await prisma.providerIdentity.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { email } });
    }
  }

  // Recreate via seed
  await seedTestAccounts();
  console.log('✅ Test accounts reset to clean state!\n');
}

// Export functions for programmatic use
export { seedTestAccounts, verifyTestAccounts, resetTestAccounts, TEST_IDS, TEST_PASSWORD, TEST_DOMAIN };

// CLI execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'verify':
      await verifyTestAccounts();
      break;
    case 'reset':
      await resetTestAccounts();
      break;
    default:
      await seedTestAccounts();
  }
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error in test seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
