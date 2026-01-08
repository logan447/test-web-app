# Provider Detail Page Enhancement Plan
## Phase 1: Building Trust & Rich Content

**Target Page:** `/app/providers/[id]/page.tsx`

---

## 🎯 IMPLEMENTATION BREAKDOWN (Small Incremental Tasks)

### **Sprint 1: Foundation & Pricing (Week 1, Days 1-3)** ✅ COMPLETED

#### Task 1.1: Add Pricing Fields to Database ✅
- [x] Update Prisma schema with pricing fields
- [x] Add migration
- [x] Update Provider model with:
  - `priceMin` (Int, nullable)
  - `priceMax` (Int, nullable)
  - `priceDescription` (String, nullable)
  - `paymentOptions` (String[], nullable)

#### Task 1.2: Add Pricing Section to Provider Detail Page ✅
- [x] Create pricing display component
- [x] Show "Starting from $X,XXX/month" or "Contact for pricing"
- [x] Display price range if both min/max available
- [x] List payment options (Private pay, Medicare, Medicaid, etc.)
- [x] Style with emphasis (card with border, larger text)

#### Task 1.3: Update Provider Profile Form with Pricing ✅
- [x] Add pricing input fields to form
- [x] Price range (min/max) number inputs
- [x] Payment options checkboxes
- [x] "What's included" textarea
- [x] Save to database

**Deliverable:** ✅ Providers can add pricing, families can see pricing transparency

---

### **Sprint 2: Visual Trust Indicators (Week 1, Days 4-5)** ✅ COMPLETED

#### Task 2.1: Add Certifications/Badges ✅
- [x] Update Prisma schema:
  - `certifications` (String[], nullable)
  - `insuranceVerified` (Boolean, default false)
  - `backgroundChecked` (Boolean, default false)
- [x] Add badge display to detail page:
  - "Licensed & Insured" badge
  - "Verified" checkmark badge
  - "Medicare Certified" if applicable
- [x] Style badges (colored pills with icons)

#### Task 2.2: Add Capacity/Availability Display ✅
- [x] Update Prisma schema:
  - `totalCapacity` (Int, nullable)
  - `availableSpots` (Int, nullable)
  - `waitlistAvailable` (Boolean, default false)
- [x] Display on detail page:
  - "X rooms available" in green badge
  - "Currently at capacity" in gray badge
  - "Waitlist available" if no beds
- [x] Add to provider profile form

**Deliverable:** ✅ Trust indicators visible on provider profiles

---

### **Sprint 3: Photo Gallery System (Week 2, Days 1-3)** ✅ COMPLETED

#### Task 3.1: Set Up Image Upload Infrastructure ✅
- [x] Choose upload solution (Vercel Blob, Cloudinary, or AWS S3)
- [x] Install required packages
- [x] Create upload API route (`/api/upload/images`)
- [x] Add image validation (size, type, dimensions)

#### Task 3.2: Add Photo Fields to Database ✅
- [x] Update Prisma schema:
  - `photos` (String[], nullable) - array of image URLs
  - `coverPhoto` (String, nullable) - main hero image
- [x] Run migration

#### Task 3.3: Create Photo Gallery Component ✅
- [x] Build gallery viewer component
  - Grid layout (3 photos visible, "Show all X photos" button)
  - Lightbox/modal for full-screen view
  - Navigation arrows
  - Thumbnails
- [x] Add to provider detail page (top section)

#### Task 3.4: Add Photo Upload to Provider Profile Form ✅
- [x] Multi-file upload input
- [x] Drag-and-drop zone
- [x] Image preview before upload
- [x] Reorder photos functionality
- [x] Set primary/cover photo
- [x] Upload progress indicator

**Deliverable:** ✅ Providers can upload 5-10 photos, families see rich photo galleries

---

### **Sprint 4: Reviews & Ratings System (Week 2, Days 4-5 + Week 3, Days 1-2)**

#### Task 4.1: Create Review Schema
- [ ] New Prisma model `Review`:
  - `id` (String, @id)
  - `providerId` (String, relation to Provider)
  - `userId` (String, relation to User)
  - `rating` (Int, 1-5)
  - `title` (String)
  - `content` (String)
  - `relationship` (String, e.g., "Daughter of resident")
  - `lengthOfStay` (String, nullable)
  - `helpful` (Int, default 0)
  - `createdAt` (DateTime)
- [ ] Add aggregated fields to Provider:
  - `averageRating` (Float, nullable)
  - `reviewCount` (Int, default 0)
- [ ] Run migration

#### Task 4.2: Create Review API Routes
- [ ] POST `/api/providers/[id]/reviews` - Submit review
- [ ] GET `/api/providers/[id]/reviews` - Fetch reviews with pagination
- [ ] PUT `/api/reviews/[id]/helpful` - Mark review as helpful
- [ ] Add validation (one review per user per provider)

#### Task 4.3: Add Reviews Section to Provider Detail
- [ ] Star rating display (large, at top)
- [ ] Review count (e.g., "4.8 stars from 127 reviews")
- [ ] Reviews list component:
  - Reviewer name + relationship
  - Date + length of stay
  - Star rating
  - Review text
  - "Helpful" button
- [ ] Pagination or "Load more" button
- [ ] Sort by: Most recent, Highest rated, Lowest rated

#### Task 4.4: Create Review Submission Form
- [ ] Modal/page for leaving a review
- [ ] Star rating selector
- [ ] Title and content textareas
- [ ] Relationship dropdown
- [ ] Length of stay input
- [ ] Submit and show in list

**Deliverable:** Full review system with ratings, families can trust providers with social proof

---

### **Sprint 5: Detailed Amenities & Services (Week 3, Days 3-5)**

#### Task 5.1: Expand Services/Amenities Schema
- [ ] Update Prisma schema:
  - `roomFeatures` (String[], nullable)
  - `commonAreas` (String[], nullable)
  - `medicalServices` (String[], nullable)
  - `activitiesOffered` (String[], nullable)
  - `dietaryOptions` (String[], nullable)
- [ ] Run migration

#### Task 5.2: Add Amenities Section to Provider Detail
- [ ] Create organized layout with icons
- [ ] Categories:
  - Room Features (private bath, WiFi, etc.)
  - Common Areas (library, garden, etc.)
  - Medical Services (24/7 RN, PT, etc.)
  - Activities (arts, music, exercise, etc.)
  - Dining (dietary options)
- [ ] Use icon library (Heroicons or similar)
- [ ] Grid layout with checkmarks

#### Task 5.3: Update Provider Profile Form
- [ ] Add extensive checkbox lists for:
  - Room features (15+ options)
  - Common areas (10+ options)
  - Medical services (10+ options)
  - Activities (15+ options)
  - Dietary options (8+ options)
- [ ] Organize in collapsible sections
- [ ] Save to database

**Deliverable:** Comprehensive amenities display, families know exactly what's offered

---

### **Sprint 6: Staff & Care Information (Week 4, Days 1-2)**

#### Task 6.1: Add Staff Fields to Database
- [ ] Update Prisma schema:
  - `staffToResidentRatio` (String, nullable)
  - `hasRNOnSite` (Boolean)
  - `hasLVNOnSite` (Boolean)
  - `allStaffBackgroundChecked` (Boolean)
  - `visitingDoctorFrequency` (String, nullable)
- [ ] Run migration

#### Task 6.2: Add Staff Information Section
- [ ] Display staff-to-resident ratio prominently
- [ ] List staff credentials with checkmarks
- [ ] Medical support details
- [ ] Style as trust-building section

#### Task 6.3: Update Provider Profile Form
- [ ] Add staff information inputs
- [ ] Ratio input (text or dropdowns)
- [ ] Staff credential checkboxes
- [ ] Medical support details

**Deliverable:** Clear staff information builds confidence

---

### **Sprint 7: Location & Map Integration (Week 4, Days 3-5)**

#### Task 7.1: Add Interactive Map
- [ ] Install mapping library (react-map-gl or Google Maps)
- [ ] Get API key (Google Maps or Mapbox)
- [ ] Add map component to detail page
- [ ] Show provider location pin
- [ ] Add zoom controls

#### Task 7.2: Add Nearby Amenities
- [ ] Update Prisma schema (optional):
  - `nearbyHospital` (String, nullable)
  - `nearbyParks` (String, nullable)
- [ ] Display list of nearby amenities (manual entry for now)
- [ ] Show distances

#### Task 7.3: Add Neighborhood Description
- [ ] Add `neighborhoodDescription` field to schema
- [ ] Display on detail page
- [ ] Add to provider profile form

**Deliverable:** Families understand location context

---

### **Sprint 8: Enhanced CTAs & Booking Flow (Week 5, Days 1-3)**

#### Task 8.1: Add Multiple CTA Options
- [ ] Redesign CTA section:
  - Primary: "Send Request" (existing)
  - Secondary: "Schedule Tour" (new - opens contact form with tour request)
  - Tertiary: "Request Pricing" (if no pricing shown)
- [ ] Make CTAs sticky on scroll (mobile)
- [ ] Add phone number click-to-call button

#### Task 8.2: Enhance Request Form
- [ ] Pre-fill with provider info
- [ ] Add "Reason for contact" dropdown:
  - Schedule a tour
  - Request pricing information
  - Ask a question
  - Request immediate placement
- [ ] Add preferred contact method
- [ ] Add preferred time for tour (date/time picker)

**Deliverable:** Multiple conversion paths, easier to take action

---

### **Sprint 9: Specialty Care & Programs (Week 5, Days 4-5)**

#### Task 9.1: Add Specialty Care Fields
- [ ] Update Prisma schema:
  - `hasMemoryCare` (Boolean)
  - `hasRespiteCare` (Boolean)
  - `hasHospiceCare` (Boolean)
  - `specialtyPrograms` (String[], nullable)
  - `languagesSpoken` (String[], nullable)
- [ ] Run migration

#### Task 9.2: Display Specialty Care Section
- [ ] Highlight specialty programs with badges
- [ ] Memory care details (if offered)
- [ ] Languages spoken
- [ ] Cultural programs

#### Task 9.3: Update Provider Profile Form
- [ ] Add specialty care checkboxes
- [ ] Languages multi-select
- [ ] Specialty program descriptions

**Deliverable:** Families find exactly the specialized care they need

---

### **Sprint 10: Polish & Optimization (Week 6)**

#### Task 10.1: Design Polish
- [ ] Improve typography hierarchy
- [ ] Add subtle animations (fade-ins, hover effects)
- [ ] Ensure consistent spacing
- [ ] Add loading skeletons
- [ ] Mobile responsiveness check

#### Task 10.2: Performance Optimization
- [ ] Image lazy loading
- [ ] Implement image optimization (next/image)
- [ ] Add page caching
- [ ] Optimize database queries (includes/selects)

#### Task 10.3: SEO & Metadata
- [ ] Add dynamic meta tags (title, description)
- [ ] Add Open Graph tags (for social sharing)
- [ ] Add structured data (JSON-LD for local business)

**Deliverable:** Professional, fast, delightful experience

---

## 📊 PROGRESS TRACKING

### Completed:
- [x] Sprint 1: Foundation & Pricing ✅
- [x] Sprint 2: Visual Trust Indicators ✅
- [x] Sprint 3: Photo Gallery System ✅
- [ ] Sprint 4: Reviews & Ratings System
- [ ] Sprint 5: Detailed Amenities & Services
- [ ] Sprint 6: Staff & Care Information
- [ ] Sprint 7: Location & Map Integration
- [ ] Sprint 8: Enhanced CTAs & Booking Flow
- [ ] Sprint 9: Specialty Care & Programs
- [ ] Sprint 10: Polish & Optimization

### Current Sprint: 4
### Current Task: 4.1

---

## 🎨 DESIGN NOTES

### Visual Hierarchy (Top to Bottom):
1. **Hero Section** (photos + name + rating)
2. **Quick Info Bar** (price, availability, location)
3. **About** (description)
4. **Amenities & Services** (detailed lists with icons)
5. **Pricing Details** (transparent breakdown)
6. **Staff & Care** (credentials, ratios)
7. **Reviews** (social proof)
8. **Location & Map** (context)
9. **FAQ** (address concerns)
10. **CTAs** (sticky on mobile)

### Key Design Principles:
- **Trust First:** Reviews, certifications, and pricing upfront
- **Scan-ability:** Use icons, bold headings, bullet points
- **Mobile-First:** Most users 65+ browse on tablets/phones
- **Clear Actions:** CTAs always visible, multiple paths to convert

---

**Ready to Start Sprint 1!**
