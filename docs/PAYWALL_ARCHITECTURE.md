# Paywall Architecture Design

## Overview
Providers must subscribe/pay to view family contact information (name, email, phone) on care request profiles.

## Goals
1. Monetize provider access to family contact information
2. Simple, clear paywall UX
3. Flexible subscription tiers
4. Easy integration with payment processors
5. Demo-ready with mock payment flow

## System Components

### 1. Database Schema

#### Subscription Model
```prisma
model Subscription {
  id              String           @id @default(cuid())
  userId          String           @unique
  user            User             @relation(fields: [userId], references: [id])

  // Subscription details
  tier            SubscriptionTier @default(FREE)
  status          SubscriptionStatus @default(ACTIVE)

  // Payment info (for future Stripe integration)
  stripeCustomerId     String?
  stripeSubscriptionId String?

  // Access tracking
  contactViewsUsed     Int      @default(0)
  contactViewsLimit    Int?     // NULL = unlimited

  // Dates
  currentPeriodStart   DateTime @default(now())
  currentPeriodEnd     DateTime
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

enum SubscriptionTier {
  FREE      // Limited contact views
  BASIC     // More contact views per month
  PRO       // Unlimited contact views
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  PAST_DUE
}
```

#### Contact View Tracking
```prisma
model ContactView {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  familyProfileId String
  familyProfile   FamilyProfile @relation(fields: [familyProfileId], references: [id])
  createdAt       DateTime      @default(now())

  @@unique([userId, familyProfileId])
  @@index([userId])
}
```

### 2. Access Control Logic

#### Check if user can view contact info:
```typescript
async function canViewContact(userId: string, familyProfileId: string): Promise<boolean> {
  // Get user's subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId }
  });

  // No subscription = free tier
  if (!subscription) {
    return false; // or check against FREE tier limits
  }

  // Check subscription status
  if (subscription.status !== 'ACTIVE') {
    return false;
  }

  // PRO tier = unlimited
  if (subscription.tier === 'PRO') {
    return true;
  }

  // Check if already viewed (no double counting)
  const existingView = await prisma.contactView.findUnique({
    where: {
      userId_familyProfileId: {
        userId,
        familyProfileId
      }
    }
  });

  if (existingView) {
    return true; // Already unlocked
  }

  // Check against limit
  if (subscription.contactViewsLimit === null) {
    return true; // Unlimited
  }

  return subscription.contactViewsUsed < subscription.contactViewsLimit;
}
```

#### Record contact view:
```typescript
async function recordContactView(userId: string, familyProfileId: string): Promise<void> {
  // Create contact view record
  await prisma.contactView.create({
    data: {
      userId,
      familyProfileId
    }
  });

  // Increment usage counter
  await prisma.subscription.update({
    where: { userId },
    data: {
      contactViewsUsed: {
        increment: 1
      }
    }
  });
}
```

### 3. Subscription Tiers

| Tier | Price | Contact Views | Features |
|------|-------|---------------|----------|
| FREE | $0 | 0 | Browse, save profiles, see descriptions |
| BASIC | $29/mo | 10/month | View contact info for up to 10 families |
| PRO | $99/mo | Unlimited | Unlimited contact views, priority support |

### 4. UI/UX Flow

#### Masked Contact Information
- **Name:** Show first name only: "John D." → "John"
- **Email:** Mask domain: "john@email.com" → "j***@e***.com"
- **Phone:** Mask middle digits: "(555) 123-4567" → "(***) ***-4567"

#### Unlock Flow
1. Provider clicks "View Full Details" or contact info area
2. Check `canViewContact()`
3. If **allowed**:
   - Show paywall modal with pricing tiers
   - "Upgrade to view contact information"
   - Display subscription options
4. If **allowed**:
   - Record view with `recordContactView()`
   - Unmask and display contact info
   - Show success toast: "Contact information unlocked"

#### Paywall Modal
```tsx
<PaywallModal>
  <Title>Unlock Contact Information</Title>
  <Description>
    Subscribe to view family contact details and connect with care requests.
  </Description>

  <SubscriptionTiers>
    <TierCard tier="BASIC" highlighted />
    <TierCard tier="PRO" />
  </SubscriptionTiers>

  <Actions>
    <Button onClick={handleUpgrade}>Choose Plan</Button>
    <Button variant="ghost" onClick={handleClose}>Maybe Later</Button>
  </Actions>
</PaywallModal>
```

### 5. API Endpoints

#### GET /api/subscription
- Returns current user's subscription details
- Used to check tier, usage, and limits

#### POST /api/subscription
- Create or update subscription
- For now: Mock upgrade (demo mode)
- Future: Stripe integration

#### POST /api/contact-view
- Unlock family profile contact info
- Checks limits, records view
- Returns full contact details or error

#### GET /api/contact-view/check/:familyProfileId
- Check if user can view specific profile
- Returns: { canView: boolean, reason?: string }

### 6. Demo Mode Implementation

For demo purposes (no payment processor yet):
- Allow instant "upgrade" to PRO tier
- Show modal with tier options
- "Upgrade" button immediately activates subscription
- Display success message: "Demo mode: Upgraded to PRO"
- All contact info becomes accessible

### 7. Future Enhancements

1. **Stripe Integration**
   - Payment processing
   - Subscription management
   - Webhooks for status changes

2. **Trial Period**
   - 7-day free trial of PRO tier
   - Automatic downgrade after trial

3. **Usage Dashboard**
   - Show contact views remaining
   - View history
   - Upgrade prompts

4. **Credits System**
   - Alternative to subscriptions
   - Buy credit packs
   - $5 = 1 contact unlock

## Implementation Phases

### Phase 1: Database & Schema (Current)
- Add Subscription and ContactView models
- Run migrations
- Update Prisma client

### Phase 2: Access Control Logic
- Implement `canViewContact()` and `recordContactView()`
- Create API endpoints
- Add contact masking utilities

### Phase 3: UI Components
- Build PaywallModal component
- Add masked contact display
- Integrate with Browse Care Requests page

### Phase 4: Demo Mode
- Mock subscription upgrades
- Test full flow end-to-end

### Phase 5: Polish & Testing
- Error handling
- Loading states
- Edge cases (expired subscriptions, etc.)
