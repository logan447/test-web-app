# Sprint 2 Corrected Audit Walkthrough

> **Sprint Goal**: A provider can view incoming requests, respond to families, and manage their profile.
> **Deployment**: Vercel (production/preview URL)
> **Test Password**: `test1234!` (all seeded accounts)

---

## Pre-Audit Setup

### 1. Seed Database
Navigate to `/admin/seed` and click the seed button to create test accounts.

### 2. Test Account Credentials
All accounts use password: `test1234!`

| Purpose | Email | Notes |
|---------|-------|-------|
| Fresh user (no profiles) | `newuser@test.olera.com` | For sign-up flow testing |
| Family (complete profile) | `family@test.olera.com` | Has visible family profile |
| Family (private profile) | `family2@test.olera.com` | Has private family profile |
| Provider Organization | `provider@test.olera.com` | Organization with staff |
| Individual Caregiver | `caregiver@test.olera.com` | Independent caregiver |
| Dual-mode user | `dual@test.olera.com` | Has both family and provider profiles |
| Admin | `admin@test.olera.com` | Admin access |

---

## Walkthrough 0A: Fresh Family Sign-Up Flow

**Goal**: Test complete account creation and family onboarding wizard for a new user.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 0A.1 | Navigate to homepage | Homepage loads with "Get Started" button visible | | |
| 0A.2 | Click "Get Started" button | **Create Account form** opens (email/password fields) | | |
| 0A.3 | Enter new email and password, submit | Account created successfully | | |
| 0A.4 | Observe post-signup | **Onboarding wizard overlay** appears automatically | | |
| 0A.5 | Check wizard first question | Wizard shows intent question: "Are you looking for care?" vs "Are you a care provider?" | | |
| 0A.6 | Select "Looking for care" | Family onboarding variant starts | | |
| 0A.7 | Complete wizard steps | Captures: name, location, care type | | |
| 0A.8 | Check redirect after completion | Lands on homepage (`/`) | | |
| 0A.9 | Navigate to `/dashboard/care-profile` | Family profile shows captured data | | |

---

## Walkthrough 0B: Fresh Provider Organization Sign-Up Flow

**Goal**: Test complete account creation and provider organization onboarding wizard.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 0B.1 | Log out if logged in | Logged out state | | |
| 0B.2 | Navigate to `/for-providers` | Provider landing page loads | | |
| 0B.3 | Click main CTA (Get Started/Sign Up) | **Create Account form** opens | | |
| 0B.4 | Enter new email and password, submit | Account created successfully | | |
| 0B.5 | Observe post-signup | **Onboarding wizard overlay** appears | | |
| 0B.6 | Check wizard | Intent question or provider-type question appears | | |
| 0B.7 | Select "Care organization" (if asked) | Organization onboarding variant | | |
| 0B.8 | Complete organization onboarding | Captures: org name, services, location | | |
| 0B.9 | Check redirect | Lands on `/provider/find-families` or provider dashboard | | |
| 0B.10 | Navigate to `/dashboard/provider-profile` | Provider profile shows captured data | | |

---

## Walkthrough 0C: Fresh Individual Caregiver Sign-Up Flow

**Goal**: Test complete account creation and individual caregiver onboarding wizard.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 0C.1 | Log out if logged in | Logged out state | | |
| 0C.2 | Navigate to homepage | Homepage loads | | |
| 0C.3 | Click "Get Started" | **Create Account form** opens | | |
| 0C.4 | Enter new email and password, submit | Account created | | |
| 0C.5 | Observe onboarding wizard | Wizard overlay appears with intent question | | |
| 0C.6 | Select "Care provider" | Provider subtype question appears | | |
| 0C.7 | Select "Individual caregiver" | Caregiver onboarding variant | | |
| 0C.8 | Complete caregiver onboarding | Captures: name, skills, location, experience | | |
| 0C.9 | Check redirect | Lands on `/caregiver/browse-organizations` | | |
| 0C.10 | Navigate to `/dashboard/provider-profile` | Caregiver profile shows captured data | | |

---

## Walkthrough 1: Returning Family User - Find Care

**Goal**: Verify returning family user can browse providers and view profiles.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1.1 | Log in as `family@test.olera.com` | Login succeeds | | |
| 1.2 | Navigate to homepage (`/`) | Provider directory loads | | |
| 1.3 | Browse provider cards | Provider cards display with name, type, location | | |
| 1.4 | Apply filters (if available) | Results filter correctly | | |
| 1.5 | Click on a provider card | `/providers/[id]` detail page loads | | |
| 1.6 | Check provider detail content | Shows name, description, services, contact options | | |

---

## Walkthrough 2: Family Contacts Provider

**Goal**: Verify family can submit contact request and see engagement.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 2.1 | Log in as `family@test.olera.com` | Login succeeds | | |
| 2.2 | Navigate to a provider detail page (`/providers/[id]`) | Page loads | | |
| 2.3 | Click "Schedule Tour" or "Contact" | Contact modal opens | | |
| 2.4 | Fill out form and submit | Form submits successfully | | |
| 2.5 | Check redirect | Redirected to `/dashboard/my-providers/[id]` | | |
| 2.6 | Check success message | Shows confirmation | | |
| 2.7 | Navigate to `/dashboard/my-providers` | Engagement list shows new request | | |

---

## Walkthrough 3: Family Views Engagements (My Providers)

**Goal**: Verify family can view and manage their provider engagements.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 3.1 | Log in as `family@test.olera.com` | Login succeeds | | |
| 3.2 | Navigate to `/dashboard/my-providers` | "My Providers" page loads | | |
| 3.3 | Check page title | Shows "My Providers" | | |
| 3.4 | Check tabs | "Your Outreach" and "Providers Reaching Out" tabs visible | | |
| 3.5 | Check request cards | Shows provider name, status, date | | |
| 3.6 | Click "View Request" on a card | `/dashboard/my-providers/[id]` detail page loads | | |
| 3.7 | Check message thread | Messages display chronologically | | |

---

## Walkthrough 4: Family Edits Care Profile

**Goal**: Verify family can edit their care profile.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 4.1 | Log in as `family@test.olera.com` | Login succeeds | | |
| 4.2 | Navigate to `/dashboard/care-profile` | Care profile editor loads | | |
| 4.3 | Edit name field | Field updates | | |
| 4.4 | Edit location | Location updates | | |
| 4.5 | Toggle care types | Care types toggle correctly | | |
| 4.6 | Save changes | Success message appears | | |
| 4.7 | Refresh page | Changes persist | | |

---

## Walkthrough 5: Provider Dashboard

**Goal**: Verify provider dashboard displays correctly with quick links and profile completion.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 5.1 | Log in as `provider@test.olera.com` | Login succeeds | | |
| 5.2 | Navigate to `/provider/dashboard` | Provider dashboard loads | | |
| 5.3 | Check profile completion widget | Shows completion percentage | | |
| 5.4 | Check quick links | Links to: Find Families, Edit Profile, My Families visible | | |
| 5.5 | Check recent activity section | Shows recent engagements/requests | | |

---

## Walkthrough 6: Provider Views Incoming Family Requests (My Families)

**Goal**: Verify provider can see families who have contacted them.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 6.1 | Log in as `provider@test.olera.com` | Login succeeds | | |
| 6.2 | Navigate to `/provider/dashboard/my-families` | "My Families" page loads | | |
| 6.3 | Check page title | Shows "My Families" (not "My Providers") | | |
| 6.4 | Check tabs | "Families Reaching Out" and "Your Outreach" tabs visible | | |
| 6.5 | Select "Families Reaching Out" tab | Incoming requests display | | |
| 6.6 | Check request card content | Family name, location, message preview, date | | |
| 6.7 | Check PENDING badge | Shows "Needs your response" | | |
| 6.8 | Check ACCEPTED badge (if any) | Shows "Conversation started" | | |

---

## Walkthrough 7: Provider Accepts/Declines Family Request

**Goal**: Verify provider can respond to family requests.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 7.1 | Log in as `provider@test.olera.com` | Login succeeds | | |
| 7.2 | Navigate to `/provider/dashboard/my-families` | My Families page loads | | |
| 7.3 | Find a PENDING request | Request card visible | | |
| 7.4 | Click "Yes, Let's Connect" | Request accepted | | |
| 7.5 | Check status badge | Changes to "Conversation started" | | |
| 7.6 | Refresh page | Status persists as ACCEPTED | | |
| 7.7 | Find another PENDING request (if available) | Request card visible | | |
| 7.8 | Click "No Thanks" | Request declined | | |
| 7.9 | Check request | Removed from list or shows DECLINED | | |

---

## Walkthrough 8: Provider Views Engagement Detail

**Goal**: Verify provider can view detailed engagement and message thread.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 8.1 | Log in as `provider@test.olera.com` | Login succeeds | | |
| 8.2 | Navigate to `/provider/dashboard/my-families` | Page loads | | |
| 8.3 | Click "View Request" on any engagement | `/provider/dashboard/my-families/[id]` loads | | |
| 8.4 | Check URL | Contains `/provider/dashboard/my-families/` | | |
| 8.5 | Check message thread | Messages display chronologically | | |
| 8.6 | Send a reply message (if ACCEPTED) | Message appears in thread | | |

---

## Walkthrough 9: Provider Edits Profile

**Goal**: Verify provider can edit their profile.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 9.1 | Log in as `provider@test.olera.com` | Login succeeds | | |
| 9.2 | Navigate to `/dashboard/provider-profile` | Profile editor loads | | |
| 9.3 | Edit organization name | Field updates | | |
| 9.4 | Edit description | Description updates | | |
| 9.5 | Toggle services offered | Services toggle correctly | | |
| 9.6 | Save changes | Success message appears | | |
| 9.7 | Refresh page | Changes persist | | |
| 9.8 | Check completion percentage | Updated if applicable | | |

---

## Walkthrough 10: Provider Browses Families (Find Families)

**Goal**: Verify provider can browse family profiles seeking care.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 10.1 | Log in as `provider@test.olera.com` | Login succeeds | | |
| 10.2 | Navigate to `/provider/find-families` | Family directory loads | | |
| 10.3 | Browse family cards | Cards display with name, location, care needs | | |
| 10.4 | Click on a family card | Family detail or modal opens | | |
| 10.5 | Send outreach message | Outreach request created | | |
| 10.6 | Navigate to `/provider/dashboard/my-families` | Check "Your Outreach" tab | | |
| 10.7 | Verify outreach appears | Sent request visible | | |

---

## Walkthrough 11: Individual Caregiver Browses Organizations

**Goal**: Verify caregiver can browse organizations looking to hire.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 11.1 | Log in as `caregiver@test.olera.com` | Login succeeds | | |
| 11.2 | Navigate to `/caregiver/browse-organizations` | Organization directory loads | | |
| 11.3 | Browse organization cards | Cards display with org name, location, job info | | |
| 11.4 | Click on an organization | `/caregiver/browse-organizations/[id]` detail loads | | |
| 11.5 | Apply to organization | Application submitted | | |
| 11.6 | Check application appears in list | Engagement tracked | | |

---

## Walkthrough 12: Organization Views Caregiver Candidates (My Candidates)

**Goal**: Verify organizations can see caregivers who have applied.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 12.1 | Log in as `provider@test.olera.com` | Login succeeds | | |
| 12.2 | Navigate to `/provider/my-candidates` | "My Candidates" page loads | | |
| 12.3 | Check for incoming applications | Caregiver applications visible | | |
| 12.4 | Check candidate card content | Name, skills, location | | |
| 12.5 | Click to view detail | `/provider/my-candidates/[id]` loads | | |
| 12.6 | Accept/decline candidate | Status updates | | |

---

## Walkthrough 13: Organization Browses Caregivers (Hire Staff)

**Goal**: Verify organizations can proactively browse caregivers.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 13.1 | Log in as `provider@test.olera.com` | Login succeeds | | |
| 13.2 | Navigate to `/provider/hire-staff` | Caregiver directory loads | | |
| 13.3 | Browse caregiver cards | Cards display with name, skills, experience | | |
| 13.4 | Click on a caregiver | `/provider/hire-staff/[id]` detail loads | | |
| 13.5 | Send hiring inquiry | Request created | | |
| 13.6 | Check request appears | Navigate to My Candidates, verify outreach | | |

---

## Walkthrough 14: Contact Information Gating

**Goal**: Verify contact info is properly gated based on engagement status.

### 14A: Individual Caregiver Contact Gating
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 14A.1 | View caregiver with PENDING engagement | Contact info hidden/masked | | |
| 14A.2 | Accept the engagement | Status changes to ACCEPTED | | |
| 14A.3 | View same caregiver | Contact info now visible | | |

### 14B: Organization Contact (Always Visible)
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 14B.1 | Log in as family | Login succeeds | | |
| 14B.2 | View organization provider detail | Contact info visible (orgs always public) | | |

---

## Walkthrough 15: Mode Switching

**Goal**: Verify users can switch between family and provider modes.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 15.1 | Log in as `dual@test.olera.com` | Login succeeds | | |
| 15.2 | Check current mode in nav | Mode indicator visible | | |
| 15.3 | Switch to Family mode | Mode switches | | |
| 15.4 | Check landing | Homepage (`/`) loads | | |
| 15.5 | Switch to Provider mode | Mode switches | | |
| 15.6 | Check landing | `/provider/find-families` loads | | |
| 15.7 | Refresh browser | Mode persists after refresh | | |

---

## Walkthrough 16: Visibility Gate

**Goal**: Verify profiles cannot be made visible without minimum required fields.

### 16A: Provider Visibility Gate
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 16A.1 | Log in as provider | Dashboard loads | | |
| 16A.2 | Navigate to `/dashboard/provider-profile` | Editor loads | | |
| 16A.3 | Find visibility toggle | Toggle present | | |
| 16A.4 | Clear required fields | Fields cleared | | |
| 16A.5 | Try to enable visibility | Blocked with message about missing fields | | |
| 16A.6 | Complete required fields | Toggle becomes enabled | | |

### 16B: Family Visibility Gate
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 16B.1 | Log in as family | Dashboard loads | | |
| 16B.2 | Navigate to `/dashboard/care-profile` | Care profile loads | | |
| 16B.3 | Clear required fields (name/location/care type) | Fields cleared | | |
| 16B.4 | Try to enable visibility | Blocked with message about missing fields | | |

---

## Walkthrough 17: Empty States

**Goal**: Verify empty states display appropriate CTAs.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 17.1 | Log in as `newuser@test.olera.com` | Login succeeds | | |
| 17.2 | Navigate to `/dashboard/my-providers` | Empty state with CTA to find providers | | |
| 17.3 | Switch to provider mode (if able) | Mode switches | | |
| 17.4 | Navigate to `/provider/dashboard/my-families` | Empty state with CTA | | |

---

## Audit Summary

### Results Overview

| Walkthrough | Pass | Fail | Blocked | Notes |
|-------------|------|------|---------|-------|
| 0A: Family Sign-Up | | | | |
| 0B: Provider Org Sign-Up | | | | |
| 0C: Caregiver Sign-Up | | | | |
| W1: Family Find Care | | | | |
| W2: Family Contacts Provider | | | | |
| W3: Family My Providers | | | | |
| W4: Family Edit Profile | | | | |
| W5: Provider Dashboard | | | | |
| W6: Provider My Families | | | | |
| W7: Accept/Decline Requests | | | | |
| W8: Engagement Detail | | | | |
| W9: Provider Edit Profile | | | | |
| W10: Provider Find Families | | | | |
| W11: Caregiver Browse Orgs | | | | |
| W12: My Candidates | | | | |
| W13: Hire Staff | | | | |
| W14: Contact Gating | | | | |
| W15: Mode Switching | | | | |
| W16: Visibility Gate | | | | |
| W17: Empty States | | | | |

### Issues Found

| ID | Walkthrough | Step | Severity | Description | Screenshot |
|----|-------------|------|----------|-------------|------------|
| | | | | | |

### Deferrals Recommended

| Item | Reason | Recommended Sprint |
|------|--------|-------------------|
| | | |

---

## Sign-Off

- [ ] All walkthroughs completed
- [ ] Critical issues documented
- [ ] Deferrals agreed
- [ ] Sprint 2 approved for closure

**Auditor**: _________________________
**Date**: _________________________
**Approval Status**: [ ] Approved [ ] Requires Fixes
