# SPRINT 1A: DECISION TOOLS - DETAILED PLAN

**Status:** 📋 Draft - Needs Clarification & Approval
**Scope:** Provider comparison + filtering/sorting on Saved Providers page
**Expected Impact:** 30% reduction in decision time, 67% increase in saved → contacted conversion
**Dependencies:** Sprint 0 (onboarding flows) complete ✅
**Timeline:** 3-4 days after approval

---

## EXECUTIVE SUMMARY

### Current Problem
After completing Sprint 0, we now have **families activating and saving providers** (40% activation rate projected). But once they save 5-10 providers, they hit a **decision bottleneck**:

```
Family saves 8 providers
  ↓
Returns to /dashboard/saved
  ↓
Sees 8 provider cards in random order
  ↓
NO WAY TO:
  - Compare providers side-by-side
  - Filter by price, rating, distance
  - Sort by priority
  - Organize their thoughts
  ↓
Opens 8 tabs manually
Tries to remember details
Gets overwhelmed
  ↓
Decision paralysis → Abandonment
OR
Makes poor decision → Regret later
```

**Result:** We fixed activation (Sprint 0) but are losing conversions at the decision stage.

### Sprint 1A Solution
Add **comparison and filtering tools** to help families make confident decisions:

1. **Side-by-Side Comparison:** Select up to 5 providers, see details in table format
2. **Filtering & Sorting:** Filter by status/price/rating, sort by 8 criteria
3. **Search:** Find specific saved providers by name
4. **"Add to Compare" Button:** On provider detail pages

---

## CLARIFYING QUESTIONS - NEED YOUR INPUT

Before I design detailed flows and start building, please answer these questions:

### 1. COMPARISON SCOPE - What should we compare?

**Question:** Which fields should appear in the comparison table?

**Options:**
- **A) Essential Only** (6-8 fields):
  - Name, Provider Type, Location
  - Price Range
  - Rating & Review Count
  - Availability
  - Request Status

- **B) Comprehensive** (15-20 fields):
  - Everything from Option A, plus:
  - Care types offered
  - Amenities (private rooms, memory care, etc.)
  - Staff ratio
  - License/certifications
  - Photos
  - Distance from family

- **C) Custom** (user selects fields):
  - Default to essential fields
  - Allow user to add/remove fields from comparison

**My Recommendation:** Start with Option A (Essential) for Sprint 1A, add Option C (Custom) in Sprint 4.

**Your preference?**

---

### 2. COMPARISON UX - Modal vs. Full Page?

**Question:** How should the comparison view be displayed?

**Options:**
- **A) Full-Screen Modal** (Recommended):
  - Overlay modal with close X
  - Sticky header with provider names
  - Scrollable table below
  - Pros: Focused, doesn't leave page
  - Cons: Can't reference while browsing

- **B) Separate Page** (/dashboard/saved/compare):
  - Dedicated comparison URL
  - Can bookmark/share
  - Pros: Sharable, more space
  - Cons: Loses context, extra navigation

- **C) Side-by-Side Split View**:
  - Left: Saved providers list
  - Right: Comparison table
  - Pros: Context preserved
  - Cons: Cramped on mobile

**My Recommendation:** Option A (Full-Screen Modal) for Sprint 1A.

**Your preference?**

---

### 3. SELECTION LIMIT - How many providers can be compared?

**Question:** What's the maximum number of providers users can compare at once?

**Options:**
- **A) 2 providers** (bare minimum)
- **B) 3 providers** (common pattern)
- **C) 5 providers** (recommended by audit)
- **D) Unlimited** (not recommended - too overwhelming)

**Industry Standards:**
- Airbnb: 3 listings
- Zillow: 4 homes
- Booking.com: 5 hotels

**My Recommendation:** 5 providers (Option C) - balances thoroughness with decision paralysis.

**Your preference?**

---

### 4. FILTER OPTIONS - Which filters should we build?

**Question:** Which filters are most important for Sprint 1A?

**Available Data in Database:**
- Provider type (ASSISTED_LIVING, MEMORY_CARE, etc.)
- Care types offered
- Price range (priceMin, priceMax)
- Rating (averageRating)
- Review count
- Location (city, state, distance)
- Request status (not sent, sent, responded, completed)
- Availability (availableSpots)

**Filter Categories:**
- **A) Request Status** (Critical - users need this):
  - All
  - Not Yet Contacted
  - Request Sent
  - Active Conversation
  - Completed/Archived

- **B) Provider Type** (Important):
  - Checkboxes for each type

- **C) Price Range** (Important):
  - Slider with min/max

- **D) Rating** (Important):
  - Minimum rating dropdown (4+, 3+, 2+, Any)

- **E) Distance** (Nice to have):
  - Requires family location + distance calc
  - Sprint 2 feature?

- **F) Availability** (Nice to have):
  - Has openings vs. Waitlist

**My Recommendation for Sprint 1A:**
- **MUST HAVE:** Request Status (A), Provider Type (B)
- **SHOULD HAVE:** Price Range (C), Rating (D)
- **DEFER:** Distance (E), Availability (F) to Sprint 2

**Your preference?**

---

### 5. SORT OPTIONS - Which sorting criteria?

**Question:** Which sort options should we implement?

**Proposed Options:**
1. **Recently Saved** (newest first) - default
2. **Alphabetical** (A-Z, Z-A)
3. **Price** (Low to High, High to Low)
4. **Rating** (Highest first)
5. **Most Reviewed** (review count descending)
6. **Distance** (Closest first) - requires location calc, Sprint 2?
7. **Request Status** (Not contacted first)
8. **Custom Priority** (if we add priority feature - Sprint 4)

**My Recommendation for Sprint 1A:**
- Implement options 1-5, 7 (defer distance to Sprint 2)

**Your preference?**

---

### 6. SEARCH - Simple or Advanced?

**Question:** What should the search feature do?

**Options:**
- **A) Name Search Only**:
  - Search by provider business name
  - Simple, fast

- **B) Multi-Field Search**:
  - Search name, city, provider type, notes
  - More powerful but slower

- **C) Fuzzy Search**:
  - Handles typos, partial matches
  - Best UX but more complex

**My Recommendation:** Option A (Name Search) for Sprint 1A, enhance in Sprint 4.

**Your preference?**

---

### 7. COMPARISON ACTIONS - What can users do from comparison view?

**Question:** Which actions should be available in the comparison modal?

**Options:**
- **A) View Profile** - Link to full provider detail page
- **B) Send Request** - Initiate consultation request
- **C) Remove from Saved** - Unsave provider
- **D) Remove from Comparison** - Keep saved, but remove from comparison
- **E) Print/Export Comparison** - PDF or screenshot
- **F) Share Comparison** - Share URL with family members

**My Recommendation for Sprint 1A:**
- **MUST HAVE:** A (View Profile), D (Remove from Comparison)
- **SHOULD HAVE:** B (Send Request)
- **DEFER:** C, E, F to later sprints

**Your preference?**

---

### 8. MOBILE EXPERIENCE - How should comparison work on mobile?

**Question:** Comparison tables don't work well on small screens. How should we handle mobile?

**Options:**
- **A) Vertical Card Stack**:
  - Each provider as an expanded card
  - Swipe between cards
  - Pros: Native mobile feel
  - Cons: Can't see side-by-side

- **B) Horizontal Scroll Table**:
  - Same table, just scrolls horizontally
  - Pros: Consistent with desktop
  - Cons: Awkward UX on mobile

- **C) Hide on Mobile**:
  - Show message: "Comparison works best on desktop"
  - Link to desktop version
  - Pros: Honest about limitations
  - Cons: Excludes mobile users

- **D) Responsive Hybrid**:
  - Desktop: Full table
  - Tablet: Scrollable table
  - Mobile: Vertical card stack (Option A)

**My Recommendation:** Option D (Responsive Hybrid) - best of both worlds.

**Your preference?**

---

### 9. PROVIDER DETAIL PAGE INTEGRATION - Where should "Add to Compare" button go?

**Question:** Where on the provider detail page should we add the comparison CTA?

**Current Provider Detail Page Has:**
- Hero section with photos
- Overview section with details
- Request Consultation button (prominent)
- Save/Unsave heart button (top right)

**Options for "Add to Compare" Button:**

- **A) Next to "Save" Button** (Top Right):
  - Near existing save heart icon
  - Pros: Related actions together
  - Cons: Might clutter header

- **B) Below "Request Consultation"** (Hero Section):
  - Secondary CTA below primary
  - Pros: Visible, logical flow
  - Cons: Competes with primary CTA

- **C) Floating Comparison Bar** (Bottom of Screen):
  - Sticky bar shows "X providers selected"
  - Add/remove from comparison
  - Pros: Always visible, doesn't interfere
  - Cons: Takes screen space

- **D) Only on Saved Providers Page**:
  - Don't add to detail page at all
  - Users must go to /dashboard/saved to compare
  - Pros: Simpler, less cluttered
  - Cons: Misses discovery opportunity

**My Recommendation:** Option C (Floating Bar) for multi-provider comparison discovery, Option A (Next to Save) for individual page.

**Your preference?**

---

### 10. SCOPE QUESTIONS - What's IN Sprint 1A vs. Later?

**Sprint 1A Candidates:**
- [ ] Side-by-side comparison modal (up to 5 providers)
- [ ] Checkbox selection on saved provider cards
- [ ] Comparison table with essential fields
- [ ] Remove from comparison action
- [ ] View profile from comparison
- [ ] Send request from comparison
- [ ] Filter by request status + provider type
- [ ] Filter by price range + rating
- [ ] Sort by 6-7 criteria (not distance)
- [ ] Search saved providers by name
- [ ] "Add to Compare" on provider detail page
- [ ] Mobile responsive (vertical card stack)
- [ ] Empty states (no saved providers, comparison needs 2+)
- [ ] Persistent selection across page refreshes (localStorage)

**Deferred to Later Sprints:**
- [ ] Custom field selection for comparison
- [ ] Distance filter/sort (requires geolocation - Sprint 2)
- [ ] Availability filter (Sprint 2)
- [ ] Print/export comparison (Sprint 4)
- [ ] Share comparison with family (Sprint 4)
- [ ] Priority ranking system (Sprint 4)
- [ ] Notes on saved providers (Sprint 4)
- [ ] Bulk actions (remove multiple, contact multiple) - Sprint 2
- [ ] Reminders/nudges for follow-up - Sprint 2

**Does this scope make sense? Anything you'd move IN or OUT of Sprint 1A?**

---

## PROPOSED USER FLOWS

### FLOW 1: Comparing Saved Providers

```
User visits /dashboard/saved
  ↓
Sees 8 saved providers in grid layout
  ↓
Notices checkboxes in top-left of each card
  ↓
Checks 3 providers they want to compare
  ↓
Comparison bar appears at bottom:
  "3 providers selected [Clear] [Compare Selected (3/5)]"
  ↓
Clicks "Compare Selected"
  ↓
Full-screen modal opens with comparison table:
  ┌─────────────────────────────────────────────┐
  │  Compare Providers                    [X]   │
  ├─────────────────────────────────────────────┤
  │ Feature      | Provider A | Provider B | C  │
  ├─────────────────────────────────────────────┤
  │ Type         | Assisted   | Memory     | AL │
  │ Location     | San Diego  | San Diego  | SD │
  │ Price Range  | $4K-$6K    | $6K-$8K    | $5K│
  │ Rating       | 4.8 ⭐     | 4.5 ⭐     | 4.2│
  │ Reviews      | 124        | 89         | 45 │
  │ Status       | Sent       | Not sent   | N/S│
  │ Actions      | [View] [×] | [View] [×] | [×]│
  └─────────────────────────────────────────────┘
  ↓
User clicks [View] on Provider B
  ↓
Opens provider detail page in new tab
  ↓
User returns to comparison, clicks [×] to remove Provider C
  ↓
Now comparing 2 providers
  ↓
User decides on Provider A
  ↓
Closes modal, clicks "Request Consultation" on Provider A card
```

### FLOW 2: Filtering Saved Providers

```
User visits /dashboard/saved with 15 saved providers
  ↓
Filters section at top:
  ┌────────────────────────────────────────┐
  │ Filter: [All Requests ▼]               │
  │ Type: [All Types ▼]                    │
  │ Price: [Min $0] — [Max $15K]           │
  │ Rating: [3+ Stars ▼]                   │
  │ [Clear Filters]                        │
  └────────────────────────────────────────┘
  ↓
User selects "Not Yet Contacted" from request status dropdown
  ↓
Grid updates to show only 8 providers without sent requests
  ↓
User moves price slider to $3K-$6K range
  ↓
Grid updates to show only 4 providers in budget
  ↓
User can now focus on the right subset
```

### FLOW 3: Sorting Saved Providers

```
User visits /dashboard/saved
  ↓
Sort dropdown at top right:
  "Sort by: [Recently Saved ▼]"
  ↓
User opens dropdown, sees options:
  - Recently Saved (default)
  - Alphabetical (A-Z)
  - Alphabetical (Z-A)
  - Price (Low to High)
  - Price (High to Low)
  - Highest Rated
  - Most Reviewed
  - Not Contacted First
  ↓
User selects "Highest Rated"
  ↓
Grid reorders to show 4.8⭐ providers first
  ↓
User can prioritize quality providers
```

### FLOW 4: Searching Saved Providers

```
User has 20 saved providers
  ↓
Remembers seeing "Sunrise" facility but can't find it
  ↓
Types "sunrise" in search bar at top
  ↓
Grid filters to show only "Sunrise Senior Living" matches (3 locations)
  ↓
User finds the right one immediately
```

### FLOW 5: Adding to Compare from Provider Detail Page

```
User browses provider directory
  ↓
Clicks on provider → Provider detail page opens
  ↓
Sees floating bar at bottom:
  "0 providers selected for comparison"
  [Add to Compare] button
  ↓
Clicks [Add to Compare]
  ↓
Provider auto-saved (if not already)
  ↓
Floating bar updates:
  "1 provider selected [View Comparison]"
  ↓
User continues browsing, adds 2 more providers
  ↓
Floating bar: "3 providers selected [View Comparison]"
  ↓
Clicks [View Comparison]
  ↓
Comparison modal opens with 3 providers
```

---

## TECHNICAL IMPLEMENTATION PLAN

### 1. State Management

**Question:** How should we store comparison selection?

**Options:**
- **A) Component State (useState)**:
  - Simple, works for single session
  - Lost on page refresh

- **B) LocalStorage**:
  - Persists across refreshes
  - Works offline
  - Limited to ~5MB

- **C) Database (user preferences)**:
  - Syncs across devices
  - Permanent storage
  - Requires API calls

- **D) Hybrid (localStorage + database)**:
  - Save to localStorage immediately
  - Sync to database on change
  - Best of both worlds

**My Recommendation:** Option B (localStorage) for Sprint 1A - simpler, still persistent. Upgrade to Option D in Sprint 4 if multi-device sync is needed.

**Your preference?**

---

### 2. Component Structure

```
/dashboard/saved/page.tsx (Enhanced)
  ├── FilterBar (NEW)
  │   ├── RequestStatusFilter
  │   ├── ProviderTypeFilter
  │   ├── PriceRangeSlider
  │   ├── RatingFilter
  │   └── ClearFiltersButton
  │
  ├── SearchBar (NEW)
  │
  ├── SortDropdown (NEW)
  │
  ├── SavedProvidersGrid
  │   ├── SavedProviderCard (ENHANCED)
  │   │   ├── SelectionCheckbox (NEW)
  │   │   ├── ProviderImage
  │   │   ├── ProviderDetails
  │   │   ├── ActionButtons
  │   │   └── RequestSentBadge
  │   └── EmptyState
  │
  ├── ComparisonBar (NEW - sticky bottom)
  │   ├── SelectionCount
  │   ├── ClearButton
  │   └── CompareButton
  │
  └── ComparisonModal (NEW)
      ├── ModalHeader
      ├── ComparisonTable
      │   ├── ProviderColumns
      │   ├── FeatureRows
      │   └── ActionButtons
      └── MobileCardStack (responsive)

/providers/[id]/page.tsx (Enhanced)
  └── ComparisonFloatingBar (NEW)
      ├── SelectionStatus
      ├── AddToCompareButton
      └── ViewComparisonLink
```

---

### 3. API Requirements

**New Endpoints Needed:**

**GET /api/saved-providers**
```typescript
// Enhanced with filtering, sorting, search
Query params:
  - status: 'all' | 'not-contacted' | 'sent' | 'active' | 'completed'
  - type: ProviderType[]
  - priceMin: number
  - priceMax: number
  - minRating: number
  - search: string
  - sortBy: 'recent' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating' | 'reviews' | 'not-contacted'

Response:
  {
    providers: Provider[],
    total: number,
    filtered: number
  }
```

**No new database changes needed!** ✅ All fields already exist in schema.

---

### 4. UI Components to Build

**New Components:**
1. `<FilterBar />` - All filter controls
2. `<SearchBar />` - Name search input
3. `<SortDropdown />` - Sort options
4. `<ComparisonBar />` - Sticky bottom bar
5. `<ComparisonModal />` - Full-screen comparison table
6. `<ComparisonFloatingBar />` - Provider detail page integration
7. `<MobileComparisonCards />` - Mobile-optimized comparison view

**Enhanced Components:**
8. Update `<SavedProviderCard />` - Add checkbox
9. Update `/dashboard/saved/page.tsx` - Add filters, sorting, search

**Estimated Component Count:** 9 components (7 new, 2 enhanced)

---

## SUCCESS METRICS

### Sprint 1A Goals:
- **Comparison adoption:** >40% of users with 3+ saved providers use comparison
- **Decision time:** 30% reduction (from browsing to contact)
- **Conversion rate:** 67% increase (saved providers → requests sent)
- **Filter usage:** >60% of users with 5+ saved providers use filters
- **Sort usage:** >50% of users try sorting

### KPIs to Track:
- % users who select providers for comparison
- Avg providers compared per session
- Time spent in comparison modal
- Conversion rate: comparison → request sent
- Filter usage by type (status, price, rating, type)
- Sort option popularity
- Search usage rate
- Mobile vs. desktop comparison usage

---

## EFFORT ESTIMATE

**Frontend Development:**
- FilterBar component: 3 hours
- SearchBar component: 1 hour
- SortDropdown component: 1 hour
- ComparisonBar component: 2 hours
- ComparisonModal (desktop): 4 hours
- MobileComparisonCards (responsive): 3 hours
- ComparisonFloatingBar (provider detail): 2 hours
- SavedProviderCard enhancement: 1 hour
- State management (localStorage): 2 hours

**Backend Development:**
- Enhanced /api/saved-providers: 2 hours
- Query optimization: 1 hour

**Testing & Polish:**
- Desktop testing: 2 hours
- Mobile testing: 2 hours
- Edge cases: 1 hour

**Documentation:**
- Component docs: 1 hour

**Total: 28 hours** (~3.5 days)

**Matches audit estimate:** 3-4 days ✅

---

## MOCKUPS & WIREFRAMES

### Comparison Modal (Desktop View)

```
┌──────────────────────────────────────────────────────────────────┐
│  Compare Providers (3 selected)                            [X]   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Feature          │ Sunrise AL      │ Golden Years   │ Comfort  │
│  ────────────────────────────────────────────────────────────────│
│  📸 Photo         │ [img]           │ [img]          │ [img]    │
│  🏢 Type          │ Assisted Living │ Memory Care    │ AL       │
│  📍 Location      │ San Diego, CA   │ San Diego, CA  │ La Jolla │
│  💰 Price Range   │ $4,000-$6,000   │ $6,000-$8,000  │ $5,000   │
│  ⭐ Rating        │ 4.8 ⭐ (124)    │ 4.5 ⭐ (89)    │ 4.2 ⭐   │
│  🛏️ Private Rooms│ ✅ Yes          │ ✅ Yes         │ ❌ No    │
│  🧠 Memory Care  │ ❌ No           │ ✅ Yes         │ ❌ No    │
│  🩺 Nursing      │ ✅ Available    │ ✅ 24/7        │ Part-time│
│  📞 Status       │ ✉️ Request Sent │ ❌ Not Sent    │ Not Sent │
│  ────────────────────────────────────────────────────────────────│
│  Actions         │ [View] [Remove] │ [View] [Remove]│ [Remove] │
│                  │ [Request Info]  │ [Request Info] │ [Request]│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Filter Bar (Saved Providers Page)

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍 Search saved providers...                                    │
│                                                                  │
│  Filter:  [All Requests ▼]  [All Types ▼]                      │
│  Price:   [$0] ━━━━━━━━━●━━ [$15K]                              │
│  Rating:  [3+ Stars ▼]           [Clear All Filters]           │
│                                                                  │
│  Sort by: [Recently Saved ▼]                       12 providers │
└──────────────────────────────────────────────────────────────────┘
```

### Comparison Bar (Sticky Bottom)

```
┌──────────────────────────────────────────────────────────────────┐
│  ✓ 3 providers selected                [Clear] [Compare (3/5)] │
└──────────────────────────────────────────────────────────────────┘
```

---

## RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Comparison too complex | Medium | Start with essential fields only, allow customization later |
| Mobile UX poor | High | Build separate mobile view (vertical cards) |
| Performance with many saved providers | Low | Paginate at 50+ providers, optimize queries |
| Users don't discover feature | Medium | Onboarding tooltip, empty state prompts |
| LocalStorage limit reached | Low | Clear old comparison selections, cap at 5 providers |

---

## QUESTIONS FOR YOU - SUMMARY

Please answer these 10 key questions:

1. **Comparison Scope:** Essential fields only (A), Comprehensive (B), or Custom (C)?
2. **Comparison UX:** Full-screen modal (A), Separate page (B), or Split view (C)?
3. **Selection Limit:** 2, 3, 5, or unlimited providers to compare?
4. **Filter Options:** Which filters are priority? (Status, Type, Price, Rating, Distance, Availability?)
5. **Sort Options:** All 7-8 sort options, or defer some?
6. **Search:** Name only (A), Multi-field (B), or Fuzzy (C)?
7. **Comparison Actions:** Which actions from comparison modal? (View, Request, Remove, Print, Share?)
8. **Mobile Experience:** Vertical cards (A), Scrollable table (B), Hide (C), or Hybrid (D)?
9. **Provider Detail Integration:** Where to put "Add to Compare"? (Next to Save, Below CTA, Floating bar, or Skip?)
10. **Scope Boundaries:** Anything to add/remove from Sprint 1A scope?

---

**Status:** 📋 **Awaiting Your Answers**
**Next Step:** You answer questions → I create detailed implementation plan → Get approval → Build Sprint 1A

---

Let me know your preferences and I'll create step-by-step implementation tasks like we did for Sprint 0!
