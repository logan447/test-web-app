# Dual-Mode System Implementation

## Overview
This document describes the dual-mode system that allows users to switch between **Family** and **Provider** experiences within a single Olera account.

## Architecture

### Database Schema
**File:** `prisma/schema.prisma`

Added two key components:

1. **UserMode enum** - Defines the two modes:
   ```prisma
   enum UserMode {
     FAMILY
     PROVIDER
   }
   ```

2. **User.activeMode field** - Tracks the current active mode:
   ```prisma
   model User {
     activeMode    UserMode  @default(FAMILY)
     // ... other fields
   }
   ```

3. **ProviderIdentity model** - Gates access to provider features:
   ```prisma
   model ProviderIdentity {
     id                String   @id @default(cuid())
     userId            String   @unique
     user              User     @relation(fields: [userId], references: [id])
     type              String   @default("ORGANIZATION")
     onboardingComplete Boolean @default(false)
   }
   ```

### Authentication (NextAuth)
**File:** `lib/auth.ts`

- **JWT Callback:** Includes `activeMode` and `hasProviderIdentity` in the JWT token
- **Session Callback:** Exposes these fields to the client-side session
- **Authorize:** Fetches user with `providerIdentity` relation on login

### Type Definitions
**File:** `types/next-auth.d.ts`

Extended NextAuth types to include:
```typescript
interface Session {
  user: {
    activeMode: UserMode;
    hasProviderIdentity: boolean;
  } & DefaultSession["user"];
}
```

## API Endpoints

### POST /api/mode
**File:** `app/api/mode/route.ts`

Switches the user's active mode between FAMILY and PROVIDER.

**Request:**
```json
{
  "mode": "FAMILY" | "PROVIDER"
}
```

**Response:**
```json
{
  "success": true,
  "mode": "FAMILY",
  "landingPage": "/"
}
```

**Validation:**
- Requires authentication
- PROVIDER mode requires `hasProviderIdentity` to be true
- Returns `needsOnboarding: true` if provider identity is missing

### POST /api/provider-identity
**File:** `app/api/provider-identity/route.ts`

Creates a provider identity for a user.

**Request:**
```json
{
  "type": "ORGANIZATION" | "INDIVIDUAL"
}
```

**Response:**
```json
{
  "success": true,
  "providerIdentity": { ... }
}
```

## UI Components

### MainNav Component
**File:** `components/Navigation/MainNav.tsx` (Lines 311-342)

The account dropdown menu includes a mode switcher button:

```typescript
const currentMode = session?.user?.activeMode || 'FAMILY';
const isProviderMode = currentMode === 'PROVIDER';
const canSwitchToProvider = session?.user?.hasProviderIdentity || session?.user?.role === 'PROVIDER';

// In dropdown menu:
{isProviderMode ? (
  <button onClick={() => handleModeSwitch('FAMILY')}>
    Switch to Family
  </button>
) : (
  <button
    onClick={() => handleModeSwitch('PROVIDER')}
    disabled={!canSwitchToProvider}
  >
    For Providers
  </button>
)}
```

### Provider Onboarding Page
**File:** `app/provider/onboarding/page.tsx`

Allows users to create a provider identity by selecting their provider type (Organization or Individual).

### Mode Test Page
**File:** `app/mode-test/page.tsx`

Standalone test page to verify dual-mode functionality:
- Displays current session data
- Shows active mode
- Allows mode switching
- Accessible at `/mode-test`

## User Flow

### For Family Users (Default)

1. User signs up → `activeMode` defaults to `FAMILY`
2. User sees family-focused navigation and dashboard
3. Account dropdown shows **"For Providers"** button
4. Clicking button redirects to `/provider/onboarding` (if no identity exists)

### Creating Provider Identity

1. User visits `/provider/onboarding`
2. Selects provider type (Organization or Individual)
3. System creates `ProviderIdentity` record
4. User's session updated with `hasProviderIdentity: true`
5. User redirected to provider dashboard

### For Users with Provider Identity

1. Account dropdown shows **"For Providers"** button (enabled)
2. Clicking button:
   - Calls `/api/mode` endpoint
   - Updates `User.activeMode` to `PROVIDER`
   - Refreshes session with new mode
   - Redirects to `/provider/requests`
3. Navigation and features adapt to provider context

### Switching Back to Family Mode

1. While in PROVIDER mode, dropdown shows **"Switch to Family"** button
2. Clicking button:
   - Calls `/api/mode` endpoint
   - Updates `User.activeMode` to `FAMILY`
   - Refreshes session
   - Redirects to family homepage

## Database Migration

Migration file: `prisma/migrations/[timestamp]_dual_mode_system/migration.sql`

- Adds `UserMode` enum
- Adds `activeMode` column to `User` table (defaults to `FAMILY`)
- Creates `ProviderIdentity` table with foreign key to `User`

## Testing

### Manual Testing Steps

1. **Sign up as new user:**
   - Verify `activeMode` is `FAMILY` in database
   - Verify `hasProviderIdentity` is `false` in session

2. **Check account dropdown:**
   - Should show "For Providers" button
   - Button should be disabled (no hover effect)

3. **Create provider identity:**
   - Click "For Providers" → redirects to `/provider/onboarding`
   - Select provider type and submit
   - Verify `ProviderIdentity` record created in database
   - Verify redirected to provider dashboard

4. **Switch to provider mode:**
   - Click "For Providers" in dropdown
   - Verify `activeMode` updated to `PROVIDER` in database
   - Verify session shows `activeMode: "PROVIDER"`
   - Verify redirected to `/provider/requests`

5. **Switch back to family mode:**
   - Dropdown now shows "Switch to Family"
   - Click button
   - Verify `activeMode` updated to `FAMILY` in database
   - Verify redirected to family homepage

### Test Accounts

```sql
-- Check user modes
SELECT email, name, role, "activeMode" FROM "User";

-- Check provider identities
SELECT u.email, pi.type, pi."onboardingComplete"
FROM "ProviderIdentity" pi
JOIN "User" u ON u.id = pi."userId";
```

## Key Files Modified

1. `prisma/schema.prisma` - Database schema with dual-mode support
2. `lib/auth.ts` - NextAuth configuration with mode fields
3. `types/next-auth.d.ts` - TypeScript type extensions
4. `app/api/mode/route.ts` - Mode switching endpoint
5. `app/api/provider-identity/route.ts` - Provider identity creation
6. `app/api/auth/signup/route.ts` - Explicitly sets `activeMode: 'FAMILY'`
7. `components/Navigation/MainNav.tsx` - Mode switcher UI
8. `app/provider/onboarding/page.tsx` - Provider onboarding flow
9. `app/mode-test/page.tsx` - Test page for verification

## Future Enhancements

1. **Role-based landing pages:**
   - Different dashboards for FAMILY vs PROVIDER mode
   - Mode-specific navigation items

2. **Provider profile completion:**
   - Multi-step onboarding for providers
   - Service offerings, pricing, availability

3. **Access control:**
   - Middleware to restrict certain routes based on `activeMode`
   - Provider-only features and pages

4. **UI indicators:**
   - Visual badge showing current mode
   - Mode-specific color schemes or branding

## Troubleshooting

### Issue: Mode switcher button not appearing

**Possible causes:**
1. Browser JavaScript cache - Hard refresh (Ctrl+Shift+R)
2. Session doesn't include new fields - Log out and log back in
3. Old session cookie - Clear cookies and re-authenticate

### Issue: "Provider identity required" error

**Solution:**
- User must complete `/provider/onboarding` before switching to PROVIDER mode
- Check database for `ProviderIdentity` record

### Issue: Mode doesn't persist after refresh

**Solution:**
- Verify `activeMode` is stored in database
- Check session callback returns `activeMode` field
- Ensure JWT includes `activeMode` in token

## Security Considerations

1. **Authentication required:** All mode switching endpoints require valid session
2. **Provider identity validation:** Cannot switch to PROVIDER mode without identity
3. **Database-backed:** Mode stored in database, not just client session
4. **Cascade deletes:** ProviderIdentity deleted if User is deleted

## Performance

- **No additional queries:** Mode included in initial session fetch
- **Client-side caching:** Session data cached by NextAuth
- **Optimistic updates:** UI updates immediately while API call completes
