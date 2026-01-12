# User Journey Maps - Olera Platform
*Generated: 2026-01-12*
*Purpose: Comprehensive UX/UI Audit Framework*

---

## Overview

This document maps the complete user journeys for all three user types on the Olera platform:
1. **Families** - Seeking care for loved ones
2. **Individual Caregivers** - Seeking employment or families to serve
3. **Organizations** - Facilities/agencies seeking families and hiring caregivers

Each journey is mapped from initial landing through goal completion, with critical activation points and success criteria identified.

---

## 1. FAMILY USER JOURNEY

### Primary Goal
Find trusted care provider/facility for a loved one

### Journey Stages

#### Stage 1: Discovery & Search
**Entry Points:**
- Landing page (/) - unauthenticated
- Direct from marketing/referrals

**Key Pages:**
- `/` - Home page with provider search/browse
- Care category dropdowns (Home Care, Assisted Living, Memory Care, Nursing Home, etc.)
- `/plan-care` - Care planning resources

**Features:**
- Provider search with filters (location, care type, price, rating, etc.)
- Provider cards showing photos, ratings, pricing, location
- Map view of providers
- Filter by: care type, price range, availability, amenities, insurance, languages, ratings

**Success Criteria:**
- User can quickly understand what Olera offers
- Provider cards are visually appealing and informative
- Search/filters work smoothly and return relevant results
- Photos display correctly on all provider cards

**Critical UX Elements:**
- Clear value proposition
- Intuitive search interface
- High-quality provider photos (CRITICAL - was broken)
- Filter options are comprehensive but not overwhelming
- Loading states for search results
- Empty states if no results

---

#### Stage 2: Evaluation & Comparison
**Key Pages:**
- `/providers/[id]` - Individual provider detail page
- `/` - Search results for comparison

**Features:**
- Detailed provider information (services, pricing, photos, reviews, amenities)
- Photo galleries
- Reviews and ratings
- Contact information
- Save/bookmark providers
- Compare multiple providers

**Success Criteria:**
- Provider detail pages load quickly
- All information is well-organized and easy to scan
- Photos are high-quality and showcase facility/caregiver
- Reviews are authentic and helpful
- Clear CTAs to contact or request consultation

**Critical UX Elements:**
- Professional, trustworthy design
- Complete provider information
- Social proof (reviews, ratings, certifications)
- Easy navigation back to search
- Save functionality works intuitively

---

#### Stage 3: Account Creation & Profile Setup ⚠️ CRITICAL ACTIVATION POINT
**Key Pages:**
- `/signup` - Account creation
- `/login` - Returning users
- `/dashboard` - Family dashboard (post-login landing)
- `/dashboard/care-profile` - Care profile creation/editing

**Features:**
- Email/password signup
- Family mode account
- Create care profile with:
  - Care needs
  - Budget
  - Location/preferences
  - Loved one's information
  - **Visibility toggle** - Make profile public for providers to find

**Success Criteria:**
- Signup process is quick and painless
- User understands why they need a profile
- Profile creation is intuitive with clear guidance
- User knows when their profile is complete
- **User understands visibility controls** - critical for marketplace activation
- Profile completeness indicator/progress bar

**Critical UX Elements:**
- Minimal friction during signup
- Clear value proposition for creating profile
- **Prominent, clear visibility toggle** (enables providers to find them)
- Profile preview/visibility settings are obvious
- Helpful tooltips/guidance
- Validation and error messages
- Success confirmation when profile is public

**Known Issues/Questions:**
- Is there profile completeness tracking?
- Are visibility controls clear and prominent?
- Do users understand what "making profile public" means?
- Is there onboarding guidance after signup?

---

#### Stage 4: Contact & Request Consultation
**Key Pages:**
- `/providers/[id]` - Provider detail page with contact CTA
- `/dashboard/requests/new` - New consultation request form
- `/dashboard/requests` - View sent requests

**Features:**
- Request consultation with providers
- Send messages to providers
- Track consultation requests
- See request status (pending, accepted, declined)
- Unread message notifications

**Success Criteria:**
- Easy to initiate contact from provider page
- Request form is simple and quick
- User receives confirmation after sending request
- Clear status tracking for all requests
- Notifications when providers respond

**Critical UX Elements:**
- Prominent "Contact" or "Request Consultation" CTA
- Simple, pre-filled request form
- Real-time status updates
- Clear visual distinction between request states
- Badge counts for unread messages

---

#### Stage 5: Conversation & Relationship Management
**Key Pages:**
- `/dashboard/requests` - "My Providers" tab with all conversations
- `/dashboard/requests/[id]` - Individual conversation thread
- `/dashboard/saved` - Saved providers

**Features:**
- Message threading with providers
- Save/unsave providers
- View conversation history
- Upload documents/photos in messages
- Real-time chat or threaded messaging

**Success Criteria:**
- Conversations are organized and easy to navigate
- Messaging interface is intuitive (like familiar chat apps)
- Unread messages are clearly indicated
- User can easily find past conversations
- Saved providers are accessible

**Critical UX Elements:**
- Clean, familiar messaging UI
- Unread indicators and badge counts
- Quick access to provider profile from conversation
- Search/filter conversations
- Timestamp and read receipts
- **Consistent card design** across saved/requests pages

**Known Issues:**
- Card design inconsistency between "My Providers" and other pages (FIXED)

---

#### Stage 6: Decision & Ongoing Relationship
**Key Features:**
- Complete consultation request (mark as completed)
- Leave reviews for providers
- Continue ongoing communication
- Request additional services

**Success Criteria:**
- Clear path to mark relationship milestones
- Easy to leave feedback/reviews
- Ongoing communication feels seamless
- User can request additional help/services

---

### Family Journey: Critical Pages Summary
1. `/` - Home/Find Providers ✅ Primary entry
2. `/providers/[id]` - Provider detail page
3. `/signup` & `/login` - Authentication
4. `/dashboard` - Family dashboard (care profile hub)
5. `/dashboard/care-profile` - Create/edit care profile ⚠️ CRITICAL
6. `/dashboard/requests/new` - New consultation request
7. `/dashboard/requests` - My Providers (conversations)
8. `/dashboard/requests/[id]` - Individual conversation
9. `/dashboard/saved` - Saved providers
10. `/settings` - Account settings

**Priority Audit Areas:**
- ⚠️ Profile creation & visibility controls (activation)
- ⚠️ Provider card photo display (visual appeal)
- ⚠️ Search & filtering (core functionality)
- ⚠️ Messaging & request management (engagement)

---

## 2. INDIVIDUAL CAREGIVER USER JOURNEY

### Primary Goals
- **Path A:** Find families to provide direct care
- **Path B:** Find employment with organizations

### Journey Stages

#### Stage 1: Discovery
**Entry Points:**
- Landing page (/)
- "For Providers" link → `/for-providers`
- Direct from job boards/referrals

**Key Pages:**
- `/` or `/for-providers` - Landing/overview
- Signup prompt for provider account

**Features:**
- Learn about Olera as caregiver/provider
- Understand dual paths: serve families OR work for organizations
- Clear CTAs to create provider profile

**Success Criteria:**
- Caregiver understands value proposition
- Dual paths (families vs organizations) are clear
- Easy to get started with profile creation

---

#### Stage 2: Account Creation & Provider Profile Setup ⚠️ CRITICAL ACTIVATION POINT
**Key Pages:**
- `/signup` - Account creation
- `/login` - Returning users
- Provider mode activated (activeMode: PROVIDER)
- `/provider/dashboard` - Provider profile hub
- `/providers/create` or profile editing - Provider profile creation
- Possibly `/provider/onboarding` - Onboarding flow

**Features:**
- Create provider profile as INDEPENDENT_CAREGIVER
- Profile includes:
  - Name, photo, bio
  - Credentials, certifications, background check
  - Services offered (care types)
  - Availability, location, service radius
  - Pricing/rates
  - **Availability toggles:**
    - `availableForFamilies` - Visible to families seeking care
    - `availableForOrganizations` - Visible to organizations hiring
  - Photos, cover photo

**Success Criteria:**
- Profile creation is straightforward with clear guidance
- Caregiver understands what information is required vs optional
- **Visibility toggles are prominent and clear**
- Profile preview shows what families/organizations will see
- Profile completeness indicator/progress tracking
- Photos upload smoothly and display correctly

**Critical UX Elements:**
- Profile creation wizard or guided flow
- **Clear, prominent availability toggles** (activation mechanism)
- Photo upload with preview
- Validation and helpful error messages
- Profile preview/visibility settings
- Tooltip help for complex fields
- Progress indicator for profile completion
- Success message when profile is public

**Known Issues/Questions:**
- Does profile creation flow exist?
- Are availability toggles clear and prominent?
- Is there profile completeness tracking?
- Do caregivers understand what making profile "available" means?
- Is there onboarding after signup?

---

#### Stage 3A: Find Families (Direct Care Path)
**Key Pages:**
- `/provider/requests` - "Find Families" - Browse family care profiles
- `/provider/saved` - Saved families
- `/dashboard/requests` - "My Families" - Conversations with families

**Features:**
- Browse family profiles seeking care (requires families have `visibleToProviders: true`)
- Filter families by: care type needed, location, budget
- View family care needs, loved one info, preferences
- Save interesting family profiles
- Request consultation with families
- Track sent requests and responses

**Success Criteria:**
- Family profiles display correctly with all relevant information
- Caregivers can find families that match their skills
- Saving and requesting consultations works smoothly
- **Family profiles are actually visible** (depends on families making profiles public)
- Clear indication when no families are available

**Critical UX Elements:**
- Family profile cards with photos, care needs, location
- Filtering and search functionality
- Save/unsave functionality
- Request consultation CTA
- Empty state if no families visible (with explanation)
- Status tracking for sent requests

**Known Issues:**
- Find Families showing no results (needs testing after visibility fix)
- Saved Families showing empty (needs testing after seed data fix)

---

#### Stage 3B: Find Employment with Organizations (Hiring Path)
**Key Pages:**
- `/caregiver/browse-organizations` - "Find Hiring Organizations"
- `/caregiver/browse-organizations/[id]` - Organization detail page
- `/provider/hiring-requests` - "My Job Opportunities"
- Possibly `/caregiver/browse-organizations/get-started` - Landing page if no profile

**Features:**
- Browse organizations actively hiring caregivers (requires `hiringCaregivers: true`)
- Filter organizations by: location, facility type, benefits, pay range
- View organization profiles, photos, descriptions
- Express interest / apply to organizations
- Track hiring requests and interview opportunities
- View hiring request status

**Success Criteria:**
- Organization profiles display correctly with photos
- Caregivers can find relevant job opportunities
- Expressing interest / applying works smoothly
- **Hiring requests display correctly** (was broken, now fixed with EnhancedHiringRequestCard)
- Clear status tracking for applications

**Critical UX Elements:**
- Organization cards with photos, facility info, location
- **Modern card design matching site standards** ✅ FIXED
- Filtering and search for job opportunities
- "Apply" or "Express Interest" CTA
- Hiring request cards with status badges, message previews
- Empty state if no hiring organizations
- Grid layout consistency ✅ FIXED to 3-column

**Recent Fixes:**
- ✅ Enhanced hiring request cards with modern design
- ✅ 3-column grid layout matching site-wide standards
- ✅ Status badges (needs response, conversation started, etc.)
- ✅ Photo display on hiring request cards

---

#### Stage 4: Conversation & Engagement
**Key Pages:**
- `/dashboard/requests` - All conversations (families OR organizations)
- `/dashboard/requests/[id]` - Individual conversation thread

**Features:**
- Message with families or organizations
- Track conversation status
- Negotiate rates, schedule interviews
- Share credentials, references
- Accept/decline opportunities

**Success Criteria:**
- Messaging works seamlessly for both paths (families & organizations)
- Clear distinction between family consultations and hiring opportunities
- Status updates are clear (pending, conversation started, etc.)
- Unread message notifications work

**Critical UX Elements:**
- Clean messaging interface
- Context-aware labels (families vs job opportunities)
- Unread badges
- Quick access to profiles from conversations

---

#### Stage 5: Ongoing Work & Relationship Management
**Features:**
- Manage ongoing relationships with families or employment
- Update availability as needed
- Receive new consultation/hiring requests
- Build reputation with reviews/ratings

---

### Caregiver Journey: Critical Pages Summary
1. `/` or `/for-providers` - Landing ✅ Entry
2. `/signup` & `/login` - Authentication
3. `/provider/dashboard` - Provider profile hub ⚠️ CRITICAL
4. `/providers/create` or profile editing - Create/edit provider profile ⚠️ CRITICAL
5. `/provider/requests` - Find Families (if `availableForFamilies: true`)
6. `/provider/saved` - Saved families
7. `/caregiver/browse-organizations` - Find Hiring Organizations (if `availableForOrganizations: true`)
8. `/caregiver/browse-organizations/[id]` - Organization detail
9. `/provider/hiring-requests` - My Job Opportunities ✅ Recently redesigned
10. `/dashboard/requests` - My Families / All conversations
11. `/dashboard/requests/[id]` - Individual conversation
12. `/settings` - Account settings

**Priority Audit Areas:**
- ⚠️ Provider profile creation & availability toggles (activation)
- ⚠️ Find Families visibility (depends on family profiles being public)
- ✅ Hiring requests UI (recently fixed)
- ⚠️ Saved Families functionality
- ⚠️ Dual-path clarity (families vs organizations)

---

## 3. ORGANIZATION USER JOURNEY

### Primary Goals
- Get discovered by families seeking care
- Hire caregivers to staff organization

### Journey Stages

#### Stage 1: Discovery & Signup
**Entry Points:**
- Landing page (/)
- "For Providers" link → `/for-providers`
- Direct from marketing/partnerships

**Key Pages:**
- `/for-providers` - Provider landing page
- `/signup` - Account creation

**Features:**
- Learn about Olera as an organization
- Understand benefits (family discovery + caregiver hiring)
- Clear CTAs to create provider profile

**Success Criteria:**
- Organization understands value proposition
- Easy path to signup and profile creation

---

#### Stage 2: Account Creation & Organization Profile Setup ⚠️ CRITICAL ACTIVATION POINT
**Key Pages:**
- `/signup` - Account creation
- Provider mode activated (activeMode: PROVIDER)
- `/provider/dashboard` - Provider profile hub
- `/providers/create` or profile editing - Organization profile creation
- Possibly `/provider/onboarding` - Onboarding flow

**Features:**
- Create provider profile as organization type:
  - ASSISTED_LIVING
  - MEMORY_CARE
  - NURSING_HOME
  - HOME_CARE_AGENCY
  - ADULT_DAY_CARE
- Profile includes:
  - Organization name, logo, photos
  - Facility description, amenities
  - Services offered, care types
  - Pricing, capacity, availability
  - Certifications, licenses, reviews
  - Location, contact info
  - **Hiring toggle:** `hiringCaregivers` - Makes organization visible to caregivers seeking jobs
  - Staff information, credentials
  - Virtual tours, brochures

**Success Criteria:**
- Profile creation is comprehensive but not overwhelming
- Organizations can showcase their facility effectively
- **Hiring toggle is prominent and clear**
- Profile preview shows what families AND caregivers will see
- Photos upload smoothly and display correctly
- Profile completeness tracking

**Critical UX Elements:**
- Comprehensive profile editor (likely multi-step)
- Photo gallery upload and management
- **Clear, prominent hiring toggle** (enables caregiver discovery)
- Profile preview for both audiences (families & caregivers)
- Validation and helpful guidance
- Progress indicator
- Success confirmation when profile is public

**Known Issues/Questions:**
- Does profile creation flow exist for organizations?
- Is hiring toggle clear and prominent?
- Is there profile completeness tracking?
- Do organizations understand dual visibility (families AND caregivers)?
- Is there onboarding after signup?

---

#### Stage 3A: Get Discovered by Families
**Key Pages:**
- Organization profile appears in family search results (/)
- `/providers/[id]` - Organization detail page viewed by families

**Features:**
- Organization profile is visible in family search
- Families can view full profile, photos, reviews
- Families can request consultation with organization
- Organization receives consultation requests

**Success Criteria:**
- Organization profile displays correctly in family search
- Photos display correctly (was broken, now fixed)
- Profile is compelling and professional
- Contact CTAs are clear for families
- Organization receives notifications of family requests

**Critical UX Elements:**
- High-quality photos and professional presentation
- Complete, accurate information
- Social proof (reviews, ratings, certifications)
- Clear contact options

**Recent Fixes:**
- ✅ Photos now display correctly (Next.js config fix)

---

#### Stage 3B: Hire Caregivers
**Key Pages:**
- `/provider/hire-staff` - Hire care staff hub
- `/provider/hire-staff/get-started` - Landing page if profile not setup for hiring
- Browse caregiver profiles (page may not exist yet?)
- `/provider/hiring-requests` - "My Candidates" (hiring requests received FROM caregivers)

**Features:**
- Make organization visible to caregivers (`hiringCaregivers: true`)
- Browse caregiver profiles (if this feature exists)
- Receive hiring requests from interested caregivers
- Review caregiver applications/interest
- Message with caregiver candidates
- Track hiring pipeline

**Success Criteria:**
- Organization is discoverable by caregivers when hiring toggle is on
- **Hiring requests display correctly** (was broken, now fixed with EnhancedHiringRequestCard)
- Organizations can review candidate profiles
- Messaging with candidates works smoothly
- Clear status tracking for hiring pipeline

**Critical UX Elements:**
- Clear hiring toggle in profile settings
- Caregiver profile cards with credentials, experience, ratings
- **Modern hiring request cards** ✅ FIXED
- Filtering and search for candidates
- Interview scheduling or next steps
- Status tracking (reviewing, interview scheduled, hired, etc.)

**Recent Fixes:**
- ✅ Enhanced hiring request cards with modern design
- ✅ "My Candidates" tab shows hiring requests correctly

**Known Issues/Questions:**
- Does a "Browse Caregivers" feature exist?
- Or is hiring purely request-based (caregivers apply, orgs review)?
- Is the hiring process flow clear end-to-end?

---

#### Stage 4: Manage Inquiries from Families
**Key Pages:**
- `/provider/requests` or `/dashboard/requests` - Family consultation requests
- `/provider/requests/[id]` - Individual conversation with family
- `/provider/saved` - Saved family profiles (if proactive outreach exists)

**Features:**
- Receive consultation requests from families
- View family care needs and profiles
- Respond to inquiries
- Schedule tours or consultations
- Track conversation pipeline

**Success Criteria:**
- Consultation requests are organized and easy to manage
- Organizations can quickly understand family needs
- Messaging is smooth and professional
- Status tracking for leads/pipeline

**Critical UX Elements:**
- Request cards with family info, care needs
- Filtering and status tracking
- Quick response options
- Tour scheduling integration (if exists)

---

#### Stage 5: Ongoing Operations
**Features:**
- Manage relationships with families (admissions, ongoing care)
- Manage caregiver staff (hiring, scheduling)
- Update profile, photos, availability
- Respond to reviews
- Analytics and reporting (if exists)

---

### Organization Journey: Critical Pages Summary
1. `/for-providers` - Landing ✅ Entry
2. `/signup` & `/login` - Authentication
3. `/provider/dashboard` - Provider profile hub ⚠️ CRITICAL
4. `/providers/create` or profile editing - Create/edit organization profile ⚠️ CRITICAL
5. `/providers/[id]` - Organization detail page (viewed by families)
6. `/provider/requests` - Find Families OR Family requests (dual use?)
7. `/provider/saved` - Saved families (if proactive outreach)
8. `/provider/hire-staff` - Hire care staff hub
9. `/provider/hire-staff/get-started` - Hiring landing page
10. Browse caregivers (page unknown - may not exist?)
11. `/provider/hiring-requests` - My Candidates ✅ Recently redesigned
12. `/dashboard/requests` - All conversations
13. `/dashboard/requests/[id]` - Individual conversation
14. `/settings` - Account settings

**Priority Audit Areas:**
- ⚠️ Organization profile creation & hiring toggle (activation)
- ✅ Photos display correctly (recently fixed)
- ✅ Hiring requests UI (recently fixed)
- ⚠️ Family consultation request management
- ⚠️ Caregiver discovery/browsing (unclear if exists)
- ⚠️ Dual-audience clarity (families AND caregivers)

---

## Cross-Journey: Critical Activation Points

These are the **marketplace activation mechanisms** that enable the platform to function:

### 1. Family Profile Visibility
- **Field:** `FamilyProfile.visibleToProviders`
- **Controls:** Whether family profiles appear in "Find Families" for caregivers
- **UI Location:** Care profile settings (needs audit)
- **Status:** Recently added to schema, seeded with demo data
- **Critical:** Without this, caregivers can't find families

### 2. Caregiver Availability
- **Fields:**
  - `Provider.availableForFamilies` - Visible to families seeking care
  - `Provider.availableForOrganizations` - Visible to organizations hiring
- **Controls:** Whether caregiver profiles appear in search results
- **UI Location:** Provider profile settings (needs audit)
- **Status:** In schema, needs UI audit
- **Critical:** Without these, caregivers are invisible to both audiences

### 3. Organization Hiring Status
- **Field:** `Provider.hiringCaregivers`
- **Controls:** Whether organization appears in "Find Hiring Organizations" for caregivers
- **UI Location:** Provider profile settings (needs audit)
- **Status:** Recently added to schema, seeded with demo data
- **Critical:** Without this, caregivers can't find job opportunities

### 4. Profile Completeness
- **Controls:** Whether profiles are compelling and complete enough to convert
- **UI Location:** Profile dashboard (needs audit)
- **Status:** Unknown if completeness tracking exists
- **Critical:** Incomplete profiles hurt conversion

---

## Next Steps: Page-by-Page Audit

Now that journeys are mapped, the audit will proceed through:

**Phase 1: Family Journey Audit**
- Home page / Provider search
- Provider detail pages
- Signup & authentication
- Family dashboard & care profile creation ⚠️ PRIORITY
- Saved providers
- My Providers / Requests
- Conversation threads

**Phase 2: Caregiver Journey Audit**
- Provider landing page
- Provider profile creation ⚠️ PRIORITY
- Find Families
- Saved Families
- Find Hiring Organizations
- Hiring requests ✅ Recently fixed
- Conversations

**Phase 3: Organization Journey Audit**
- Organization profile creation ⚠️ PRIORITY
- Family consultation requests
- Hiring candidates ✅ Recently fixed
- Conversations

**Phase 4: Cross-Cutting Audit**
- Navigation consistency
- Design system consistency (cards, buttons, typography)
- Responsive behavior
- Loading states and error handling
- Empty states
- Settings and account management

---

**End of Journey Mapping Phase**
