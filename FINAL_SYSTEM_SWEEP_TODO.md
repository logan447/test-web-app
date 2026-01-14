# Final System Sweep - Build TODO

## 1. Auth & Entry
✅ Sign up/sign in modal (MinimalOnboardingModal exists)
✅ Default states (cookie + DB persistence)
✅ Exit behavior (mode persists)
✅ Route guards (middleware exists)

## 2. Role & Mode System
✅ Mode persistence (cookie + DB)
✅ Mode display in UI (useUserMode hook)

## 3. Onboarding Modal Flow
✅ Role selection exists
✅ Required field validation exists
✅ Early exit handling exists
✅ Save & exit works

## 4. Family Experience
✅ Family dashboard (/dashboard)
✅ Find providers page (/ with browse mode)
✅ Provider profile view (/providers/[id])
✅ Engagement CTAs (contact buttons exist)

## 5. Provider Experience - Organization
✅ Provider dashboard (/dashboard - shows provider mode)
✅ Claim flow entry points (unclaimed badge added)
✅ Profile edit page (/dashboard/provider-profile)
⬜ **TODO: Verify "Find Families" page exists and is linked**

## 6. Provider Experience - Individual Caregiver
✅ Browse organizations page exists (/caregiver/browse-organizations)
⬜ **TODO: Verify caregiver profile edit page exists**
⬜ **TODO: Verify caregiver dashboard navigation**

## 7. Profiles
✅ Family profile page (/dashboard/care-profile)
✅ Provider profile page (/dashboard/provider-profile)
✅ Profile completeness indicators exist
✅ Required vs optional sections marked

## 8. Unclaimed Provider Pages
✅ Public provider page (/providers/[id])
✅ Unclaimed state banner (just added)
✅ Claim CTA (just added)
✅ Claim flow wired (just fixed)

## 9. Claiming & Verification
✅ Claim submission API
✅ Pending state UI (just added)
✅ Restricted permissions (API + UI)
✅ Approved/rejected transitions
✅ Email notifications

## 10. Admin Systems
✅ Admin setup page (/setup/admin)
✅ Claim review board (/admin/claims)
✅ Approve/reject actions
✅ Audit trail (reviewedBy, reviewedAt, notes)
✅ Empty state ("No Pending Claims")

## 11. Matching & Discovery
✅ Match generation API (/api/matching/*)
⬜ **TODO: Verify dashboard shows empty state when no matches**
⬜ **TODO: Verify dashboard shows matches when they exist**

## 12. Notifications & Messaging
✅ Claim submitted emails (Loops)
✅ Claim approved emails (Loops)
✅ Claim rejected emails (Loops)
⚪ Engagement triggers (deferred to Phase 2)

## 13. Navigation & Linking
✅ Main nav exists (MainNav component)
✅ Dashboard links (Edit Profile)
⬜ **TODO: Verify all Quick Actions link correctly**
⬜ **TODO: Verify provider mode shows provider-specific actions**
⬜ **TODO: Verify family mode shows family-specific actions**

---

## Critical Build Items (Must Do Before Testing)

### A. Dashboard Empty States
⬜ Add empty state for matches section (when no matches found)
⬜ Add empty state for activities section (when no activities)

### B. Provider Navigation
⬜ Verify "Browse Families" or similar exists for providers
⬜ If missing, add link or page

### C. Quick Actions Verification
⬜ Test all Quick Action buttons lead to correct pages
⬜ Ensure buttons change based on family/provider mode

---

## Quick Checks (No Build Needed)

### Family Mode Quick Actions Expected:
- Browse Providers
- View Saved Providers
- Edit Care Profile
- View Requests

### Provider Mode Quick Actions Expected:
- Edit Provider Profile
- View Requests
- Browse Families (or equivalent)
- View Profile Analytics (optional)

---

## Decision: Build Priority

**HIGH:**
- Dashboard empty states (5 min)

**MEDIUM:**
- Provider "Browse Families" link verification (5 min check)

**LOW:**
- Caregiver-specific pages (out of scope for Sprint 0)

---

**Total Build Time Estimate:** 10-15 minutes
**Then:** System is test-ready
