# Sprint 2 Seed Data Requirements

> **Purpose**: Define the test data needed to fully audit Sprint 2 features
> **Date**: January 20, 2026

---

## Current Seed Coverage (Already Implemented)

The existing `prisma/seed.ts` provides:

### Family Accounts (12 total)
- Various profile completion levels
- Different care types (AL, Memory Care, Home Care, Nursing)
- Different locations (San Diego, LA, Orange County)
- Password: `demo123`

### Provider Organization Accounts (10 total)
- All types: Assisted Living, Memory Care, Nursing Home, Home Care Agency
- All `claimed: true`
- Various completion levels
- Password: `demo123`

### Individual Caregiver Accounts (7 total)
- Various specializations
- All `claimed: true`
- Password: `demo123`

### Engagement Scenarios (14+ ConsultRequests)
- PENDING requests (family → org, family → caregiver)
- ACCEPTED requests with message threads
- COMPLETED requests
- Tour appointments

---

## Gap Analysis

### Missing for Sprint 2 Audit:

| Gap | Required For | Impact |
|-----|--------------|--------|
| **Unclaimed provider** | Section 9: Provider Claiming | Cannot test claiming flow |
| Family with incomplete profile | Section 3: Visibility Gate | Can test but would be clearer with dedicated account |
| Provider with incomplete profile | Section 3: Visibility Gate | Can test but would be clearer with dedicated account |
| Fresh user (no engagements) | Section 5: Empty States | Need to verify manually |

---

## Required Additions

### 1. Unclaimed Provider (REQUIRED)

Add one unclaimed provider organization that:
- Has no associated User (or userId = null)
- `claimed: false`
- Has realistic profile data (for claiming display)
- Located in existing test market (San Diego/LA)

**Example:**
```typescript
const unclaimedProvider = await prisma.provider.create({
  data: {
    name: 'Bay Area Senior Living',
    providerType: 'ASSISTED_LIVING',
    description: 'A welcoming community for seniors...',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95110',
    address: '456 Care Center Drive',
    phone: '(408) 555-0199',
    email: 'info@bayareasenior.example.com',
    careTypes: ['PERSONAL_CARE', 'COMPANION_CARE'],
    claimed: false, // KEY: unclaimed
    verified: false,
    active: true,
    // No userId - not linked to any user
  },
});
```

### 2. Provider with Incomplete Profile (NICE TO HAVE)

For clearer visibility gate testing:
- Create a provider account
- Missing Tier 1 required fields (e.g., no phone, no email)
- Test that visibility cannot be enabled

### 3. Family with Minimal Profile (NICE TO HAVE)

For visibility gate testing:
- Create a family account
- Missing Profile Card Minimum (e.g., no location)
- Test that `isPublic` cannot be enabled

---

## Test Account Quick Reference

After seed runs, use these accounts:

| Purpose | Email | Mode | Notes |
|---------|-------|------|-------|
| **Family testing** | `family.assisted.active@demo.com` | FAMILY | Complete profile, has engagements |
| **Family empty** | `family.assisted.browsing@demo.com` | FAMILY | Less complete |
| **Provider org** | See org accounts below | PROVIDER | Complete, has engagements |
| **Provider empty** | (create during test) | PROVIDER | For empty state testing |
| **Claiming test** | Bay Area Senior Living | N/A | Unclaimed provider |

### Organization Accounts

| Org | Email | Specialty |
|-----|-------|-----------|
| Sunshine Manor | `org.sunshine@demo.com` | Assisted Living |
| Memory Haven | `org.memory.haven@demo.com` | Memory Care |
| Skilled Nursing | `org.skilled@demo.com` | Nursing Home |
| Home Care Pros | `org.homecare@demo.com` | Home Care Agency |

### Caregiver Accounts

| Caregiver | Email | Specialty |
|-----------|-------|-----------|
| Maria Santos | `caregiver.maria@demo.com` | Live-in, Dementia |
| James Wilson | `caregiver.james@demo.com` | Memory Care |
| Sarah Brown | `caregiver.sarah@demo.com` | Hospice |

---

## How to Seed

```bash
# Reset and seed database
npx prisma db push --force-reset
npx prisma db seed

# Or via admin API
curl -X POST http://localhost:3000/api/admin/seed
```

---

## Verification Checklist

After seeding, verify:

- [ ] At least 10 family accounts exist
- [ ] At least 10 provider org accounts exist
- [ ] At least 5 caregiver accounts exist
- [ ] At least 1 unclaimed provider exists (NEW)
- [ ] At least 3 PENDING ConsultRequests exist
- [ ] At least 3 ACCEPTED ConsultRequests exist
- [ ] At least 1 COMPLETED ConsultRequest exists
- [ ] Message threads exist for ACCEPTED requests
- [ ] Tour appointments exist for some requests
