# Platform Audit Sprint Plan

## Audit Methodology

### For Each Flow

1. **Walk end-to-end** through every page in the flow
2. **Review against checklist** (see below)
3. **Document findings** with severity and recommendation
4. **Fix immediately** if safe and contained
5. **Log for follow-up** if requires broader consideration

### Audit Checklist (Applied to Every Page)

#### UI Consistency
- [ ] Typography matches system (headings, body, labels, helper text)
- [ ] Spacing follows system (page padding, card padding, gaps)
- [ ] Colors follow system (primary-600 actions, no purple remnants)
- [ ] Cards follow pattern (border, shadow, hover, layout order)
- [ ] Buttons follow variants (primary, secondary, outline, disabled)
- [ ] Icons consistent (Heroicons, correct sizes, stroke width)
- [ ] No jarring layout shifts between pages in flow

#### UX Guidance
- [ ] Page purpose immediately clear
- [ ] Primary CTA visible above fold
- [ ] User knows what they're doing and why
- [ ] User knows what happens next
- [ ] No dead ends (every state has forward action)
- [ ] Empty states have actionable CTAs
- [ ] Error states have recovery path
- [ ] 65+ friendly (large targets, clear language, no jargon)

#### Copy & Language
- [ ] CTAs specific to engagement type (Tour/Consultation/Interview)
- [ ] Meeting terminology used (not "request")
- [ ] Page title matches breadcrumb matches URL
- [ ] No semantic drift within flow
- [ ] Labels consistent with nav and other pages
- [ ] Helpful, not overwhelming

#### Technical Correctness
- [ ] Membership gating present where required
- [ ] Profile blocking invokes overlay (not toast)
- [ ] Status badges use correct colors
- [ ] Contact info properly gated
- [ ] Navigation links work
- [ ] Breadcrumbs correct

### Finding Severity Levels

| Level | Definition | Action |
|-------|------------|--------|
| **Critical** | Blocks flow, breaks business rule, security issue | Fix immediately |
| **High** | Major UX problem, confusing, 65+ unfriendly | Fix in sprint |
| **Medium** | Inconsistency, polish issue, minor confusion | Fix in sprint if time |
| **Low** | Nice-to-have, minor polish | Log for later |

### Finding Format

```
[SEVERITY] Page: /path/to/page
Flow: Flow Name
Issue: Clear description of the problem
Impact: Why this matters
Recommendation: Specific fix
Status: [ ] TODO / [x] FIXED / [~] DEFERRED
```

---

## Sprint Plan

### Sprint A: Anonymous & Authentication Flows (4 flows)

**Flows:**
1. A1: Browse Providers (No Account)
2. A2: Sign Up (Family Intent)
3. A3: Sign Up (Provider Intent)
4. A4: Login

**Pages to audit:**
- `/` (Homepage)
- `/browse`
- `/providers/[id]`
- `/login`
- `/signup`
- `/for-providers`
- GlobalOnboardingOverlay component
- AuthModal component

**Key checkpoints:**
- [ ] Homepage CTA clarity (family vs provider path)
- [ ] Browse → Provider → Engage flow seamless
- [ ] Auth modal handles pending action context
- [ ] Onboarding overlay intent-aware jumping works
- [ ] Provider signup redirects correctly
- [ ] Family signup redirects correctly
- [ ] All public pages have consistent nav

**Estimated scope:** 8-10 pages/components

---

### Sprint B: Family Core Flows (6 flows)

**Flows:**
1. F1: Complete Care Profile
2. F2: Search and Engage Provider (Facility - Tour)
3. F3: Search and Engage Provider (Home Care - Consultation)
4. F4: Search and Engage Provider (Caregiver - Interview)
5. F5: Manage Saved Providers
6. F6: View and Respond to Provider Outreach

**Pages to audit:**
- `/care-profile`
- `/care-profile/edit`
- `/browse` (family perspective)
- `/providers/[id]` (all 3 provider types)
- `/requests`
- `/requests/[id]`
- `/saved`
- `/saved/compare`
- EngagementConfirmationModal
- Profile completion blocking

**Key checkpoints:**
- [ ] Care profile edit has all required fields
- [ ] Profile completion triggers overlay (not toast)
- [ ] CTAs correct per provider type (Tour/Consultation/Interview)
- [ ] Engagement modal shows right content
- [ ] Meeting detail page has clear actions
- [ ] Saved page has compare flow
- [ ] Compare page allows engagement
- [ ] Inbound requests visible and actionable

**Estimated scope:** 12-15 pages/components

---

### Sprint C: Family Secondary Flows (3 flows)

**Flows:**
1. F7: View Recommendations/Matches
2. F8: Write Review (Two-Way System)
3. F9: Switch to Provider Mode

**Pages to audit:**
- `/matches`
- `/providers/[id]` (review section)
- ReviewModal component
- MainNav (mode switch)
- Mode switch API flow

**Key checkpoints:**
- [ ] Matches shows relevant providers
- [ ] Matches empty state guides to action
- [ ] Review modal has all required fields
- [ ] Review appears on provider profile
- [ ] Mode switch handles all profile states
- [ ] Mode switch redirects correctly

**Estimated scope:** 5-7 pages/components

---

### Sprint D: Provider (Organization) Flows (8 flows)

**Flows:**
1. PO1: Complete Provider Profile
2. PO2: Claim Unclaimed Provider
3. PO3: Browse and Respond to Family Leads
4. PO4: Browse and Hire Caregivers
5. PO5: Manage Incoming Applications
6. PO6: Manage Active Meetings
7. PO7: Review Family (Two-Way)
8. PO8: Respond to Review

**Pages to audit:**
- `/provider/leads`
- `/provider/profile`
- `/provider/profile/edit`
- `/provider/requests`
- `/provider/requests/[id]`
- `/provider/hire-staff`
- `/provider/hire-staff/[id]`
- `/provider/candidates`
- `/provider/candidates/[id]`
- ClaimProviderModal
- FamilyCard component
- CaregiverCard component

**Key checkpoints:**
- [ ] Leads page shows families correctly
- [ ] Profile edit has all Tier 1/2 fields
- [ ] Claim modal has verification flow
- [ ] Hire staff shows available caregivers
- [ ] Candidates pipeline has correct tabs
- [ ] Meeting detail allows propose/confirm time
- [ ] Review family appears after COMPLETED
- [ ] Review response posts correctly

**Estimated scope:** 15-18 pages/components

---

### Sprint E: Provider (Caregiver) Flows (5 flows)

**Flows:**
1. PC1: Complete Caregiver Profile
2. PC2: Browse Families Seeking Care
3. PC3: Browse Organizations Hiring
4. PC4: View and Respond to Interview Requests
5. PC5: Manage Employment Opportunities

**Pages to audit:**
- `/provider/profile` (caregiver variant)
- `/provider/profile/edit` (caregiver variant)
- `/caregiver`
- `/caregiver/browse-organizations`
- `/caregiver/browse-organizations/[id]`
- `/provider/opportunities`
- `/provider/opportunities/[id]`
- `/provider/requests` (caregiver variant)

**Key checkpoints:**
- [ ] Profile edit shows caregiver-specific fields
- [ ] availableForOrganizations toggle works
- [ ] Browse families shows public profiles
- [ ] Browse orgs shows hiring organizations
- [ ] Opportunities separate from family meetings
- [ ] Interview request handling correct

**Estimated scope:** 10-12 pages/components

---

### Sprint F: Paywall & Membership Flows (6 flows)

**Flows:**
1. PWC1: Caregiver Applies to Organization (GATED)
2. PWC2: Caregiver Sends Interview Request to Family (GATED)
3. PWC3: Caregiver Accepts Inbound Request (GATED)
4. PWO1: Org Sends Interview Request to Caregiver (GATED)
5. PWO2: Org Contacts Family (GATED)
6. PWO3: Org Accepts Family Outreach (GATED)

**Pages to audit:**
- PaywallModal component
- All engagement initiation points
- All acceptance buttons
- Stripe checkout flow
- Post-payment continuation
- `/settings` membership section

**Key checkpoints:**
- [ ] Paywall triggers on ALL provider engagement actions
- [ ] Paywall triggers on ACCEPT (not just initiate)
- [ ] Caregiver variant copy is laser-specific
- [ ] Organization variant copy is laser-specific
- [ ] Pending action context preserved through checkout
- [ ] Post-payment resumes original action
- [ ] Lapsed membership allows existing meetings
- [ ] Lapsed membership blocks new meetings

**Estimated scope:** 8-10 pages/components

---

### Sprint G: SEO & Claim Flows (4 flows)

**Flows:**
1. SEO-F1: Family Lands on Claimed Provider Page
2. SEO-F2: Family Lands on Unclaimed Provider Page
3. SEO-P1: Provider Claims Unclaimed Listing
4. TD1: Takedown Request Flow

**Pages to audit:**
- `/providers/[id]` (claimed vs unclaimed states)
- ClaimProviderModal (all 3 steps)
- TakedownRequestModal (all 3 steps)
- `/admin/takedown-requests`

**Key checkpoints:**
- [ ] Claimed vs unclaimed visual differences clear
- [ ] Unclaimed shows limited info (DMCA-safe)
- [ ] Claim CTA prominent on unclaimed
- [ ] Claim verification flow complete
- [ ] Takedown request submits correctly
- [ ] Admin can review/approve/deny

**Estimated scope:** 5-7 pages/components

---

### Sprint H: Lifecycle & Calendar Flows (6 flows)

**Flows:**
1. NRA1: Notification → Confirm Meeting → Schedule Time
2. NRA2: Notification → Confirm Proposed Time → Add to Calendar
3. NRA3: Notification → Message Received → Reply
4. SEC1: Save → Compare → Engage → Schedule
5. RSC1: Reschedule Confirmed Meeting
6. RSC2: Cancel Meeting
7. RSC3: Decline/Cancel Entire Meeting

**Pages to audit:**
- NotificationDropdown component
- `/notifications`
- Meeting detail pages (propose time UI)
- Calendar link generation
- TourAppointment states
- Reschedule flow
- Cancel flow

**Key checkpoints:**
- [ ] Notifications link to correct pages
- [ ] Notification click marks as read
- [ ] Propose time UI clear and simple
- [ ] Calendar links generate correctly
- [ ] Reschedule notifies other party
- [ ] Cancel has confirmation
- [ ] Decline ends engagement correctly

**Estimated scope:** 8-10 pages/components

---

### Sprint I: Edge Cases & Recovery Flows (8 flows)

**Flows:**
1. EC1: Family Tries to Schedule Meeting Without Profile
2. EC2: Provider Tries to Engage Without Complete Profile
3. ES1-ES3: Empty State Flows
4. ER1-ER3: Error Recovery Flows
5. MS1-MS3: Mode Switching Edge Cases
6. PR1: Contact Reveal on Acceptance
7. AD1: User Deletes Account
8. AD2: Subscription Cancellation

**Pages to audit:**
- GlobalOnboardingOverlay (all edge cases)
- All pages for empty states
- Error handling in all API calls
- Mode switch with various profile states
- Contact gating in meeting details
- `/settings` (delete account, cancel membership)

**Key checkpoints:**
- [ ] Profile blocking uses overlay not toast
- [ ] All empty states have actionable CTAs
- [ ] Network errors show toast with retry
- [ ] Session expired redirects to login
- [ ] Mode switch handles incomplete profiles
- [ ] Contact info reveals only after ACCEPTED
- [ ] Account deletion cancels meetings
- [ ] Subscription cancellation shows end date

**Estimated scope:** 10-12 pages/components

---

### Sprint J: Admin Flows (3 flows)

**Flows:**
1. AD1: Bootstrap Admin Account
2. AD2: Seed Demo Data
3. AD3: Handle Takedown Requests

**Pages to audit:**
- `/admin/bootstrap`
- `/admin/seed`
- `/admin/takedown-requests`
- `/admin/clear-requests`

**Key checkpoints:**
- [ ] Bootstrap only works when no admin exists
- [ ] Seed creates all required test data
- [ ] Takedown review shows all details
- [ ] Approve/deny work correctly

**Estimated scope:** 4 pages

---

### Sprint K: Cross-Cutting Audit

**Focus areas:**
1. Global terminology audit (request → meeting)
2. Global CTA audit (no generic "Contact")
3. Global badge color audit
4. Global empty state audit
5. Global breadcrumb audit
6. Global PageHero consistency
7. Global card component consistency

**Components to audit:**
- ProviderCard
- FamilyCard
- CaregiverCard
- PageHero (all usages)
- EmptyState (all usages)
- Breadcrumb (all usages)
- All status badges
- All CTAs site-wide

**Key checkpoints:**
- [ ] No "request" in UI copy (database OK)
- [ ] No generic "Contact" buttons
- [ ] Badge colors consistent across pages
- [ ] Empty states use EmptyState component
- [ ] Breadcrumbs show names not IDs
- [ ] PageHero used on all main pages
- [ ] Cards have consistent field order

**Estimated scope:** Full codebase scan

---

## Execution Tracker

| Sprint | Flows | Est. Pages | Status | Findings | Fixed |
|--------|-------|------------|--------|----------|-------|
| A | 4 | 8-10 | [ ] Not Started | 0 | 0 |
| B | 6 | 12-15 | [ ] Not Started | 0 | 0 |
| C | 3 | 5-7 | [ ] Not Started | 0 | 0 |
| D | 8 | 15-18 | [ ] Not Started | 0 | 0 |
| E | 5 | 10-12 | [ ] Not Started | 0 | 0 |
| F | 6 | 8-10 | [ ] Not Started | 0 | 0 |
| G | 4 | 5-7 | [ ] Not Started | 0 | 0 |
| H | 7 | 8-10 | [ ] Not Started | 0 | 0 |
| I | 8 | 10-12 | [ ] Not Started | 0 | 0 |
| J | 3 | 4 | [ ] Not Started | 0 | 0 |
| K | N/A | Full scan | [ ] Not Started | 0 | 0 |

**Total: 54+ flows, 90-115 pages/components**

---

## Findings Log

### Sprint A Findings
```
(To be populated during audit)
```

### Sprint B Findings
```
(To be populated during audit)
```

### Sprint C Findings
```
(To be populated during audit)
```

### Sprint D Findings
```
(To be populated during audit)
```

### Sprint E Findings
```
(To be populated during audit)
```

### Sprint F Findings
```
(To be populated during audit)
```

### Sprint G Findings
```
(To be populated during audit)
```

### Sprint H Findings
```
(To be populated during audit)
```

### Sprint I Findings
```
(To be populated during audit)
```

### Sprint J Findings
```
(To be populated during audit)
```

### Sprint K Findings
```
(To be populated during audit)
```

---

## Summary Metrics (To Be Updated)

| Metric | Count |
|--------|-------|
| Total Critical findings | 0 |
| Total High findings | 0 |
| Total Medium findings | 0 |
| Total Low findings | 0 |
| Fixed immediately | 0 |
| Deferred | 0 |
| Sprints completed | 0/11 |

---

*Document created for systematic platform audit. Update findings log as audit progresses.*
