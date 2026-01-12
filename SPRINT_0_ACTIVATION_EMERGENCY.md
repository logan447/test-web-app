# SPRINT 0: ACTIVATION EMERGENCY - DETAILED PLAN

**Status:** Ready for Approval
**Scope:** Fix catastrophic activation crisis on all 3 sides of marketplace
**Expected Impact:** 20-40x improvement in activation rates
**Timeline:** Implementation ready after approval

---

## EXECUTIVE SUMMARY

### Current Crisis
- **Family Activation:** 2% (98% drop off after signup)
- **Provider Activation:** <1% (99%+ drop off)
- **Tour Booking Rate:** <0.1%
- **Business Impact:** Marketplace death spiral - no supply = no demand = no business

### Root Causes
1. **No onboarding flow** - Users dumped into empty inbox or browse mode
2. **Overwhelming forms** - 80-120 fields all at once
3. **Visibility broken** - Toggles buried or missing entirely
4. **No success celebration** - Users don't know they succeeded

### Sprint 0 Solution
Fix BOTH demand AND supply side activation simultaneously with:
- **Optional/skippable onboarding** (Airbnb-style)
- **Minimal required fields** (8 for providers, 4 for families)
- **Visibility defaults ON** (opt-out model)
- **Success celebrations** throughout
- **Simple matching** (city + care type + visibility)

---

## USER FLOWS

### 1. FAMILY ONBOARDING FLOW

**Entry Points:**
- After signup → Redirect to `/onboarding/welcome?type=family`
- After switching to family mode → Redirect to `/onboarding/welcome?type=family`
- Can skip and return to browse

**Flow:**

```
┌─────────────────────────────────────┐
│ Welcome Screen                      │
│ "Help us find the right care"      │
│ [Skip] [Get Started →]             │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 1: Who needs care?             │
│ ☐ Myself                            │
│ ☐ My parent                         │
│ ☐ My spouse                         │
│ ☐ Other family member               │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 2: What type of care? *        │
│ ☐ In-home care                      │
│ ☐ Assisted living                   │
│ ☐ Memory care                       │
│ ☐ Nursing home                      │
│ ☐ Independent living                │
│ ☐ Not sure yet                      │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 3: Where are you located? *    │
│ City: [_____________]               │
│ State: [Dropdown_____]              │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 4: Care needs/conditions? *    │
│ ☐ Alzheimer's/Dementia              │
│ ☐ Mobility issues                   │
│ ☐ Diabetes                          │
│ ☐ Heart disease                     │
│ ☐ Stroke recovery                   │
│ ☐ Cancer care                       │
│ ☐ Parkinson's                       │
│ ☐ Other (specify)                   │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 5: Budget & Timeline           │
│ (OPTIONAL - can skip)               │
│ Monthly budget: [_______]           │
│ When: ☐ ASAP ☐ 1-3mo ☐ 3-6mo       │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 6: Visibility                  │
│ ✓ Make my profile visible           │
│   to care providers                 │
│   (They can reach out to you)       │
│                                     │
│ ☐ Keep profile private              │
│   (You contact them first)          │
│ [Back] [Complete Profile →]         │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 🎉 Success! You're all set!         │
│                                     │
│ You've completed your care profile  │
│ Providers can now see you're        │
│ looking for care in [City]          │
│                                     │
│ [Browse Providers →]                │
│ [Complete Your Profile]             │
└─────────────────────────────────────┘
```

**Required Fields (marked with *):**
1. Care type (step 2)
2. Location - city + state (step 3)
3. Disability/care needs (step 4)

**Optional Fields:**
- Who needs care (step 1)
- Budget & timeline (step 5)
- Visibility toggle (defaults to ON)

**Skip Behavior:**
- Can skip at any step EXCEPT required fields
- Skip button available on every screen
- Skipping redirects to `/providers` (browse mode)
- Incomplete profile shows banner: "Complete your profile to get better matches" (dismissible)

---

### 2. PROVIDER/CAREGIVER ONBOARDING FLOW

**Entry Points:**
- After provider identity creation → Redirect to `/provider/onboarding/welcome`
- After switching to provider mode → Redirect to `/provider/onboarding/welcome`
- Can skip and return to browse

**Flow:**

```
┌─────────────────────────────────────┐
│ Welcome to Olera for Providers      │
│ "Connect with families seeking      │
│  care in your area"                 │
│ [Skip] [Get Started →]              │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 1: What type of provider? *    │
│ ○ Independent Caregiver             │
│ ○ Home Care Agency                  │
│ ○ Home Health Agency                │
│ ○ Hospice                           │
│ ○ Independent Living                │
│ ○ Assisted Living                   │
│ ○ Memory Care                       │
│ ○ Nursing Home                      │
│ ○ Rehab Center                      │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 2: Business name *              │
│ [___________________________]       │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 3: What care do you provide? * │
│ ☐ Memory care                       │
│ ☐ Personal care                     │
│ ☐ Skilled nursing                   │
│ ☐ Respite care                      │
│ ☐ Hospice care                      │
│ ☐ Rehabilitation                    │
│ (Multi-select)                      │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 4: Where are you located? *    │
│ Street: [__________________]        │
│ City: [__________________]          │
│ State: [Dropdown__________]         │
│ ZIP: [_______]                      │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 5: Contact info *               │
│ Phone: [__________________]         │
│ Website: [________________]         │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 6: Upload a photo *             │
│ (Profiles with photos get 10x       │
│  more inquiries)                    │
│                                     │
│ [Drop photo here or click]          │
│ Max 5MB, JPG/PNG                    │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 7: Brief description *          │
│ Tell families what makes you         │
│ special (50-500 characters)         │
│ [_____________________________]     │
│ [_____________________________]     │
│ [_____________________________]     │
│ 0/500 characters                    │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 8: License/Certification *      │
│ License #: [_____________]          │
│ State: [Dropdown_________]          │
│ (Required for credibility)          │
│ [Back] [Skip] [Continue →]          │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Step 9: Visibility Settings         │
│                                     │
│ ✓ Visible to families               │
│   (They can find you & request      │
│    consultations)                   │
│                                     │
│ [For Caregivers Only:]              │
│ ✓ Available for organizations       │
│   (Facilities can recruit you)      │
│                                     │
│ [For Organizations Only:]           │
│ ✓ Actively hiring caregivers        │
│   (Caregivers can apply)            │
│                                     │
│ [Back] [Complete Profile →]         │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 🎉 Your profile is live!            │
│                                     │
│ Families in [City] can now find     │
│ you and request consultations       │
│                                     │
│ [Browse Families →]                 │
│ [Add More Details]                  │
│ [View My Profile]                   │
└─────────────────────────────────────┘
```

**Required Fields (8 total):**
1. Provider type (step 1)
2. Business/Organization name (step 2)
3. Care types offered (step 3)
4. Location: street, city, state, ZIP (step 4)
5. Contact: phone + website (step 5)
6. 1 photo (step 6)
7. Brief description (step 7)
8. License/certification number + state (step 8)

**Optional Field:**
- Visibility toggles (step 9) - defaults to ON

**Visibility Toggle Behavior by Provider Type:**

| Provider Type | Visible to Families | Available for Organizations | Actively Hiring Caregivers |
|---------------|---------------------|----------------------------|---------------------------|
| Independent Caregiver | ✓ (default ON) | ✓ (default ON) | N/A |
| Home Care Agency | ✓ (default ON) | N/A | ✓ (default ON) |
| Home Health Agency | ✓ (default ON) | N/A | ✓ (default ON) |
| Hospice | ✓ (default ON) | N/A | ✓ (default ON) |
| Independent Living | ✓ (default ON) | N/A | ✓ (default ON) |
| Assisted Living | ✓ (default ON) | N/A | ✓ (default ON) |
| Memory Care | ✓ (default ON) | N/A | ✓ (default ON) |
| Nursing Home | ✓ (default ON) | N/A | ✓ (default ON) |
| Rehab Center | ✓ (default ON) | N/A | ✓ (default ON) |

**Skip Behavior:**
- Can skip at any step
- Skipping redirects to `/provider/requests` (inbox)
- Incomplete profile shows persistent banner: "Complete your profile to appear in search results" (not dismissible until completed)

---

### 3. ORGANIZATION CLAIM vs CREATE FLOW

**CRITICAL: This flow prevents duplication and mis-claiming of seeded profiles**

**Entry Point:**
- User signs up as Provider → Organization type selected → Needs to claim OR create

**Flow:**

```
┌─────────────────────────────────────┐
│ Find Your Organization              │
│                                     │
│ We may already have your facility   │
│ in our database. Let's check!       │
│                                     │
│ Organization name:                  │
│ [___________________________]       │
│ [Search]                            │
│                                     │
│ [Skip - Create New Profile →]      │
└─────────────────────────────────────┘
                ↓
        ┌───────┴────────┐
        │                │
    Found           Not Found
        │                │
        ↓                ↓
┌─────────────┐   ┌──────────────┐
│ Search      │   │ No matches   │
│ Results     │   │ found        │
│             │   │              │
│ [Result 1]  │   │ [Create New  │
│ [Result 2]  │   │  Profile →]  │
│ [Result 3]  │   └──────────────┘
│             │
│ [None of    │
│  these]     │
└─────────────┘
        │
        ↓ (user clicks result)
┌─────────────────────────────────────┐
│ Is this your organization?          │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ [Photo/Logo]                    ││
│ │                                 ││
│ │ Sunrise Assisted Living         ││
│ │ 123 Main St, Austin, TX         ││
│ │ (512) 555-1234                  ││
│ │                                 ││
│ │ Memory care, Assisted living    ││
│ │ 50 beds • Founded 2010          ││
│ └─────────────────────────────────┘│
│                                     │
│ [No, Go Back] [Yes, Claim This →]  │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Verify You Own This Organization    │
│                                     │
│ To prevent fraud, we need to verify │
│ you have authority to claim this    │
│ profile.                            │
│                                     │
│ ○ I have access to the phone number │
│   listed (512) 555-1234             │
│   → We'll send verification code    │
│                                     │
│ ○ I have access to the email        │
│   → We'll send verification link    │
│                                     │
│ ○ I have documentation              │
│   → Upload business license/EIN     │
│   → Manual review (1-2 days)        │
│                                     │
│ [Back] [Continue with Selected →]   │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ Verification Sent                   │
│                                     │
│ Enter the 6-digit code sent to:     │
│ (512) 555-1234                      │
│                                     │
│ [_] [_] [_] [_] [_] [_]            │
│                                     │
│ Didn't receive? [Resend]            │
│ [Try Different Method]              │
└─────────────────────────────────────┘
                ↓
┌─────────────────────────────────────┐
│ 🎉 Verification Successful!         │
│                                     │
│ You now own this profile.           │
│ Let's update your information.      │
│                                     │
│ [Continue to Profile Setup →]       │
└─────────────────────────────────────┘
                ↓
        (Continue to Step 2
         of Provider Onboarding,
         with fields pre-filled
         from seeded data)
```

**Search Algorithm:**
- Fuzzy match on organization name
- Filter by city/state if provided
- Show top 5 results
- Each result shows: name, address, phone, care types, photo/logo

**Verification Methods (Priority Order):**

1. **Phone Verification** (Fastest - instant)
   - SMS code to listed phone number
   - 6-digit code, expires in 10 minutes
   - 3 attempts max

2. **Email Verification** (Fast - instant)
   - Magic link to organization email domain
   - If no email on file, user can provide organization email
   - Must be from organization domain (e.g., @sunrisecommunity.com)

3. **Document Upload** (Slow - 1-2 days)
   - Business license with matching name/address
   - EIN letter from IRS
   - Utility bill at business address with user's name
   - Manual review by Olera team

**Anti-Fraud Measures:**
- Flag if multiple users try to claim same profile (notify existing claimer)
- Lock profile after 3 failed verification attempts (24 hours)
- All claims logged with timestamp + IP for audit trail
- Manual review for high-value profiles (100+ beds, etc.)

**Create New Profile Flow:**
- If user clicks "None of these" or "Create New Profile"
- Goes to standard provider onboarding (Step 1)
- System checks for duplicates before saving:
  - Same name + same city + same address = likely duplicate → Show warning
  - User can confirm "Yes, this is different" or go back to claim

---

## MATCHING LOGIC (Simple - Sprint 0)

### How Matching Works

**Sprint 0 uses simple boolean matching:**

```javascript
// Pseudo-code for Sprint 0 matching
function findMatches(userProfile, searchPool) {
  return searchPool.filter(candidate => {
    // 1. Location match (city only)
    const locationMatch = candidate.city === userProfile.city;

    // 2. Care type match (at least one overlap)
    const careTypeMatch = candidate.careTypes.some(type =>
      userProfile.careTypes.includes(type)
    );

    // 3. Visibility check
    const visibilityMatch = candidate.isVisible === true;

    // 4. Boolean AND
    return locationMatch && careTypeMatch && visibilityMatch;
  });
}
```

**Matching Scenarios:**

| Scenario | Family Profile | Provider Profile | Match? | Why? |
|----------|---------------|------------------|--------|------|
| 1 | Austin, Memory Care | Austin, Memory Care, visible=true | ✓ YES | City + care type + visible |
| 2 | Austin, Memory Care | Houston, Memory Care, visible=true | ✗ NO | Different city |
| 3 | Austin, Memory Care | Austin, Assisted Living, visible=true | ✗ NO | No care type overlap |
| 4 | Austin, Memory Care | Austin, Memory Care, visible=false | ✗ NO | Not visible |
| 5 | Austin, Memory Care + Assisted | Austin, Memory Care, visible=true | ✓ YES | At least one care type matches |

**Search Results Display:**
- No ranking/scoring in Sprint 0
- Sort by: Recently updated first (default)
- Show all boolean matches (no limit for Sprint 0)
- Future sprints will add: distance, match percentage, featured listings

**"How Matching Works" Page:**
Located at `/how-it-works/matching`

Content:
```
# How Olera Matches Families with Providers

Olera helps you find the right care by matching:

✓ **Location** - Providers in your city
✓ **Care Type** - Memory care, assisted living, home care, etc.
✓ **Availability** - Only providers actively accepting inquiries

## For Families:
1. Tell us what type of care you need
2. Tell us where you're located
3. We'll show you all matching providers in your area
4. Request consultations with providers you like

## For Providers:
1. Tell us what care you provide
2. Tell us where you're located
3. Make your profile visible
4. Families looking for your services can find you and reach out

## Privacy:
- You control your visibility
- You can turn your profile on/off anytime
- Only users looking for what you offer will see you

[Browse Providers] [Sign Up]
```

---

## PAGES & COMPONENTS TO BUILD/UPDATE

### New Pages (8 pages)

1. **`/onboarding/welcome?type=family`**
   - Welcome screen with skip option
   - Effort: 2 hours

2. **`/onboarding/family/step-[1-6]`** (6 pages)
   - Step 1: Who needs care
   - Step 2: Care type (required)
   - Step 3: Location (required)
   - Step 4: Care needs (required)
   - Step 5: Budget/timeline (optional)
   - Step 6: Visibility toggle
   - Effort: 6 hours (1 hour each)

3. **`/provider/onboarding/welcome`**
   - Welcome screen with skip option
   - Effort: 2 hours

4. **`/provider/onboarding/step-[1-9]`** (9 pages)
   - Step 1: Provider type (required)
   - Step 2: Business name (required)
   - Step 3: Care types (required)
   - Step 4: Location (required)
   - Step 5: Contact info (required)
   - Step 6: Photo upload (required)
   - Step 7: Description (required)
   - Step 8: License (required)
   - Step 9: Visibility toggles
   - Effort: 10 hours (~1 hour each, photo upload = 2 hours)

5. **`/provider/onboarding/claim-search`**
   - Search existing organizations
   - Effort: 4 hours

6. **`/provider/onboarding/claim-verify?profileId=xxx`**
   - Verification flow (phone/email/document)
   - Effort: 6 hours

7. **`/provider/onboarding/success`**
   - Success celebration page
   - Effort: 2 hours

8. **`/how-it-works/matching`**
   - Educational page explaining matching
   - Effort: 2 hours

**Total New Pages: 8 pages, ~34 hours**

---

### Updated Components

1. **Signup Flow Redirect**
   - File: `/app/api/auth/[...nextauth]/route.ts`
   - Change: After signup, redirect to `/onboarding/welcome?type=family` instead of `/providers`
   - Effort: 30 minutes

2. **Mode Switch Redirect**
   - File: `/app/components/ModeSelector.tsx` (or wherever mode switch lives)
   - Change: When switching to family → Check if profile complete → If not, redirect to onboarding
   - Change: When switching to provider → Check if profile complete → If not, redirect to onboarding
   - Effort: 1 hour

3. **Dashboard Banner Component**
   - File: Create `/app/components/IncompleteProfileBanner.tsx`
   - Shows persistent banner if profile incomplete
   - For families: Dismissible
   - For providers: Not dismissible
   - Effort: 2 hours

4. **Profile Completion Check API**
   - File: Create `/app/api/profile/completion-status/route.ts`
   - Returns: `{ isComplete: boolean, missingFields: string[] }`
   - Used by: Dashboard, banner, redirects
   - Effort: 2 hours

5. **Matching Algorithm Endpoint**
   - File: Update `/app/api/providers/search/route.ts`
   - Implement simple boolean matching (city + care type + visibility)
   - Effort: 4 hours

6. **Provider Search Page**
   - File: Update `/app/providers/page.tsx`
   - Use new matching endpoint
   - Show "How Matching Works" link
   - Effort: 2 hours

7. **Care Profile Form Simplification**
   - File: Update `/app/dashboard/care-profile/page.tsx`
   - Move non-essential fields to "Additional Info" collapsed section
   - Highlight required fields
   - Effort: 3 hours

8. **Provider Profile Form Simplification**
   - File: Update `/app/provider/profile/page.tsx` (if exists, otherwise create)
   - Similar to care profile - essential vs additional
   - Effort: 3 hours

**Total Updated Components: 8 components, ~17.5 hours**

---

## DATABASE SCHEMA UPDATES

### New Fields Needed

**User Model:**
```prisma
model User {
  // ... existing fields

  // Onboarding tracking
  familyOnboardingComplete Boolean @default(false)
  providerOnboardingComplete Boolean @default(false)
  onboardingSkippedAt DateTime?

  // Profile completion timestamp
  familyProfileCompletedAt DateTime?
  providerProfileCompletedAt DateTime?
}
```

**CareProfile Model:**
```prisma
model CareProfile {
  // ... existing fields

  // Required onboarding fields
  careType String[] // Memory care, Assisted living, etc.
  city String
  state String
  careNeeds String[] // Alzheimer's, Mobility, etc.

  // Optional onboarding fields
  whoNeedsCare String? // Myself, Parent, Spouse, etc.
  budget String?
  timeline String?

  // Visibility
  isPublic Boolean @default(true) // Changed default to true
}
```

**ProviderProfile Model:**
```prisma
model ProviderProfile {
  // ... existing fields

  // Required onboarding fields
  providerType String // Independent Caregiver, Home Care Agency, etc.
  businessName String
  careTypesOffered String[]
  street String
  city String
  state String
  zip String
  phone String
  website String
  primaryPhoto String
  description String
  licenseNumber String
  licenseState String

  // Visibility toggles
  availableForFamilies Boolean @default(true)
  availableForOrganizations Boolean @default(true) // Only for caregivers
  hiringCaregivers Boolean @default(true) // Only for organizations

  // Claiming system
  claimed Boolean @default(false)
  claimedAt DateTime?
  claimedBy String? // User ID who claimed
  seededFrom String? // Source of seeded data
  verificationMethod String? // phone, email, document
  verificationStatus String? // pending, verified, rejected
}
```

**New ClaimAttempt Model (for fraud prevention):**
```prisma
model ClaimAttempt {
  id String @id @default(cuid())
  providerProfileId String
  userId String
  attemptedAt DateTime @default(now())
  ipAddress String
  verificationMethod String
  status String // pending, verified, rejected, fraud

  providerProfile ProviderProfile @relation(fields: [providerProfileId], references: [id])
  user User @relation(fields: [userId], references: [id])
}
```

**Effort:** 2 hours (schema updates + migration)

---

## EFFORT ESTIMATES

### Summary Table

| Category | Tasks | Hours |
|----------|-------|-------|
| New Pages | 8 pages (onboarding flows) | 34h |
| Updated Components | 8 components (redirects, forms, matching) | 17.5h |
| Database Schema | 4 model updates + migration | 2h |
| Testing | All flows, both sides | 8h |
| Bug Fixes & Polish | Edge cases, error handling | 6h |
| **TOTAL** | **28 tasks** | **67.5h** |

### By Developer

**Single developer:** 67.5 hours = ~8.5 days (assuming 8h/day)

**Two developers (parallel):**
- Dev 1: Family onboarding + matching logic = 30h
- Dev 2: Provider onboarding + claim flow = 37.5h
- Timeline: ~5 days with some overlap/code review

---

## SUCCESS CRITERIA

### Activation Rates (Target: 20x improvement)

**Current State:**
- Family activation: 2%
- Provider activation: <1%
- Tour booking rate: <0.1%

**Sprint 0 Target:**
- Family activation: 40% (20x improvement)
- Provider activation: 20% (20x improvement)
- Tour booking rate: 2% (20x improvement)

**How We'll Measure:**
- Track completion of onboarding flow (even if skipped)
- Track profile completion (all required fields)
- Track first request sent (family → provider)
- Track first request received (provider ← family)

### Technical Success Criteria

✓ All 3 user types can complete onboarding in <2 minutes
✓ Skip button works on all optional steps
✓ Required fields block progression (with clear errors)
✓ Visibility defaults to ON (opt-out model)
✓ Photos upload and display correctly
✓ Organization claim flow prevents duplicates
✓ Matching logic returns correct results (city + care type + visibility)
✓ Success celebrations appear after profile completion
✓ Incomplete profile banners display correctly
✓ All forms validate properly (phone format, ZIP format, etc.)

### User Experience Success Criteria

✓ Onboarding feels fast and encouraging (not overwhelming)
✓ Users understand what's required vs optional
✓ Users understand what "visibility ON" means
✓ Organization claimers can verify ownership easily
✓ Search results make sense (relevant matches only)
✓ "How Matching Works" page is clear and helpful

---

## RISKS & MITIGATIONS

### Risk 1: Organization Claim Fraud
**Risk:** Bad actors claim competitors' profiles
**Mitigation:**
- 3-method verification (phone/email/document)
- Flag multiple claim attempts
- Manual review for high-value profiles
- Audit trail with IP logging

### Risk 2: Photo Upload Failures
**Risk:** Photos too large, wrong format, upload errors
**Mitigation:**
- Client-side validation (max 5MB, JPG/PNG only)
- Image compression before upload
- Clear error messages
- "Skip for now" option with reminder banner

### Risk 3: Matching Too Restrictive
**Risk:** Simple city matching may return zero results
**Mitigation:**
- Fallback: Show nearby cities if zero results in exact city
- Suggestion: "No matches in Austin. Try Houston (30 miles away)"
- Analytics: Track zero-result searches to prioritize geographic expansion

### Risk 4: Users Skip Everything
**Risk:** Optional onboarding means users skip and stay inactive
**Mitigation:**
- Required fields for matching to work (can't skip critical fields)
- Persistent banner for incomplete profiles (providers)
- Search ranking: Complete profiles rank higher (future sprint)
- Email nurture: "Complete your profile to get 10x more inquiries"

### Risk 5: Onboarding Too Long
**Risk:** 6-9 steps feels like too much
**Mitigation:**
- Progress bar on every screen
- Can skip any optional step
- Each screen is fast (<30 seconds)
- Estimated time shown: "2 minutes to complete"

---

## POST-SPRINT 0 FOLLOW-UP

### Immediate Monitoring (Week 1)
- Track activation funnel (signup → onboarding → profile complete)
- Track drop-off points (which step loses users?)
- Track skip rate (how many users skip?)
- Track matching: Zero-result searches, average results per search

### Quick Wins (Week 2)
- Add onboarding analytics dashboard
- A/B test: Required vs optional fields
- Email campaign: Re-engage skippers
- Add "Complete profile" CTAs in inbox/browse

### Sprint 1 Prep
- Gather user feedback on onboarding
- Identify bottleneck fields (which take longest?)
- Plan progressive disclosure improvements
- Design advanced matching with scoring

---

## OPEN QUESTIONS FOR CONSIDERATION

*These don't need answers now, but will be relevant during implementation:*

1. **Photo hosting:** Do we use S3, Cloudinary, or current Unsplash CDN?
2. **SMS verification:** Which service? Twilio? AWS SNS?
3. **Organization verification documents:** Where stored? Max size?
4. **Onboarding progress persistence:** Save after each step or only on "Continue"?
5. **Mobile responsive:** Will onboarding work on mobile or desktop-only for Sprint 0?
6. **Accessibility:** WCAG compliance for forms? Screen reader testing?
7. **Localization:** English-only for Sprint 0 or multi-language?
8. **Analytics:** Google Analytics? Mixpanel? Custom events?

---

## FINAL APPROVAL CHECKLIST

Before proceeding to implementation, confirm:

- [ ] Family onboarding flow approved (6 steps, 3 required)
- [ ] Provider onboarding flow approved (9 steps, 8 required)
- [ ] Organization claim flow approved (search → verify → claim)
- [ ] All 9 provider types included in Sprint 0
- [ ] Visibility defaults to ON (opt-out model)
- [ ] Simple matching logic approved (city + care type + visibility)
- [ ] "How Matching Works" page included
- [ ] Photo requirement: Required for providers, optional for families
- [ ] Skip behavior: Optional steps can be skipped, required cannot
- [ ] Success criteria clear (40% family activation, 20% provider activation)
- [ ] Effort estimate acceptable (67.5 hours)
- [ ] No user-facing metrics/scoring in Sprint 0

---

**Status:** ⏸️ **Awaiting Approval**
**Next Step:** Review this plan, provide feedback, approve to proceed
**Implementation Start:** Immediately after approval

---

*Document created: 2026-01-12*
*Sprint 0: Activation Emergency*
*Expected Impact: 20-40x activation improvement*
