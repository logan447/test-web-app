# Sprint 2 Human Audit Walkthrough

> **Sprint Goal**: A provider can view incoming requests, respond to families, and manage their profile.
> **Prerequisite**: Development server running (`npm run dev`) with seeded database
> **Estimated Time**: 45-60 minutes

---

## Pre-Audit Setup

### 1. Start Development Server
```bash
npm run dev
# Server starts at http://localhost:3001
```

### 2. Seed Database (if not already seeded)
```bash
npm run seed
# Or via browser: http://localhost:3001/api/admin/seed
```

### 3. Test Account Credentials
All accounts use password: `demo123`

| Purpose | Email |
|---------|-------|
| Family (complete) | `family.assisted.active@demo.com` |
| Provider Org | Use any `org.*@demo.com` account |
| Caregiver | `caregiver.maria@demo.com` |
| Fresh signup | Create during test |

---

## Walkthrough 1: Shared Onboarding Wizard

**Goal**: Verify the onboarding wizard triggers correctly and supports all variants.

### W1.1: "Get Started" Button Flow
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Go to http://localhost:3001 | Homepage loads | | |
| 2 | Click "Get Started" in nav | Onboarding wizard overlay opens | | |
| 3 | Observe first question | "Are you looking for care?" vs "Are you a care provider?" | | |
| 4 | Select "Care provider" | Shows subtype question: "Individual caregiver?" vs "Care organization?" | | |
| 5 | Click X to close | Wizard dismisses | | |

### W1.2: Provider Signup via `/for-providers`
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Go to http://localhost:3001/for-providers | Provider landing page loads | | |
| 2 | Click main CTA (signup button) | Auth modal opens | | |
| 3 | Sign up with new email | Account created | | |
| 4 | After signup completes | Provider onboarding wizard triggers | | |
| 5 | User mode | Should be PROVIDER | | |

### W1.3: `/provider/onboarding` Redirect
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Log in as any provider | Dashboard accessible | | |
| 2 | Navigate to `/provider/onboarding` directly | Redirects to `/provider/find-families` | | |
| 3 | Check for overlay | Onboarding wizard overlay should trigger | | |

---

## Walkthrough 2: Family Onboarding

**Goal**: Verify family onboarding captures Profile Card Minimum fields.

### W2.1: New Family Signup
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Log out if logged in | Logged out state | | |
| 2 | Click "Get Started" | Wizard opens | | |
| 3 | Select "Looking for care" | Family wizard starts | | |
| 4 | Complete wizard steps | Captures: name, location, care type | | |
| 5 | Check profile created | Go to `/dashboard/care-profile`, data present | | |

### W2.2: Skip Early
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Start fresh signup | Wizard opens | | |
| 2 | Click X before completing | Wizard closes | | |
| 3 | Check you can navigate | Not blocked from using site | | |

---

## Walkthrough 3: Provider Dashboard

**Goal**: Verify provider dashboard shows profile completion and quick links.

### W3.1: Dashboard Content
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Log in as `org.sunshine@demo.com` | Login succeeds | | |
| 2 | Navigate to `/provider/dashboard` | Dashboard loads | | |
| 3 | Check profile completion widget | Shows completion percentage | | |
| 4 | Check quick links | Links to: Find Families, Edit Profile, My Families | | |
| 5 | Check recent activity | Shows recent engagements/requests | | |

### W3.2: Dashboard Without Profile
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Create new provider account | Account created | | |
| 2 | Navigate to `/provider/dashboard` | Dashboard loads | | |
| 3 | Check for onboarding prompt | Shows "Complete your profile" or similar CTA | | |

---

## Walkthrough 4: Provider Profile Editing

**Goal**: Verify providers can edit their profile with UX matching family pattern.

### W4.1: Access Profile Editor
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | From provider dashboard, click "Edit Profile" | Profile editor loads | | |
| 2 | Or navigate to `/dashboard/provider-profile` | Same editor loads | | |

### W4.2: Edit Profile Sections
| Step | Section | Test | Pass/Fail | Notes |
|------|---------|------|-----------|-------|
| 1 | Basic Info | Edit name, save | | |
| 2 | Description | Edit description, save | | |
| 3 | Services | Toggle care types, save | | |
| 4 | Amenities | Check/uncheck amenities, save | | |
| 5 | Photos | Upload a photo (if configured) | | |
| 6 | Pricing | Edit pricing info, save | | |

### W4.3: Verify Persistence
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Make an edit and save | Success message | | |
| 2 | Refresh page | Changes persist | | |
| 3 | Check completion % | Updated if applicable | | |

---

## Walkthrough 5: My Families (Provider Engagement View)

**Goal**: Verify providers can see and manage engagements with families.

### W5.1: Navigate to My Families
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Log in as provider (e.g., `org.sunshine@demo.com`) | Login succeeds | | |
| 2 | Click "My Families" in nav dropdown | `/dashboard/my-providers` loads | | |
| 3 | Check page title | Shows "My Families" (not "My Providers") | | |
| 4 | Check tabs | "Families Reaching Out" and "Your Outreach" | | |

### W5.2: View Incoming Requests
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Select "Families Reaching Out" tab | Received requests display | | |
| 2 | Check request card content | Family name, location, message preview, date | | |
| 3 | Check PENDING badge | Shows "Needs your response" | | |
| 4 | Check ACCEPTED badge | Shows "Conversation started" | | |

### W5.3: Empty State (if applicable)
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Use provider with no requests | Empty state displays | | |
| 2 | Check CTA | "Complete Your Profile" or "Browse Family Requests" | | |

---

## Walkthrough 6: Accept/Decline Requests

**Goal**: Verify providers can respond to family requests.

### W6.1: Accept a Request
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Find a PENDING request in "Families Reaching Out" | Request card visible | | |
| 2 | Click "Yes, Let's Connect" | Request accepted | | |
| 3 | Check status badge | Changes to "Conversation started" | | |
| 4 | Refresh page | Status persists as ACCEPTED | | |

### W6.2: Decline a Request
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Find another PENDING request | Request card visible | | |
| 2 | Click "No Thanks" | Request declined | | |
| 3 | Check request | Removed from list or shows DECLINED | | |

### W6.3: View Engagement Detail
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Click "View Request" on any request | Detail page loads | | |
| 2 | Check URL | `/dashboard/my-providers/[id]` | | |
| 3 | Check message thread | Messages display chronologically | | |
| 4 | Send a reply message | Message appears in thread | | |

---

## Walkthrough 7: Provider Claiming

**Goal**: Verify unclaimed providers can be claimed.

### W7.1: Find Unclaimed Provider
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Go to homepage (provider directory) | Directory loads | | |
| 2 | Search for "Bay Area Senior Living" | Provider card appears | | |
| 3 | Check badge | "Unclaimed" badge visible on card | | |
| 4 | Click on provider | Detail page loads | | |
| 5 | Check CTA | "Claim this listing" button visible | | |

### W7.2: Claim Flow (Not Logged In)
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Log out | Logged out state | | |
| 2 | Go to unclaimed provider detail page | Page loads | | |
| 3 | Click "Claim this listing" | Auth modal appears | | |

### W7.3: Claim Flow (Logged In)
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Log in as family user (new account, no provider) | Login succeeds | | |
| 2 | Go to unclaimed provider detail | Page loads | | |
| 3 | Click "Claim this listing" | Claim modal appears | | |
| 4 | Confirm claim | Success message | | |
| 5 | Check badge | Changes to "Claimed" or badge removed | | |
| 6 | Check user mode | Switched to PROVIDER | | |
| 7 | Go to provider dashboard | Shows claimed provider profile | | |

### W7.4: Claim Validation
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Try to claim already-claimed provider | Error: "already claimed" | | |
| 2 | With user who owns a provider, try claim another | Error: "already own a provider" | | |

---

## Walkthrough 8: Visibility Gate

**Goal**: Verify profiles cannot be made visible without minimum fields.

### W8.1: Provider Visibility Gate
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Log in as provider | Dashboard loads | | |
| 2 | Go to profile editor | Editor loads | | |
| 3 | Find visibility toggle | Toggle present | | |
| 4 | If Tier 1 fields incomplete | Toggle disabled or shows missing fields | | |
| 5 | Complete required fields | Toggle becomes enabled | | |

### W8.2: Family Visibility Gate
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Log in as family | Dashboard loads | | |
| 2 | Go to `/dashboard/care-profile` | Care profile loads | | |
| 3 | Clear required fields (name/location/care type) | Fields cleared | | |
| 4 | Try to enable visibility | Blocked with message about missing fields | | |

---

## Walkthrough 9: Contact Submission Redirect

**Goal**: Verify contact submission redirects to engagement detail.

### W9.1: Family Contacts Provider
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Log in as family | Login succeeds | | |
| 2 | Go to any provider detail page | Page loads | | |
| 3 | Click "Schedule Tour" or "Contact" | Contact modal opens | | |
| 4 | Fill out form and submit | Form submits | | |
| 5 | Check redirect | Redirected to `/dashboard/my-providers/[id]` | | |
| 6 | Check success message | Shows success/confirmation | | |

---

## Walkthrough 10: End-to-End Provider Journey

**Goal**: Complete provider journey from signup to engagement response.

| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | Go to `/for-providers` | Landing page loads | | |
| 2 | Sign up as new provider | Account created, wizard triggers | | |
| 3 | Complete provider onboarding | Provider profile created | | |
| 4 | Navigate to "My Families" | Empty state with CTA | | |
| 5 | Navigate to "Find Families" | Family profiles visible | | |
| 6 | Send outreach to a family | Request created | | |
| 7 | Check "Your Outreach" tab | Sent request appears | | |
| 8 | (If pre-seeded request exists) Accept incoming request | Status changes to ACCEPTED | | |
| 9 | Send reply message | Message appears in thread | | |
| 10 | Edit provider profile | Changes save correctly | | |
| 11 | Log out and log back in | Mode persists, data intact | | |

---

## Walkthrough 11: Cross-Cutting Verification

### W11.1: Navigation
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | In provider mode, check nav dropdown | Find Families, Saved Families, My Families, Provider Dashboard | | |
| 2 | Click "My Families" | Goes to `/dashboard/my-providers` | | |
| 3 | Check breadcrumbs on provider pages | Correct hierarchy | | |

### W11.2: Mode Switching
| Step | Action | Expected | Pass/Fail | Notes |
|------|--------|----------|-----------|-------|
| 1 | From provider mode, click "For Families" | Mode switches | | |
| 2 | Check landing page | Homepage (`/`) | | |
| 3 | Switch back to provider | Mode switches | | |
| 4 | Check landing page | `/provider/find-families` | | |
| 5 | Refresh browser | Mode persists | | |

---

## Audit Summary

### Results Overview

| Walkthrough | Pass | Fail | Blocked | Notes |
|-------------|------|------|---------|-------|
| W1: Onboarding Wizard | | | | |
| W2: Family Onboarding | | | | |
| W3: Provider Dashboard | | | | |
| W4: Profile Editing | | | | |
| W5: My Families Page | | | | |
| W6: Accept/Decline | | | | |
| W7: Provider Claiming | | | | |
| W8: Visibility Gate | | | | |
| W9: Contact Redirect | | | | |
| W10: E2E Journey | | | | |
| W11: Cross-Cutting | | | | |

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
