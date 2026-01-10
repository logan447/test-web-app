# Fix login redirects and mode bleeding issues

## Summary

This PR fixes critical issues with login redirects, mode switching, and provider profile completion calculation. These fixes ensure that users are properly directed to the correct landing pages based on their provider profile completion percentage and that mode parameters are preserved throughout navigation.

## Issues Fixed

### 1. **Incorrect Provider Profile Completion Calculation**
**Problem:** The login page was checking non-existent database fields, causing all provider accounts to calculate as <15% complete, resulting in incorrect default mode and landing page.

**Root Cause:** The completion calculation was checking:
- `provider.services` ❌ (actual field: `careTypesOffered`)
- `provider.pricing` ❌ (actual fields: `priceMin`, `priceMax`, etc.)
- `provider.staff` ❌ (actual fields: `staffCredentials`, `staffToResidentRatio`, etc.)

**Fix:** Updated calculation in `app/login/page.tsx` to use correct schema fields:
- Services: Check `careTypesOffered` array
- Pricing: Check `priceMin`, `priceMax`, `privateRoomMin`, `semiPrivateRoomMin`
- Staff: Check `staffCredentials`, `staffToResidentRatio`, `daytimeStaffRatio`

### 2. **Login Redirect Issues**
**Problem:** Users with >15% provider profile completion were redirected to wrong pages and defaulted to wrong mode.

**Root Cause:** Two issues:
1. Incorrect completion calculation (see above)
2. `returnUrl` parameter from middleware was overriding smart redirect logic

**Fix:**
- Fixed completion calculation
- Removed `returnUrl` override in login logic to always use smart redirect:
  - <15% complete → `/?mode=family` (Find Providers page)
  - ≥15% complete → `/provider/requests?mode=provider` (Find Families page)

### 3. **Mode Bleeding in Navigation**
**Problem:** Dashboard links were missing mode parameters, causing users to switch modes unintentionally when clicking navigation links.

**Root Cause:** Internal links in dashboard pages didn't preserve the mode parameter from the URL.

**Fix:** Added `withMode()` helper function to both dashboard pages:
- `app/dashboard/page.tsx` (family dashboard)
- `app/provider/dashboard/page.tsx` (provider dashboard)

Applied to ALL internal links including:
- Stats card links
- Quick action buttons
- Activity feed links

### 4. **Infinite Loading Loops**
**Problem:** Users experiencing endless loading when trying to access dashboards.

**Root Cause:** Missing `mode` parameter in useEffect dependency arrays - when mode changed, useEffect didn't re-run, causing redirect loops.

**Fix:** Added `mode` to useEffect dependencies in:
- `app/dashboard/page.tsx`
- `app/provider/dashboard/page.tsx`
- `app/provider/requests/page.tsx`

### 5. **Build Errors**
**Problem:** Multiple build failures related to `useSearchParams()` usage.

**Root Cause:** Next.js requires Suspense boundaries around `useSearchParams()` for static rendering, and can't use browser APIs like `window.location.search` during SSR.

**Fix:**
- Wrapped all pages using `useSearchParams()` in Suspense boundaries
- Replaced `window.location.search` with `useSearchParams()` hook in 6 pages

## Changes Made

### Files Modified
- `app/login/page.tsx` - Fixed completion calculation and redirect logic, added debug logging
- `app/dashboard/page.tsx` - Added `withMode()` helper, fixed useEffect dependencies, added Suspense
- `app/provider/dashboard/page.tsx` - Added `withMode()` helper, fixed useEffect dependencies, added Suspense
- `app/provider/requests/page.tsx` - Fixed useEffect dependencies
- `middleware.ts` - Already present from previous work
- Multiple pages wrapped in Suspense boundaries

### Provider Profile Completion Calculation (6 sections)
1. **Basic Info** - name, description, address (required for creation)
2. **Services** - careTypesOffered array
3. **Photos** - photos array
4. **Licensing** - licenseNumber
5. **Pricing** - any of: priceMin, priceMax, privateRoomMin, semiPrivateRoomMin
6. **Staff** - any of: staffCredentials array, staffToResidentRatio, daytimeStaffRatio

**Threshold:** 15% (1 of 6 sections = 17%, so 0 sections = 0%, 1+ sections = 17%+)

## Testing Instructions

1. **Test Provider Account Login (>15% complete)**
   - Use account: `caregiver.experienced.fulltime@demo.com`
   - Expected: Redirect to `/provider/requests?mode=provider` (Find Families page)
   - Expected: Should be in provider mode
   - Open browser console - should see `[LOGIN DEBUG]` logs showing completion calculation

2. **Test Family Account Login (<15% complete)**
   - Use a family account or provider account with minimal profile
   - Expected: Redirect to `/?mode=family` (Find Providers page)
   - Expected: Should be in family mode

3. **Test Mode Preservation**
   - Navigate through dashboard using various links
   - Expected: Mode parameter should be preserved in URL throughout navigation
   - Expected: No unexpected mode switches

4. **Test Mode Switching**
   - Switch between family and provider mode using mode switcher
   - Expected: Smooth, fast transitions
   - Expected: Redirects to appropriate landing page for each mode

## Debug Logging

Added comprehensive debug logging with `[LOGIN DEBUG]` prefix to help troubleshoot login issues:
- Provider profile fetch status
- Completion calculation breakdown (shows which sections are complete)
- Final redirect decision

## Deployment Notes

This branch contains all fixes and is ready to merge to `main` for production deployment. The fixes have been tested locally and address all reported issues:
- ✅ Correct login redirects based on profile completion
- ✅ Proper default mode for provider accounts
- ✅ No mode bleeding in navigation
- ✅ No infinite loading loops
- ✅ Clean build with no errors
