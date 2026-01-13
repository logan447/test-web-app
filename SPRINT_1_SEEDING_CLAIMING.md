# SPRINT 1: PROVIDER SEEDING & CLAIMING - DRAFT PLAN

**Status:** 📋 Draft - Needs Clarification & Approval
**Scope:** Seed provider database + allow providers to claim their profiles
**Expected Impact:** 100-500x increase in provider supply (from ~20 to 2,000-10,000)
**Dependencies:** Sprint 0 (onboarding flows) must be complete

---

## EXECUTIVE SUMMARY

### Current Problem
- **Provider Supply Crisis:** Only ~20 providers in database
- **Cold Start Problem:** Families browse empty directory
- **Manual Entry Burden:** Providers must enter 80+ fields from scratch
- **Visibility Gap:** Great providers don't know Olera exists

### Root Causes
1. **No seeded data** - Database is empty
2. **No claim flow** - Providers can't claim existing listings
3. **High friction** - Creating profile from scratch is overwhelming
4. **No discovery** - Providers unaware their facility is listed

### Sprint 1 Solution
**Two-track approach:**
1. **SEEDING:** Pre-populate database with 2,000-10,000 provider profiles from public data
2. **CLAIMING:** Allow providers to search, verify, and claim their pre-seeded profiles

---

## CLARIFYING QUESTIONS - NEED YOUR INPUT

Before I design the detailed flows, I need clarification on these critical decisions:

### 1. DATA SOURCING - Where do we get provider data?

**Options:**
- A) **Public directories** (Medicare.gov, state licensing databases)
- B) **Web scraping** (Google Maps, Yelp, Care.com)
- C) **Manual research** (hire VAs to gather data)
- D) **Data purchase** (buy from data broker)
- E) **Combination** of above

**Questions:**
- Which sources should we prioritize?
- What's the budget for data acquisition?
- Are there legal restrictions we need to consider?
- What minimum data fields are required for seeding?

**Recommended Minimum Seed Fields:**
- Provider name (required)
- Provider type (required)
- Address/city/state/ZIP (required)
- Phone number (required for claiming)
- Website (optional)
- Care types (inferred from provider type)
- License number (if public)

---

### 2. CLAIM VERIFICATION - How do we verify ownership?

**Options:**
- A) **Phone verification:** Send code to facility phone number
- B) **Email verification:** Send code to facility email/website contact form
- C) **Document upload:** Upload business license, letter on letterhead
- D) **Address verification:** Send postcard with code
- E) **Manual review:** Staff verifies each claim

**Questions:**
- Which verification method(s) should we support?
- Can users claim immediately or after verification?
- What happens if multiple people try to claim same facility?
- Should verification be required BEFORE claiming or AFTER?

**My Recommendation:**
- **Phase 1 (MVP):** Phone + Email verification (automated)
- **Phase 2:** Add document upload for edge cases
- Allow immediate claim with "pending verification" status
- Auto-reject duplicate claims from different users

---

### 3. CLAIM FLOW - What happens after claiming?

**Questions:**
- Does claiming bypass onboarding entirely?
- Or do they still complete some onboarding steps?
- What profile fields are pre-filled vs. must be completed?
- Can they edit seeded data or is it locked?

**Proposed Flow:**
```
Search for facility
  ↓
Find match → Click "Claim This Profile"
  ↓
Verify identity (phone/email code)
  ↓
Success! → Redirect to simplified onboarding
  ↓
Pre-filled: Name, address, provider type, phone
Required: Photo, description, care types (confirm/edit)
Optional: Everything else
  ↓
Complete profile → Live on platform
```

**Alternative Flow (More Flexible):**
```
Search for facility
  ↓
Find match → Click "Claim This Profile"
  ↓
Verify identity (phone/email code)
  ↓
Success! → Profile immediately live
  ↓
Banner: "Complete your profile to get more inquiries"
  ↓
Gradual completion over time
```

**Which approach do you prefer?**

---

### 4. SEARCH & DISCOVERY - How do providers find their listing?

**Questions:**
- Search by facility name only?
- Or also search by address/phone/website?
- What if they can't find their facility? (Create new flow)
- Should we show "suggested matches" based on their IP/location?

**Proposed Search:**
- Primary: Search by business name
- Secondary: Filter by city/state
- Fallback: "Can't find your facility? Create new listing"
- Auto-suggest: Show matches as they type

---

### 5. DUPLICATE PREVENTION - How do we handle duplicates?

**Scenarios:**
- Provider creates new listing, but seeded version exists
- Provider claims profile, then creates another
- Multiple locations of same brand (e.g., 5 Sunrise facilities)

**Questions:**
- Should we auto-detect duplicates during onboarding?
- What fields constitute a duplicate? (Name + Address? Phone?)
- How do we handle multi-location organizations?
- Should we merge duplicates or keep separate?

**My Recommendation:**
- Before allowing "Create New", show: "We found similar facilities. Is one of these yours?"
- Detect duplicates by: Name (fuzzy match) + City + State
- Multi-location: Separate profiles with parent organization link (future feature)

---

### 6. SCOPE QUESTIONS - What's in Sprint 1 vs. Later?

**Sprint 1 Candidates:**
- [ ] Seed provider database (2,000-10,000 profiles)
- [ ] Build claim search flow
- [ ] Build claim verification flow (phone/email)
- [ ] Handle claim success → profile ownership
- [ ] Update onboarding to handle claimed profiles
- [ ] Fraud prevention (rate limiting, IP tracking)
- [ ] "Can't find? Create new" fallback
- [ ] ClaimAttempt tracking in database
- [ ] Admin dashboard to review claims (manual approval)

**Out of Scope (Future Sprints):**
- Document-based verification
- Address verification (postcard)
- Multi-location management
- Bulk claiming (for chains)
- Claim disputes / ownership transfers
- Analytics on claim conversion

**What should be IN Sprint 1, and what should we defer?**

---

### 7. USER EXPERIENCE - Entry points for claiming

**Where do users discover claiming?**

**Option A: During provider onboarding**
```
Sign up → Select "Provider" mode
  ↓
"Do you already have a facility?"
  → Yes → Search & Claim flow
  → No → Create new profile
```

**Option B: Separate "Claim Your Listing" CTA**
- Add button on homepage: "Are you a provider? Claim your listing"
- Add link in nav for providers
- Email outreach: "We found your facility on Olera"

**Option C: Both A + B**

**Questions:**
- Which entry points should we build?
- Should claiming be part of onboarding or separate?
- Do we want to send outreach emails to seeded facilities?

---

## PROPOSED USER FLOWS

### FLOW 1: Provider Claims Existing Listing

```
Provider signs up (not yet in provider mode)
  ↓
Sees option: "I'm a care provider"
  ↓
Modal: "Do you want to:"
  → Claim an existing listing (we might have your facility)
  → Create a new listing
  ↓
[CLAIM PATH]
Search: "Enter your business name"
  ↓
Results: "We found 3 matches in your area"
  → Sunrise Senior Living - San Diego
  → Sunrise Senior Living - La Jolla
  → Sunrise Assisted Living - Carlsbad
  ↓
Click "This is my facility" → Verify ownership
  ↓
Verification modal:
  "To claim [Facility Name], verify you're authorized"
  → Send code to (619) 555-0100 [from our records]
  → Or send code to website@facility.com
  ↓
Enter 6-digit code
  ↓
✓ Verified! → Profile claimed
  ↓
Redirect to simplified onboarding:
  Pre-filled: Name, address, phone, provider type
  Required: Upload 1 photo, write description, confirm care types
  Optional: Add more details
  ↓
Profile live!
```

### FLOW 2: Provider Can't Find Listing

```
Search for facility → No results
  ↓
"We couldn't find your facility"
  [Try different search] [Create new listing →]
  ↓
[If they click Create New]
→ Standard onboarding flow (Sprint 0)
```

### FLOW 3: Fraud Prevention

```
Provider tries to claim facility
  ↓
Verification fails 3 times
  ↓
Account flagged → Manual review required
  ↓
Email: "We need additional verification. Please upload:"
  - Business license
  - Letter on company letterhead
  ↓
Admin reviews → Approve or Reject
```

---

## DATABASE SCHEMA (Already in place!)

Good news: Sprint 0 already added the necessary fields:

```prisma
model Provider {
  claimed         Boolean        @default(false)
  claimedAt       DateTime?
  claimedBy       String?        // User ID
  seededFrom      String?        // "medicare_gov", "manual", etc.
  claimAttempts   ClaimAttempt[]
  // ... other fields
}

model ClaimAttempt {
  id                String    @id @default(cuid())
  providerProfileId String
  userId            String
  attemptedAt       DateTime  @default(now())
  ipAddress         String
  verificationMethod String   // "phone", "email", "document"
  status            String    // "pending", "verified", "rejected", "fraud"
}
```

**No schema changes needed!** ✅

---

## TECHNICAL IMPLEMENTATION PLAN

### 1. Data Seeding Script
```bash
/scripts/seed-providers.ts
```
- Read CSV/JSON of provider data
- Validate required fields
- Insert into database with `seededFrom` source
- Set `claimed = false`
- Generate placeholder descriptions from provider type

**Questions:**
- Do we have provider data CSV ready?
- Or do I need to build a scraper first?
- What's the data format?

---

### 2. Claim Search API
```typescript
POST /api/claim/search
{
  "query": "Sunrise Senior Living",
  "city": "San Diego",
  "state": "CA"
}

Response:
{
  "matches": [
    {
      "id": "...",
      "name": "Sunrise Senior Living of San Diego",
      "address": "123 Main St",
      "city": "San Diego",
      "state": "CA",
      "providerType": "ASSISTED_LIVING",
      "phone": "(619) 555-0100",
      "claimed": false
    }
  ]
}
```

---

### 3. Claim Verification Flow
```typescript
POST /api/claim/initiate
{
  "providerId": "...",
  "verificationMethod": "phone" // or "email"
}

→ Sends 6-digit code via Twilio/SendGrid
→ Creates ClaimAttempt record with status="pending"

POST /api/claim/verify
{
  "providerId": "...",
  "code": "123456"
}

→ Validates code
→ Updates ClaimAttempt status="verified"
→ Updates Provider: claimed=true, claimedBy=userId, claimedAt=now()
→ Links User.providerId to Provider.id
```

**Questions:**
- Do we have Twilio account for SMS?
- Or should we use email-only for Sprint 1?
- What's the SMS budget?

---

### 4. UI Components Needed

**New Pages:**
- `/claim/search` - Search for your facility
- `/claim/verify` - Enter verification code
- `/claim/success` - Claim successful, simplified onboarding
- `/claim/not-found` - Can't find facility, create new

**Updated Pages:**
- `/provider/onboarding` - Add "Already listed? Claim it" option
- `/signup` - Add provider claiming CTA

**New Components:**
- `<ClaimSearchBar />` - Search with autocomplete
- `<ClaimResultCard />` - Provider match card with "Claim" button
- `<VerificationModal />` - Enter 6-digit code
- `<ClaimSuccessBanner />` - Celebration after claim

---

## SUCCESS METRICS

**Sprint 1 Goals:**
- Seed **2,000-10,000 provider profiles** from public data
- **10% claim rate** (200-1,000 providers claim their profiles)
- **<5% fraud rate** (verified ownership)
- **80% claim → completion** (claimed profiles finish onboarding)

**KPIs to Track:**
- Total seeded profiles
- Claim search usage
- Claim attempts per provider
- Claim verification success rate
- Claim → onboarding completion rate
- Fraud / duplicate attempts

---

## EFFORT ESTIMATE

**Data Acquisition:** 8-16 hours (depends on source)
**Seeding Script:** 4 hours
**Claim Search API:** 4 hours
**Claim Verification API:** 8 hours (with Twilio/SendGrid)
**Claim UI Flows:** 12 hours
**Fraud Prevention:** 4 hours
**Testing & QA:** 8 hours
**Documentation:** 2 hours

**Total: 50-58 hours** (~1-1.5 weeks)

---

## RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Data sourcing legal issues | High | Only use public domain data, add disclaimers |
| Low claim conversion | High | Email outreach, prominent CTAs |
| Fraud / fake claims | Medium | Multi-factor verification, rate limiting |
| Duplicate profiles | Medium | Fuzzy matching, duplicate detection |
| Verification SMS costs | Low | Email-only for Sprint 1, add SMS later |
| Provider data quality | Medium | Manual QA sample, allow claimed providers to edit all fields |

---

## QUESTIONS FOR YOU

Before I design detailed mockups and start building, please answer:

1. **Data Source:** Where should we get provider data? (Medicare.gov, Google Maps scrape, manual, data purchase?)

2. **Verification Method:** Phone SMS, email, or both? (Do we have Twilio budget?)

3. **Claim Flow:** Should claiming bypass onboarding, or require simplified onboarding?

4. **Entry Point:** Should claiming be part of provider signup flow, or separate "Claim Your Listing" page?

5. **Scope:** What's IN Sprint 1 (MVP) vs. deferred to Sprint 2?

6. **Data Volume:** How many providers should we seed? 2,000? 10,000? More?

7. **Geographic Focus:** Should we seed nationwide or focus on specific states/cities first?

8. **Provider Types:** Should we seed all 9 provider types or focus on specific ones? (e.g., Assisted Living + Memory Care only)

9. **Fraud Prevention:** Manual review required, or auto-approve after verification?

10. **Timeline:** When do you need Sprint 1 complete?

---

**Status:** 📋 **Awaiting Your Answers**
**Next Step:** You answer clarifying questions → I create detailed implementation plan → Get approval → Build

---

Let me know your preferences and I'll create a comprehensive implementation plan like we did for Sprint 0!
