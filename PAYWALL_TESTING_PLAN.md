# Paywall Testing Plan - $25/Month Provider Membership

## Overview
- **Families**: Always FREE (unlimited access, no paywalls)
- **Providers** (both organizations and individual caregivers): $25/month required for ALL features

## Test User Accounts Needed

Create the following test accounts:

### 1. `family-free@test.com`
- **Role**: Family member (no provider profile)
- **Mode**: FAMILY mode only
- **Subscription**: N/A (families don't need subscriptions)
- **Purpose**: Test that families can send/receive consultation requests without any paywall

### 2. `family-provider@test.com`
- **Role**: Family member who also has a provider profile
- **Mode**: Can switch between FAMILY and PROVIDER modes
- **Subscription**: Start without, then add PRO ($25/month)
- **Purpose**: Test mode switching and that FAMILY mode remains free while PROVIDER mode requires subscription

### 3. `org-no-sub@test.com`
- **Role**: Care organization (provider type: HOME_CARE_AGENCY or ASSISTED_LIVING)
- **Mode**: PROVIDER mode
- **Subscription**: None (FREE tier)
- **Purpose**: Test that organization hits paywall when trying to send/receive any requests

### 4. `org-with-sub@test.com`
- **Role**: Care organization (same provider type as above)
- **Mode**: PROVIDER mode
- **Subscription**: PRO ($25/month, ACTIVE status)
- **Purpose**: Test that subscribed organization has full access to all features

### 5. `caregiver-no-sub@test.com`
- **Role**: Independent caregiver (provider type: INDEPENDENT_CAREGIVER)
- **Mode**: PROVIDER mode
- **Subscription**: None (FREE tier)
- **Purpose**: Test that caregiver hits paywall when trying to send/receive any requests

### 6. `caregiver-with-sub@test.com`
- **Role**: Independent caregiver (same provider type as above)
- **Mode**: PROVIDER mode
- **Subscription**: PRO ($25/month, ACTIVE status)
- **Purpose**: Test that subscribed caregiver has full access to all features

---

## Test Scenarios

### Category A: Family Users (Should Always Be FREE)

#### A1. Family Sends Consultation Request to Provider
- **Account**: `family-free@test.com`
- **Steps**:
  1. Login as family
  2. Browse providers at `/providers`
  3. Click on any provider
  4. Fill out and send consultation request
- **Expected**: Request sends successfully WITHOUT paywall modal appearing
- **Status**: [ ]

#### A2. Family Receives Consultation Request Response
- **Account**: `family-free@test.com`
- **Steps**:
  1. Have a provider send a request to this family
  2. Login as family
  3. Go to `/dashboard/requests`
  4. View the request
- **Expected**: Family can view and respond WITHOUT any paywall
- **Status**: [ ]

#### A3. Family Views "My Requests" Page
- **Account**: `family-free@test.com`
- **Steps**:
  1. Login as family
  2. Go to `/dashboard/requests`
- **Expected**: Page loads with all requests visible, no paywall blocking
- **Status**: [ ]

---

### Category B: Provider Organizations WITHOUT Subscription (Should Hit Paywall)

#### B1. Organization Sends Consultation Request (No Sub)
- **Account**: `org-no-sub@test.com`
- **Steps**:
  1. Login as organization
  2. Go to `/provider/requests` (Browse Care Requests)
  3. Click on any family profile
  4. Try to send consultation request
- **Expected**: Paywall modal appears showing "$25/month Provider Membership" required
- **Status**: [ ]

#### B2. Organization Views Received Consultation Requests (No Sub)
- **Account**: `org-no-sub@test.com`
- **Steps**:
  1. Login as organization
  2. Go to `/dashboard/requests` (My Requests tab)
- **Expected**: Empty state (no requests shown because subscription is required)
- **Status**: [ ]

#### B3. Organization Sends Hiring Request to Caregiver (No Sub)
- **Account**: `org-no-sub@test.com`
- **Steps**:
  1. Login as organization
  2. Go to `/provider/hire-staff` (Browse Caregivers)
  3. Click on any caregiver profile
  4. Try to send hiring request
- **Expected**: Paywall modal appears showing "$25/month Provider Membership" required
- **Status**: [ ]

#### B4. Organization Views Received Hiring Requests (No Sub)
- **Account**: `org-no-sub@test.com`
- **Steps**:
  1. Login as organization
  2. Go to `/provider/hiring-requests` (Hiring Requests tab)
  3. Check "Received" tab
- **Expected**: Empty state (no requests shown because subscription is required)
- **Status**: [ ]

---

### Category C: Provider Organizations WITH Subscription (Should Have Full Access)

#### C1. Organization Sends Consultation Request (With Sub)
- **Account**: `org-with-sub@test.com`
- **Steps**:
  1. Login as organization
  2. Go to `/provider/requests`
  3. Click on any family profile
  4. Send consultation request
- **Expected**: Request sends successfully WITHOUT paywall
- **Status**: [ ]

#### C2. Organization Views Received Consultation Requests (With Sub)
- **Account**: `org-with-sub@test.com`
- **Steps**:
  1. Have a family send consultation request to this organization
  2. Login as organization
  3. Go to `/dashboard/requests`
- **Expected**: All requests visible, can respond without paywall
- **Status**: [ ]

#### C3. Organization Sends Hiring Request to Caregiver (With Sub)
- **Account**: `org-with-sub@test.com`
- **Steps**:
  1. Login as organization
  2. Go to `/provider/hire-staff`
  3. Click on caregiver profile
  4. Send hiring request
- **Expected**: Request sends successfully WITHOUT paywall
- **Status**: [ ]

#### C4. Organization Views Received Hiring Requests (With Sub)
- **Account**: `org-with-sub@test.com`
- **Steps**:
  1. Have a caregiver send hiring request to this organization
  2. Login as organization
  3. Go to `/provider/hiring-requests`
- **Expected**: All requests visible in "Received" tab without paywall
- **Status**: [ ]

---

### Category D: Individual Caregivers WITHOUT Subscription (Should Hit Paywall)

#### D1. Caregiver Sends Consultation Request (No Sub)
- **Account**: `caregiver-no-sub@test.com`
- **Steps**:
  1. Login as caregiver
  2. Go to `/provider/requests` (Browse Care Requests)
  3. Click on any family profile
  4. Try to send consultation request
- **Expected**: Paywall modal appears showing "$25/month Provider Membership" required
- **Status**: [ ]

#### D2. Caregiver Views Received Consultation Requests (No Sub)
- **Account**: `caregiver-no-sub@test.com`
- **Steps**:
  1. Login as caregiver
  2. Go to `/dashboard/requests` (My Requests)
- **Expected**: Empty state (no requests shown because subscription is required)
- **Status**: [ ]

#### D3. Caregiver Sends Hiring Request to Organization (No Sub)
- **Account**: `caregiver-no-sub@test.com`
- **Steps**:
  1. Login as caregiver
  2. Go to `/caregiver/browse-organizations` (Browse Organizations)
  3. Click on any organization profile
  4. Try to send employment request
- **Expected**: Paywall modal appears showing "$25/month Provider Membership" required
- **Status**: [ ]

#### D4. Caregiver Views Received Hiring Requests (No Sub)
- **Account**: `caregiver-no-sub@test.com`
- **Steps**:
  1. Login as caregiver
  2. Go to `/provider/hiring-requests`
  3. Check "Received" tab
- **Expected**: Empty state (no requests shown because subscription is required)
- **Status**: [ ]

---

### Category E: Individual Caregivers WITH Subscription (Should Have Full Access)

#### E1. Caregiver Sends Consultation Request (With Sub)
- **Account**: `caregiver-with-sub@test.com`
- **Steps**:
  1. Login as caregiver
  2. Go to `/provider/requests`
  3. Click on any family profile
  4. Send consultation request
- **Expected**: Request sends successfully WITHOUT paywall
- **Status**: [ ]

#### E2. Caregiver Views Received Consultation Requests (With Sub)
- **Account**: `caregiver-with-sub@test.com`
- **Steps**:
  1. Have a family send consultation request to this caregiver
  2. Login as caregiver
  3. Go to `/dashboard/requests`
- **Expected**: All requests visible, can respond without paywall
- **Status**: [ ]

#### E3. Caregiver Sends Hiring Request to Organization (With Sub)
- **Account**: `caregiver-with-sub@test.com`
- **Steps**:
  1. Login as caregiver
  2. Go to `/caregiver/browse-organizations`
  3. Click on organization profile
  4. Send employment request
- **Expected**: Request sends successfully WITHOUT paywall
- **Status**: [ ]

#### E4. Caregiver Views Received Hiring Requests (With Sub)
- **Account**: `caregiver-with-sub@test.com`
- **Steps**:
  1. Have an organization send hiring request to this caregiver
  2. Login as caregiver
  3. Go to `/provider/hiring-requests`
- **Expected**: All requests visible in "Received" tab without paywall
- **Status**: [ ]

---

### Category F: Paywall Modal & Subscription Flow

#### F1. Paywall Modal Display
- **Account**: Any provider without subscription (e.g., `org-no-sub@test.com`)
- **Steps**:
  1. Login as provider without subscription
  2. Try to send any type of request
- **Expected**:
  - Modal title: "Subscribe to Continue"
  - Single subscription tier shown: "Provider Membership"
  - Price: "$25" with "/month" period
  - Features listed:
    - Send and receive consultation requests
    - Send and receive hiring requests
    - Connect with families seeking care
    - Connect with caregivers and organizations
    - Save unlimited requests
    - Email support
  - Button text: "Subscribe for $25/month"
- **Status**: [ ]

#### F2. Subscription Purchase & Auto-Retry
- **Account**: `org-no-sub@test.com` or `caregiver-no-sub@test.com`
- **Steps**:
  1. Login as provider without subscription
  2. Go to any request sending page
  3. Fill out request message
  4. Click "Send Request"
  5. Paywall modal appears
  6. Click "Subscribe for $25/month"
- **Expected**:
  - Toast message: "Provider membership activated!"
  - Modal closes
  - Request automatically sends (auto-retry)
  - User is redirected to appropriate requests page
- **Status**: [ ]

#### F3. Subscription Persists Across Sessions
- **Account**: Previously subscribed account (e.g., `org-with-sub@test.com`)
- **Steps**:
  1. Logout
  2. Login again
  3. Try to send/view requests
- **Expected**: No paywall appears, full access granted immediately
- **Status**: [ ]

---

### Category G: Mode Switching (Family Who Becomes Provider)

#### G1. Family Mode Remains Free After Creating Provider Profile
- **Account**: `family-provider@test.com`
- **Steps**:
  1. Create account and family profile
  2. Send consultation request as family (should work)
  3. Create provider profile
  4. Switch to PROVIDER mode
  5. Try to send consultation request as provider
- **Expected**:
  - Step 2: Works without paywall (family mode is free)
  - Step 5: Paywall appears (provider mode requires subscription)
- **Status**: [ ]

#### G2. Provider Subscription Doesn't Affect Family Mode
- **Account**: `family-provider@test.com`
- **Steps**:
  1. In PROVIDER mode, subscribe to $25/month
  2. Switch back to FAMILY mode
  3. Send consultation request as family
- **Expected**: Still works freely (families never pay regardless of provider subscription)
- **Status**: [ ]

---

## Database Setup for Testing

### Manual Subscription Creation (for "with-sub" accounts)

After creating `org-with-sub@test.com` and `caregiver-with-sub@test.com`, manually add subscriptions to the database:

```sql
-- For org-with-sub@test.com
INSERT INTO Subscription (userId, tier, status, contactViewsLimit)
VALUES (
  (SELECT id FROM User WHERE email = 'org-with-sub@test.com'),
  'PRO',
  'ACTIVE',
  NULL
);

-- For caregiver-with-sub@test.com
INSERT INTO Subscription (userId, tier, status, contactViewsLimit)
VALUES (
  (SELECT id FROM User WHERE email = 'caregiver-with-sub@test.com'),
  'PRO',
  'ACTIVE',
  NULL
);
```

Or use the subscription API endpoint after account creation:
```bash
# Login as the user first, then:
POST /api/subscription
{
  "tier": "PRO"
}
```

---

## Testing Checklist Summary

- [ ] All 6 test accounts created
- [ ] Category A: Family Users (3 scenarios)
- [ ] Category B: Organization Without Subscription (4 scenarios)
- [ ] Category C: Organization With Subscription (4 scenarios)
- [ ] Category D: Caregiver Without Subscription (4 scenarios)
- [ ] Category E: Caregiver With Subscription (4 scenarios)
- [ ] Category F: Paywall Modal & Subscription Flow (3 scenarios)
- [ ] Category G: Mode Switching (2 scenarios)

**Total Scenarios**: 20 test cases covering all paywall functionality

---

## Expected Behavior Summary

### Families (Always FREE)
✓ Send consultation requests - FREE
✓ Receive consultation requests - FREE
✓ View "My Requests" page - FREE
✓ Respond to requests - FREE

### Providers WITHOUT Subscription ($25/month required)
✗ Send consultation requests - BLOCKED (paywall)
✗ Receive consultation requests - BLOCKED (empty state)
✗ Send hiring requests - BLOCKED (paywall)
✗ Receive hiring requests - BLOCKED (empty state)

### Providers WITH Subscription ($25/month active)
✓ Send consultation requests - ALLOWED
✓ Receive consultation requests - ALLOWED
✓ Send hiring requests - ALLOWED
✓ Receive hiring requests - ALLOWED
