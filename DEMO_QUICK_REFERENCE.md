# 🎯 Olera Demo - Quick Reference Card

## 📋 Demo Credentials

| User Type | Email | Password | Purpose |
|-----------|-------|----------|---------|
| **Family** | sarah.miller@example.com | demo123 | Active conversation + tour |
| **Family** | michael.chen@example.com | demo123 | Accepted request |
| **Provider** | admin@sunshineseniorcare.com | demo123 | Home care provider |
| **Provider** | director@goldenyears.com | demo123 | Assisted living |

---

## 🎬 30-Minute Demo Flow

### 1. Landing & Search (3 min)
- Show homepage → Search providers → Filter by care type/location
- Open provider profile (Sunshine Senior Care)

### 2. Family Journey (10 min)
- **Login:** sarah.miller@example.com
- **Dashboard:** View stats and recent activity
- **Messages:** Open conversation with Sunshine
  - Show typing indicators, read receipts
  - View message history
- **Tour:** Show proposed tour appointment
- **Video Call:** Generate Jitsi link

### 3. Provider Journey (10 min)
- **Login:** admin@sunshineseniorcare.com
- **Dashboard:** View new requests and stats
- **Browse Families:** Filter and view care profiles
- **Messages:** Respond to Sarah's inquiry
- **Schedule Tour:** Propose appointment

### 4. Profile Management (5 min)
- Edit provider profile
- Show comprehensive sections
- Save and preview

### 5. Q&A (2 min)

---

## ✨ Key Features to Demo

### Must-Show Features
- ✅ Real-time messaging with typing indicators
- ✅ Read receipts and message status
- ✅ Tour scheduling system
- ✅ Video call integration (Jitsi)
- ✅ Dashboard with stats
- ✅ Comprehensive provider profiles
- ✅ Advanced search and filters

### Nice-to-Have (if time)
- Settings page
- Saved providers
- Profile completeness indicator
- Terms/Privacy pages

---

## 🔍 Pre-Demo Checklist

**5 Minutes Before:**
- [ ] Run `npx prisma db seed` to ensure data
- [ ] Test login with sarah.miller@example.com / demo123
- [ ] Verify conversation exists with messages
- [ ] Check dashboard stats load
- [ ] Clear browser cache
- [ ] Close unnecessary tabs
- [ ] Have backup browser ready

---

## 💡 Demo Tips

### DO:
- Walk through as a story (Sarah's journey)
- Highlight real-time features (typing indicators)
- Show mobile responsiveness
- Emphasize trust & safety features

### DON'T:
- Skip the search/discovery flow
- Rush through the messaging demo
- Forget to show provider perspective
- Ignore questions for later

---

## 🚨 Emergency Fixes

**Login fails:** Password is `demo123` (all lowercase)

**No messages:** Refresh page, check seed data ran

**Dashboard empty:** Re-run seed: `npx prisma db seed`

**Can't find conversation:** Go to Dashboard → Messages → Click on request

---

## 🎤 Opening Line
> "Olera connects families seeking senior care with trusted providers. Let me show you how Sarah, whose mother needs Alzheimer's care, finds and connects with caregivers."

## 🎤 Closing Line
> "That's the complete journey—from discovery to scheduling a tour—all in one platform. Questions?"

---

**Time Budget:**
- Intro: 1 min
- Family: 12 min
- Provider: 10 min
- Profile: 3 min
- Wrap-up: 4 min
- **Total: 30 min**
