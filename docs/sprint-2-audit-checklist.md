# Sprint 2 Audit Checklist

> **Sprint Goal**: A provider can view incoming requests, respond to families, and manage their profile.
> **Audit Date**: January 20, 2026
> **Status**: Ready for execution

---

## Pre-Audit: Seed Data Requirements

Before running the audit, ensure the following test data exists:

### Required Test Accounts

| Account Type | Email | Password | Purpose |
|--------------|-------|----------|---------|
| Family (complete profile) | `family.assisted.active@demo.com` | `demo123` | Test family → provider flow |
| Family (incomplete profile) | `family.new@demo.com` | `demo123` | Test visibility gate |
| Provider Org (claimed) | `org.sunshine@demo.com` | `demo123` | Test provider dashboard, engagement response |
| Provider Org (no engagements) | `org.clean@demo.com` | `demo123` | Test empty states |
| Individual Caregiver | `caregiver.maria@demo.com` | `demo123` | Test caregiver variant |
| **New User** | (create during test) | — | Test onboarding wizard |

### Required Engagement Scenarios

| Scenario | Family | Provider | Status | Has Messages |
|----------|--------|----------|--------|--------------|
| Pending request (family → org) | family.memory.early@demo.com | Memory Haven | PENDING | No |
| Accepted request (family → org) | family.assisted.active@demo.com | Sunshine Manor | ACCEPTED | Yes (with tour) |
| Completed request | family.nursing@demo.com | Skilled Nursing | COMPLETED | Yes |
| Pending hiring request | family.homecare@demo.com | Maria Santos | PENDING | No |

### Required Provider States

| State | Provider | Claimed | Verified | Has ProviderIdentity |
|-------|----------|---------|----------|----------------------|
| Claimed & Complete | Sunshine Manor | true | true | Yes |
| Claimed but Incomplete | OC Senior Living | true | false | Yes (missing fields) |
| **Unclaimed** (NEED TO ADD) | "Bay Area Senior Living" | false | false | No |

### Seed Data Gap Identified

**Action Required**: Add at least 1 unclaimed provider to seed.ts for claiming flow tests.

---

## Section 1: Shared Onboarding Wizard Overlay (Task 2.0.0)

### 1.1 Overlay Component Exists

| Test | How to Verify | Expected Result | Pass/Fail |
|------|---------------|-----------------|-----------|
| 1.1.1 | Check `components/Onboarding/OnboardingWizardOverlay.tsx` exists | File exists | |
| 1.1.2 | Review component supports variants | Props include `variant="family" \| "provider-org" \| "caregiver"` | |
| 1.1.3 | Verify dismissible (X button) | X button visible and closes overlay | |
| 1.1.4 | Verify step indicators | Progress steps shown in wizard | |

### 1.2 Wizard Triggers

| Test | Entry Point | Expected Behavior | Pass/Fail |
|------|-------------|-------------------|-----------|
| 1.2.1 | "Get Started" button (nav) | Opens overlay, asks family vs provider | |
| 1.2.2 | New signup (family mode) | After auth, family wizard triggers | |
| 1.2.3 | New signup (provider mode via `/for-providers`) | After auth, provider wizard triggers | |
| 1.2.4 | First switch to provider mode (no profile) | Provider wizard triggers | |
| 1.2.5 | `/provider/onboarding` direct URL | Redirects to `/provider/find-families` + triggers overlay | |

### 1.3 Intent Selection Flow

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 1.3.1 | Click "Get Started" | See "Are you looking for care?" vs "Are you a care provider?" | |
| 1.3.2 | Select "Care provider" | See "Individual caregiver?" vs "Care organization?" | |
| 1.3.3 | Select "Looking for care" | Family wizard starts | |

---

## Section 2: Family Onboarding (Task 2.0.1)

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 2.1 | New family signup | Wizard captures: name, location, care type | |
| 2.2 | Skip wizard early | Wizard closes, user stays on page | |
| 2.3 | Complete wizard | Profile created with entered data | |
| 2.4 | Check FamilyProfile in DB | Profile Card Minimum fields saved | |

---

## Section 3: Profile Completion & Visibility Gate (Task 2.0.2)

### 3.1 Family Visibility Gate

| Test | Scenario | Expected Result | Pass/Fail |
|------|----------|-----------------|-----------|
| 3.1.1 | Family without name/location/care type | Cannot toggle `isPublic` to true | |
| 3.1.2 | Family with Profile Card Minimum met | Can toggle `isPublic` to true | |
| 3.1.3 | Incomplete profile UI | Shows "Add [field] to make your profile visible" | |

### 3.2 Provider Visibility Gate

| Test | Scenario | Expected Result | Pass/Fail |
|------|----------|-----------------|-----------|
| 3.2.1 | Provider missing Tier 1 fields | Cannot enable visibility | |
| 3.2.2 | Provider with all Tier 1 fields | Can enable visibility | |
| 3.2.3 | Check `VisibilityGateWidget` | Shows completion status and missing fields | |

---

## Section 4: Contact Submission Redirect (Task 2.0.3)

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 4.1 | Family sends contact request to provider | After submission, redirects to `/dashboard/my-providers/[id]` | |
| 4.2 | Check redirect destination | Engagement detail page loads with success message | |

---

## Section 5: Provider Dashboard (Task 2.1)

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 5.1 | Navigate to `/provider/dashboard` | Dashboard loads | |
| 5.2 | Check profile completion widget | Shows completion percentage | |
| 5.3 | Check quick links | Links to: Find Families, Edit Profile, My Families | |
| 5.4 | Dashboard as provider without profile | Shows onboarding prompt | |

---

## Section 6: Provider Profile Editing (Task 2.2)

### 6.1 Profile Editor Access

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 6.1.1 | Click "Edit Profile" on provider dashboard | Profile editor loads | |
| 6.1.2 | Navigate to `/dashboard/provider-profile` | Profile editor accessible | |

### 6.2 Profile Sections

| Test | Section | Expected Result | Pass/Fail |
|------|---------|-----------------|-----------|
| 6.2.1 | Basic Info | Name, type, description, contact editable | |
| 6.2.2 | Services | Care types, specializations editable | |
| 6.2.3 | Amenities | Amenity checkboxes/fields working | |
| 6.2.4 | Photos | Photo upload functional | |
| 6.2.5 | Pricing | Price fields editable | |

### 6.3 Profile Save & Completion

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 6.3.1 | Edit a field and save | Changes persist on reload | |
| 6.3.2 | Check completion % updates | Completion widget reflects changes | |
| 6.3.3 | UX consistency | Matches family care profile editing pattern | |

---

## Section 7: Incoming Requests — Provider View (Task 2.3)

### 7.1 My Families Page (Provider Mode)

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 7.1.1 | Log in as provider, go to "My Families" | `/dashboard/my-providers` loads in provider mode | |
| 7.1.2 | Page title | Shows "My Families" (not "My Providers") | |
| 7.1.3 | Tab labels | "Families Reaching Out" / "Your Outreach" | |
| 7.1.4 | Default tab | "Families Reaching Out" (received) selected | |

### 7.2 Request Cards Display

| Test | Request State | Expected Display | Pass/Fail |
|------|---------------|------------------|-----------|
| 7.2.1 | PENDING request | Family name, location, message preview, date | |
| 7.2.2 | PENDING status badge | Shows "Needs your response" | |
| 7.2.3 | ACCEPTED request | Shows "Conversation started" | |
| 7.2.4 | COMPLETED request | Shows "Completed" | |

### 7.3 Empty States

| Test | Scenario | Expected Result | Pass/Fail |
|------|----------|-----------------|-----------|
| 7.3.1 | No received requests | Empty state with "Complete Your Profile" CTA | |
| 7.3.2 | No sent outreach | Empty state with "Browse Family Requests" CTA | |

---

## Section 8: Request Response — Accept/Decline (Task 2.4)

### 8.1 Accept/Decline Actions

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 8.1.1 | Click "Yes, Let's Connect" on PENDING | Status changes to ACCEPTED | |
| 8.1.2 | Click "No Thanks" on PENDING | Status changes to DECLINED | |
| 8.1.3 | Buttons only on received PENDING | Accept/Decline not shown for sent or non-pending | |

### 8.2 Post-Accept Behavior

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 8.2.1 | After accepting | Family contact info revealed (if individual) | |
| 8.2.2 | Refresh page | ACCEPTED status persists | |
| 8.2.3 | View engagement detail | Can see full conversation thread | |

### 8.3 Engagement Detail Page

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 8.3.1 | Click "View Request" | `/dashboard/my-providers/[id]` loads | |
| 8.3.2 | Message thread | All messages display chronologically | |
| 8.3.3 | Send reply | New message appears in thread | |
| 8.3.4 | Tour proposals | Tour section visible (if applicable) | |

---

## Section 9: Provider Claiming (Task 2.5)

### 9.1 Unclaimed Provider Display

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 9.1.1 | View unclaimed provider in directory | "Unclaimed" badge visible on card | |
| 9.1.2 | View unclaimed provider detail page | "Claim this listing" CTA visible | |
| 9.1.3 | Claimed provider detail page | No claim CTA (already claimed) | |

### 9.2 Claiming Flow

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 9.2.1 | Click "Claim this listing" (not logged in) | Auth modal appears | |
| 9.2.2 | Click "Claim this listing" (logged in, family mode) | Claim modal appears | |
| 9.2.3 | Confirm claim | Provider linked to user, badge changes to "Claimed" | |
| 9.2.4 | User mode after claim | User switched to PROVIDER mode | |
| 9.2.5 | Provider dashboard after claim | Shows claimed provider profile | |

### 9.3 Claiming Validation

| Test | Scenario | Expected Result | Pass/Fail |
|------|----------|-----------------|-----------|
| 9.3.1 | Try to claim already-claimed provider | Error: "This provider has already been claimed" | |
| 9.3.2 | User already owns a provider | Error: "You already own a provider profile" | |

---

## Section 10: End-to-End Provider Journey

| Step | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 10.1 | Create new account via `/for-providers` | Provider mode set, onboarding wizard triggers | |
| 10.2 | Complete provider onboarding | Provider profile created | |
| 10.3 | Navigate to "My Families" | Page loads, shows empty state | |
| 10.4 | Browse "Find Families" | Family profiles visible | |
| 10.5 | Send outreach to family | Request created, appears in "Your Outreach" | |
| 10.6 | Receive request from family (pre-seeded) | Request appears in "Families Reaching Out" | |
| 10.7 | Accept request | Status changes, contact info revealed | |
| 10.8 | Send reply message | Message appears in thread | |
| 10.9 | Edit provider profile | Changes save correctly | |
| 10.10 | Log out and log back in | Mode persists, data intact | |

---

## Section 11: Cross-Cutting Concerns

### 11.1 Navigation Consistency

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 11.1.1 | Provider mode nav dropdown | Shows: Find Families, Saved Families, My Families, Provider Dashboard | |
| 11.1.2 | "My Families" link in nav | Goes to `/dashboard/my-providers` | |
| 11.1.3 | Breadcrumbs on provider pages | Correct hierarchy displayed | |

### 11.2 Mode Switching

| Test | Action | Expected Result | Pass/Fail |
|------|--------|-----------------|-----------|
| 11.2.1 | Switch from family to provider | Landing: `/provider/find-families` | |
| 11.2.2 | Switch from provider to family | Landing: `/` (homepage) | |
| 11.2.3 | Mode persists across refresh | DB mode restored correctly | |

### 11.3 Build & Runtime

| Test | Command | Expected Result | Pass/Fail |
|------|---------|-----------------|-----------|
| 11.3.1 | `npm run build` | Completes without errors | |
| 11.3.2 | `npm run dev` | Starts without errors | |
| 11.3.3 | Console errors during audit | No unexpected errors | |

---

## Audit Summary

| Section | Pass | Fail | Blocked | Notes |
|---------|------|------|---------|-------|
| 1. Onboarding Overlay | | | | |
| 2. Family Onboarding | | | | |
| 3. Visibility Gate | | | | |
| 4. Contact Redirect | | | | |
| 5. Provider Dashboard | | | | |
| 6. Profile Editing | | | | |
| 7. Incoming Requests | | | | |
| 8. Request Response | | | | |
| 9. Provider Claiming | | | | |
| 10. E2E Journey | | | | |
| 11. Cross-Cutting | | | | |

---

## Issues Found

| ID | Section | Severity | Description | Resolution |
|----|---------|----------|-------------|------------|
| | | | | |

---

## Deferrals to Sprint 3+

| Item | Reason | Target Sprint |
|------|--------|---------------|
| | | |
