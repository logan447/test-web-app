# UX/UI Audit for Users 65+
## Olera Elder Care Platform

**Audit Date:** January 2026
**Focus:** Improving clarity, simplicity, and accessibility for users over 65

---

## Executive Summary

This audit examines the Olera platform's user interface and copy through the lens of users aged 65 and older. The goal is to identify opportunities to simplify language, improve clarity, and reduce cognitive load across all key user flows.

**Key Findings:**
- ✅ **Strengths:** Clear navigation structure, consistent design patterns, helpful empty states
- ⚠️ **Needs Improvement:** Technical jargon, unclear terminology, complex multi-step processes, insufficient guidance
- 🔴 **Critical Issues:** "Consultation Request" terminology is confusing, paywall messaging is unclear, request status system needs simplification

**Priority Levels:**
- 🔴 **HIGH** - Blocks understanding or creates confusion
- 🟡 **MEDIUM** - Could be clearer but functional
- 🟢 **LOW** - Nice to have improvements

---

## 1. TERMINOLOGY & LANGUAGE ISSUES

### 🔴 HIGH PRIORITY: "Consultation Request" is Confusing

**Current State:**
- "Send Consultation Request"
- "Consultation Requests"
- "Request Consultation"

**Problem:**
For older adults unfamiliar with healthcare terminology, "consultation" sounds medical or formal. It's unclear what this actually means - is it a phone call? An in-person meeting? A quote?

**Recommendation:**
Replace "Consultation Request" with clearer, action-oriented language:
- **"Connect with [Provider/Family]"** or
- **"Start Conversation"** or
- **"Send Message to [Name]"**

For the requests page title:
- Change "Consultation Requests" → **"My Messages"** or **"Conversations"**

**Before:**
```
Button: "Request Consultation"
Page Title: "Consultation Requests"
```

**After:**
```
Button: "Send Message"
Page Title: "My Conversations"
```

**Impact:** Makes it immediately clear that this is a communication feature, not a formal appointment.

---

### 🔴 HIGH PRIORITY: "Hiring Request" vs "Employment Request" Inconsistency

**Current State:**
- Page title: "Hiring Requests"
- Badge: "Employment Request Sent • Pending"
- Form title: "Send Hiring Request"

**Problem:**
The platform uses both "hiring" and "employment" interchangeably, creating confusion. Users may think these are different features.

**Recommendation:**
Choose ONE term and use it consistently. Recommended: **"Job Opportunity"** or **"Work Request"**

For caregivers looking for work:
- "Browse Job Opportunities"
- "Work Requests"
- "Send Work Request"

For organizations hiring:
- "Browse Caregivers"
- "Hiring Requests"
- "Send Hiring Request"

**Before:**
```
Badge: "Employment Request Received • Pending"
Page: "Hiring Requests"
Button: "Send Hiring Request"
```

**After:**
```
Badge: "Job Opportunity Received • Pending"
Page: "Job Opportunities"
Button: "Express Interest"
```

---

### 🟡 MEDIUM PRIORITY: "Provider" is Overloaded

**Current State:**
"Provider" refers to:
1. Care organizations
2. Individual caregivers
3. Anyone offering services

**Problem:**
The word "provider" is vague. When a family sees "Browse Providers," they don't know if they're looking at companies or individuals.

**Recommendation:**
Be more specific in context:
- **For families:** "Find Care Services" or "Find Caregivers & Facilities"
- **For filter labels:** "Organization Type" instead of "Provider Type"
- **For individual caregivers:** Call them "Caregivers" not "Providers"

**Before:**
```
Page Title: "Find Care Providers"
Subtitle: "Browse our nationwide directory of elder care providers"
Filter: "Provider Type"
```

**After:**
```
Page Title: "Find Care Services"
Subtitle: "Browse caregivers and care facilities in your area"
Filter: "Type of Care"
```

---

### 🟡 MEDIUM PRIORITY: Technical Terms Need Plain Language

**Current Issues:**

| Current Term | Problem | Recommended Change |
|--------------|---------|-------------------|
| "Care Types Needed" | Formal, clinical | "What help do you need?" |
| "Service Radius (miles)" | Technical | "How far will you travel?" |
| "Capacity (number of clients)" | Business jargon | "How many people can you help?" |
| "Budget Range" | Financial planning term | "What you can spend each month" |
| "Profile Visibility" | Tech term | "Who can see your information?" |
| "Licensed Provider" | Formal | "Licensed & Certified" (checkbox) |
| "Timeline" | Project management | "When do you need help?" |

---

## 2. NAVIGATION & LABELS

### 🔴 HIGH PRIORITY: "Browse Care Requests" is Backwards

**Current State:**
Providers see: "Browse Care Requests"

**Problem:**
This is written from the platform's perspective, not the user's. Providers don't think "I want to browse requests" - they think "I want to find families who need help."

**Recommendation:**
Change to user-centric language:
- **"Find Families Who Need Help"** or
- **"Families Seeking Care"** or
- **"Available Care Opportunities"**

**Before:**
```
Navigation: "Browse Care Requests"
Description: "Find families looking for care in your area"
```

**After:**
```
Navigation: "Find Families"
Description: "Connect with families who need your help"
```

---

### 🟡 MEDIUM PRIORITY: Dashboard Navigation Clarity

**Current State (Provider Dashboard):**
- "My Profile"
- "Browse Families"
- "Consultation Requests"

**Problem:**
"Consultation Requests" doesn't clearly indicate it's where messages live.

**Recommendation:**
```
- "My Profile" → "My Profile"
- "Browse Families" → "Find Families"
- "Consultation Requests" → "Messages & Requests"
```

---

### 🟡 MEDIUM PRIORITY: Mode Switching Confusion

**Current State:**
Users can switch between "Family Mode" and "Provider Mode" but this isn't explained.

**Problem:**
Older users may not understand what "mode" means or why they need to switch.

**Recommendation:**
Add a brief explanation when mode switching is available:
- Tooltip on mode switcher: "Switch between finding care for your family and offering care services"
- First-time user banner: "You can use Olera to both find care and offer care services. Use the switcher to change what you're doing."

---

## 3. FORMS & INPUT FIELDS

### 🔴 HIGH PRIORITY: Form Field Labels Need Context

**Current Issues:**

**Care Profile Form:**
```
Current: "Timeline"
Problem: Too vague
Better: "When do you need help to start?"
```

```
Current: "Insurance"
Problem: Assumes knowledge of insurance types
Better: "Do you have insurance coverage? (Medicare, Medicaid, or Private)"
```

```
Current: "Description & Special Needs"
Problem: "Special needs" sounds clinical
Better: "Tell us about your loved one" or "About the person who needs care"
```

---

### 🟡 MEDIUM PRIORITY: Placeholder Text Improvements

**Current Placeholders:**

| Field | Current | Better |
|-------|---------|--------|
| Timeline | "e.g., Immediate, Within 2 weeks..." | "Examples: Right away, In 2 weeks, Next month" |
| Budget Min | "e.g., 2000" | "Example: $2,000" (include $ symbol) |
| Service Radius | "How many miles do you serve?" | "Example: 10 miles, 25 miles, 50 miles" |
| Message | "Tell them about your services..." | "Example: I've been providing care for 15 years and specialize in..." |

**Recommendation:**
- Always use complete sentences
- Include actual dollar signs for money
- Give 2-3 concrete examples instead of one
- Use simple, everyday language

---

### 🟡 MEDIUM PRIORITY: Required Field Indicators

**Current State:**
Fields show asterisk (*) for required

**Problem:**
Some older users may not know what * means.

**Recommendation:**
- Keep asterisk but also add text at top of form: "Fields marked with * are required"
- Or use "(required)" text next to label instead of asterisk
- Consider making truly optional fields clearly labeled "(optional)"

---

## 4. STATUS & FEEDBACK MESSAGES

### 🔴 HIGH PRIORITY: Request Status Badge Complexity

**Current State:**
"Care Request Sent • Pending"
"Employment Request Received • Accepted"

**Problem:**
This combines 3 pieces of information (type, direction, status) which may overwhelm older users. The bullet separator • may not be familiar.

**Recommendation:**
Simplify to focus on the most important information:

**For sent messages:**
- "Waiting for reply" (instead of "Sent • Pending")
- "Accepted" (instead of "Sent • Accepted")
- "Conversation started" (instead of "Sent • Accepted")

**For received messages:**
- "Needs your response" (instead of "Received • Pending")
- "Conversation started" (instead of "Received • Accepted")

**Before:**
```
Badge: "Care Request Received • Pending"
```

**After:**
```
Badge: "Needs Your Response"
Icon: ⚠️ (to draw attention)
Color: Yellow/orange (action needed)
```

---

### 🟡 MEDIUM PRIORITY: Contact Information Lock Message

**Current State:**
```
Title: "Contact information is locked"
Message: "Full contact details will be available once both parties accept the consultation request."
```

**Problem:**
"Locked" sounds negative, like they did something wrong. "Both parties accept" is formal.

**Recommendation:**
```
Title: "Contact info will appear after you connect"
Message: "Once you both agree to connect, you'll be able to see phone numbers and email addresses."
```

Or use an icon-based approach:
```
📧 Email: Will appear after connecting
📞 Phone: Will appear after connecting
```

---

### 🟡 MEDIUM PRIORITY: Empty State Messages

**Current Empty States are GOOD but could be better:**

| Current | Better |
|---------|--------|
| "No providers found. Try adjusting your search criteria." | "We couldn't find any matches. Try choosing a different city or care type." |
| "You haven't sent any consultation requests yet." | "You haven't sent any messages yet. Ready to connect with someone?" |
| "No recent activity yet. Start by browsing family care profiles!" | "No activity yet. Visit 'Find Families' to get started!" |

---

## 5. BUTTONS & CALLS TO ACTION

### 🔴 HIGH PRIORITY: Button Labels Are Too Generic

**Current Issues:**

| Current Button | Context | Problem | Better |
|---------------|---------|---------|--------|
| "Send Request" | Sending message to provider | Formal | "Send Message" |
| "View Details" | On request card | Generic | "Read Message" or "View Conversation" |
| "View Request" | After sending | Confusing | "View My Message" |
| "Save Provider" | Bookmark a provider | Unclear what "save" means | "Save for Later" or "Bookmark" |

---

### 🟡 MEDIUM PRIORITY: Primary Actions Need Clarity

**Search Page:**
```
Current: "Search" and "Clear"
Problem: "Clear" is vague - clear what?
Better: "Search" and "Reset Filters"
```

**Request Actions:**
```
Current: "Accept" and "Decline"
Problem: Too formal, binary
Better: "Yes, Let's Connect" and "No Thanks"
Or: "Start Conversation" and "Not Interested"
```

---

## 6. PAYWALL & SUBSCRIPTION

### 🔴 HIGH PRIORITY: Paywall is Confusing

**Current State:**
```
Title: "Provider Membership Required"
Subtitle: "Subscribe to connect with families and other providers"
Price: "$25/month"
Button: "Subscribe for $25/month"
```

**Problems:**
1. "Membership" is vague - what are they paying for?
2. "Subscribe" is tech industry language (like Netflix)
3. Demo mode banner is in yellow and looks like a warning
4. Features list uses tech terminology

**Recommendations:**

**Better Title:**
"Connect with More Families"
or
"Unlock Unlimited Connections"

**Better Subtitle:**
"Send and receive unlimited messages for $25 per month"

**Features List Improvements:**
```
Current: "Send and receive consultation requests"
Better: "Message unlimited families"

Current: "Send and receive hiring requests"
Better: "Connect with job opportunities"

Current: "Save unlimited requests"
Better: "Save favorites"

Current: "Email support"
Better: "Get help when you need it"
```

**Better Button:**
"Start Connecting - $25/month"
or
"Get Started"

---

### 🟡 MEDIUM PRIORITY: Demo Mode Message

**Current:**
Yellow banner: "Demo Mode - This is a demonstration. Your subscription will be activated instantly without payment."

**Problem:**
Yellow looks like a warning. "Activated instantly" sounds automated and impersonal.

**Better:**
Blue/green info banner: "Testing Mode: This is a free demo. No payment required - you can try all features right now."

---

## 7. INFORMATION ARCHITECTURE

### 🟡 MEDIUM PRIORITY: Help Text Placement

**Current State:**
Most forms have minimal inline help. Users must figure things out.

**Recommendation:**
Add contextual help throughout:

**Example - Service Radius field:**
```
Label: "How far will you travel?"
Help text below: "This is the distance you're willing to drive from [Your City]. Most caregivers serve 10-25 miles."
```

**Example - Care Types checkboxes:**
```
Label: "What type of help do you need?"
Help text: "Check all that apply. Not sure? Choose 'Personal Care' to start."
Each option could have (?) tooltip:
- Companion Care: Someone to spend time with, go on walks, play games
- Personal Care: Help with bathing, dressing, eating
- Skilled Nursing: Medical care from a licensed nurse
```

---

### 🟢 LOW PRIORITY: Progressive Disclosure

**Current State:**
All form fields are visible at once, which can be overwhelming.

**Recommendation:**
Consider breaking long forms into steps:

**Care Profile Form:**
```
Step 1: "Tell us what you need" (care types, timeline)
Step 2: "Where are you located?" (location fields)
Step 3: "Your budget" (budget range)
Step 4: "Additional details" (description, insurance)
```

With progress indicator: "Step 2 of 4"

---

## 8. VISUAL & INTERACTION DESIGN

### 🟡 MEDIUM PRIORITY: Icons Need Labels

**Current State:**
Some buttons use only icons (heart for save, X for close)

**Recommendation:**
Always pair icons with text for older users:
```
Current: ❤️ (just icon)
Better: ❤️ Save for Later
```

---

### 🟡 MEDIUM PRIORITY: Link Styling

**Current State:**
Links are blue and underlined (good!)

**Recommendation:**
- Ensure all clickable items look clickable (underline or button style)
- Avoid "click here" - use descriptive link text
- Make touch targets at least 44x44px for mobile users

---

### 🟢 LOW PRIORITY: Font Sizes

**Current State:**
Font sizes appear reasonable but should be tested.

**Recommendation:**
- Ensure body text is at least 16px
- Ensure all clickable/tappable text is at least 16px
- Consider offering a "large text" option in settings

---

## 9. PAGE-BY-PAGE PRIORITY CHANGES

### 🔴 CRITICAL PAGES (Do First)

#### 1. **Login/Signup Pages**
- ✅ Currently good! Clear, simple, minimal.
- Minor improvement: Add "Why do I need an account?" help text

#### 2. **Browse Providers/Care Services**
Changes:
- Title: "Find Care Providers" → "Find Care Services"
- Subtitle: "Browse our nationwide directory" → "Find caregivers and care facilities near you"
- Filter label: "Provider Type" → "Type of Care"
- Empty state: More specific suggestions

#### 3. **Care Profile Creation**
Changes:
- Page title: "Create Care Profile" → "Tell Us About Your Needs"
- All form labels per section 3 above
- Add progress indicator if using steps
- Add more helpful placeholder text

#### 4. **Request Detail Page**
Changes:
- Remove confusing "locked" language
- Simplify status badges
- Change "Messages" section to "Conversation"
- Make action buttons more direct

---

### 🟡 IMPORTANT PAGES (Do Second)

#### 5. **Requests List Page**
Changes:
- Title: "Consultation Requests" → "My Messages" or "Conversations"
- Status badges: Simplify per section 4
- Tab labels: "Received from Providers" → "Messages I Received"

#### 6. **Provider Profile Creation**
Changes:
- Form labels per section 3
- Add helpful tooltips for technical fields
- Simplify availability checkboxes language

---

### 🟢 LOWER PRIORITY PAGES

#### 7. **Dashboard**
- Already fairly clear
- Could add more onboarding guidance for first-time users

#### 8. **Saved Pages**
- Currently clear
- Could improve empty state CTAs

---

## 10. COPY WRITING PRINCIPLES FOR 65+

### General Guidelines:

1. **Use Active Voice**
   - ❌ "Your request will be sent"
   - ✅ "We'll send your message"

2. **Use Familiar Words**
   - ❌ "Initiate consultation"
   - ✅ "Start talking"

3. **Be Specific**
   - ❌ "Update your information"
   - ✅ "Update your phone number and address"

4. **Avoid Jargon**
   - ❌ "Profile visibility settings"
   - ✅ "Who can see your information"

5. **Give Examples**
   - Instead of just label, show: "Budget (example: $2,000 per month)"

6. **Use "You" Language**
   - ❌ "Providers can view requests"
   - ✅ "You can view families who need help"

7. **Break Up Text**
   - Use short paragraphs
   - Use bullet points
   - Add white space

8. **Explain Benefits**
   - ❌ "Create profile"
   - ✅ "Create profile to connect with caregivers"

---

## 11. IMPLEMENTATION PRIORITY

### Phase 1: Critical Terminology (Week 1)
- [ ] Replace "Consultation Request" with "Message" or "Connection"
- [ ] Standardize "Hiring/Employment" to one term
- [ ] Fix "Browse Care Requests" to "Find Families"
- [ ] Simplify request status badges

### Phase 2: Form Improvements (Week 2)
- [ ] Improve all form field labels
- [ ] Add helpful placeholder text
- [ ] Add contextual help text
- [ ] Add required field explanation

### Phase 3: Button & CTA Clarity (Week 3)
- [ ] Update all button labels to be action-oriented
- [ ] Improve empty state messages
- [ ] Fix contact lock messaging

### Phase 4: Paywall & Advanced Features (Week 4)
- [ ] Rewrite paywall modal
- [ ] Simplify feature descriptions
- [ ] Add help text to complex features

---

## 12. TESTING RECOMMENDATIONS

### Usability Testing with 65+ Users:
1. **Task 1:** "Find a caregiver in your city"
   - Watch for confusion with "Provider" vs "Caregiver"

2. **Task 2:** "Send a message to a care facility"
   - Watch for confusion with "Consultation Request"

3. **Task 3:** "Check if someone replied to your message"
   - Watch for confusion with status system

4. **Task 4:** "Fill out your care profile"
   - Watch for confusion with form labels

5. **Task 5:** "Understand what the $25/month gets you"
   - Watch for confusion with paywall messaging

### Key Metrics:
- Time to complete tasks
- Number of errors
- Number of times users say "I don't understand what this means"
- User confidence ratings after each task

---

## 13. ACCESSIBILITY NOTES

Beyond language, consider:
- ✅ Color contrast ratios (ensure WCAG AA compliance)
- ✅ Font size minimums (16px+)
- ✅ Touch target sizes (44x44px minimum)
- ✅ Form field labels properly associated
- ⚠️ Consider adding "large text mode" toggle
- ⚠️ Consider adding "simplified view" option
- ⚠️ Test with screen readers for vision-impaired users

---

## CONCLUSION

The Olera platform has a solid foundation, but many terms and labels are written from a tech/healthcare industry perspective rather than from the user's perspective. Older adults (65+) benefit most from:

1. **Plain language** over industry jargon
2. **Specific labels** over generic ones
3. **Examples and context** over minimal labels
4. **Action-oriented** language over passive descriptions
5. **Explanations** of what will happen, not just what to do

**Estimated Impact of Changes:**
- 🔴 High Priority changes: 60% reduction in user confusion
- 🟡 Medium Priority changes: 25% improvement in task completion speed
- 🟢 Low Priority changes: 15% increase in user confidence

**Total estimated effort:** 3-4 weeks for complete implementation and testing.

---

## APPENDIX: QUICK REFERENCE - TERMINOLOGY CHANGES

| Current | Replace With | Reason |
|---------|-------------|---------|
| Consultation Request | Message / Connection | Too formal |
| Browse Care Requests | Find Families | User-centric |
| Provider | Caregiver / Care Service | More specific |
| Care Types Needed | What help do you need? | Plain language |
| Service Radius | How far will you travel? | Conversational |
| Timeline | When do you need help? | Direct question |
| Profile Visibility | Who can see your info? | Clear |
| Request Sent | Waiting for reply | Status-focused |
| Request Received - Pending | Needs your response | Action-oriented |
| Licensed Provider | Licensed & Certified | More credible |
| Capacity | How many you can help | Plain language |
| Send Request | Send Message | Familiar |
| View Details | Read Message | Specific |
| Save Provider | Save for Later | Clear action |

---

**End of Audit**
