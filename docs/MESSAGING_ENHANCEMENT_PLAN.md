# Request Detail & Messaging Enhancement Plan
## Modern Messaging Experience (WhatsApp/iMessage Inspired)

**Current State Analysis:**
- ✅ Basic text messaging working
- ✅ Status management (PENDING, ACCEPTED, DECLINED, COMPLETED)
- ✅ Contact info masking/unmasking
- ✅ Auto-scroll to bottom
- ⚠️ Simple UI, lacks polish
- ❌ No file attachments
- ❌ No typing indicators
- ❌ No read receipts
- ❌ No quick replies
- ❌ No tour scheduling
- ❌ No rich features

**Goal:** Transform basic messaging into a professional, feature-rich communication hub that builds trust and drives conversions.

---

## 🎯 SPRINT PLAN (10 Sprints)

### **Sprint 1: Modern Message UI & Visual Polish** 🎨
**Goal:** Upgrade to a beautiful, modern messaging interface

**Components to Create:**
- `ModernMessageBubble.tsx` - WhatsApp/iMessage style bubbles
- `MessageTimestamp.tsx` - Smart timestamp grouping (Today, Yesterday, dates)
- `MessageAvatar.tsx` - User avatars for messages

**Features:**
- Modern chat bubble design with proper spacing
- Sender avatars on the left
- Message grouping by sender (no repeated avatars)
- Smart timestamps (group by day, show "Today", "Yesterday")
- Smooth animations for new messages
- Better color contrast and readability
- Improved mobile responsiveness
- Rounded corners and shadows for depth

**Database:** No changes needed

**UI Improvements:**
- Replace simple divs with styled message components
- Add subtle animations (fade in, slide up)
- Better spacing and typography
- Sticky date headers

---

### **Sprint 2: Typing Indicators & Real-Time Presence** ⌨️
**Goal:** Show when the other person is typing (like WhatsApp)

**Components to Create:**
- `TypingIndicator.tsx` - Animated "..." indicator
- `OnlineStatus.tsx` - Show if user is online

**Features:**
- Real-time typing indicator (animated dots)
- "Online"/"Offline"/"Last seen" status
- Broadcast typing events via API
- Clear typing state after inactivity (3 seconds)
- Show typing indicator below messages
- Presence detection (active tab, focus state)

**Database Changes:**
```prisma
model ConsultRequest {
  // ... existing fields
  lastTypingActivity Json? // { userId: string, timestamp: Date }
  lastSeenActivity   Json? // { userId: string, timestamp: Date }
}
```

**API Updates:**
- `POST /api/requests/[id]/typing` - Broadcast typing status
- `GET /api/requests/[id]/presence` - Get online status

**Technical:**
- Polling every 2 seconds for typing/presence updates
- OR use WebSocket for real-time (optional enhancement)

---

### **Sprint 3: Read Receipts & Message Status** ✓✓
**Goal:** Show when messages are delivered and read

**Components to Create:**
- `MessageStatusIndicator.tsx` - Check marks (sent, delivered, read)

**Features:**
- Single check: Sent ✓
- Double check: Delivered ✓✓
- Blue double check: Read ✓✓ (blue)
- Track message status per message
- Batch update read status when conversation viewed
- Show read receipts only for sender

**Database Changes:**
```prisma
model Message {
  id         String   @id @default(cuid())
  // ... existing fields
  status     String   @default("SENT") // SENT, DELIVERED, READ
  deliveredAt DateTime?
  readAt      DateTime?
}
```

**API Updates:**
- `PATCH /api/requests/[id]/messages/read` - Mark messages as read
- Auto-mark as read when user views conversation

---

### **Sprint 4: File Attachments & Media Sharing** 📎
**Goal:** Share images, PDFs, and documents in chat

**Components to Create:**
- `FileAttachment.tsx` - File upload button and preview
- `AttachmentPreview.tsx` - Show attached files in messages
- `AttachmentGallery.tsx` - Lightbox for images

**Features:**
- Upload images, PDFs, documents
- Drag-and-drop file upload
- Image previews in chat (thumbnail + full view)
- PDF preview with download button
- File size limits (10MB per file)
- Multiple file attachments per message
- Image lightbox/gallery view
- Download attachments

**Database Changes:**
```prisma
model Message {
  id          String   @id @default(cuid())
  // ... existing fields
  attachments Json[]   @default([]) // [{url: string, type: string, name: string, size: number}]
}
```

**API Updates:**
- Use existing `/api/upload/images` endpoint
- Store attachment metadata in message

---

### **Sprint 5: Quick Replies & Message Templates** 💬
**Goal:** Speed up common responses with pre-written templates

**Components to Create:**
- `QuickRepliesBar.tsx` - Quick reply chips
- `MessageTemplates.tsx` - Template selector modal

**Features:**
- Pre-written quick replies (Yes, No Thanks, Tell me more, etc.)
- Provider-specific templates:
  - "Would you like to schedule a tour?"
  - "Our availability is..."
  - "Here's our pricing information..."
- Family-specific templates:
  - "What are your visiting hours?"
  - "Do you accept Medicare/Medicaid?"
  - "Can I schedule a tour?"
- Click to insert template into message input
- Customizable templates (save your own)
- Template categories

**Database Changes:**
```prisma
model MessageTemplate {
  id      String  @id @default(cuid())
  userId  String
  title   String
  content String
  category String? // "greeting", "scheduling", "pricing", "custom"
  createdAt DateTime @default(now())
}
```

**UI:**
- Quick reply chips above message input
- Template picker modal with search
- Recently used templates

---

### **Sprint 6: Tour Scheduling Integration** 📅
**Goal:** Schedule facility tours directly from chat

**Components to Create:**
- `TourScheduler.tsx` - In-chat calendar picker
- `TourProposal.tsx` - Proposed tour times
- `TourConfirmation.tsx` - Confirmed tour details

**Features:**
- Provider can propose tour times
- Family can accept/decline/propose alternative
- Visual tour proposal cards in chat
- Calendar integration (add to Google/Apple Calendar)
- Automatic tour reminder notifications
- Show upcoming tours in conversation header
- Reschedule/cancel tours

**Database Changes:**
```prisma
model TourAppointment {
  id          String   @id @default(cuid())
  requestId   String
  request     ConsultRequest @relation(fields: [requestId], references: [id])
  proposedBy  String   // userId who proposed
  proposedDate DateTime
  proposedTime String
  status      String   @default("PROPOSED") // PROPOSED, ACCEPTED, DECLINED, COMPLETED, CANCELLED
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**UI:**
- Special message type for tour proposals
- Interactive accept/decline buttons
- Calendar picker for scheduling
- Tour status badges

---

### **Sprint 7: Enhanced Rich Text & Formatting** ✨
**Goal:** Add basic text formatting and emoji support

**Components to Create:**
- `RichTextInput.tsx` - Text input with formatting toolbar
- `EmojiPicker.tsx` - Emoji selector
- `FormattedMessage.tsx` - Render formatted text

**Features:**
- Bold, italic formatting (Markdown-like syntax)
- Emoji picker with categories
- Auto-link URLs
- Mention @user (if multiple participants)
- Line breaks preserved
- Link previews (optional)
- Code formatting (for technical discussions)

**Technical:**
- Use simple Markdown or HTML subset
- Sanitize user input (prevent XSS)
- Emoji library (emoji-mart or similar)

**No Database Changes** - Store as formatted text

---

### **Sprint 8: Message Search & Conversation History** 🔍
**Goal:** Find specific messages in long conversations

**Components to Create:**
- `MessageSearch.tsx` - Search bar and results
- `SearchResultHighlight.tsx` - Highlight matches
- `ConversationExport.tsx` - Export chat history

**Features:**
- Search messages by keyword
- Highlight matches in yellow
- Jump to matched message
- Filter by date range
- Filter by sender
- Export conversation as PDF/text
- Message count and statistics

**UI:**
- Search bar in conversation header
- Smooth scroll to search results
- Search result counter (1 of 5 results)
- Previous/next navigation

**No Database Changes** - Client-side search for now

---

### **Sprint 9: Notification Preferences & Smart Alerts** 🔔
**Goal:** Control notification settings and smart delivery

**Components to Create:**
- `NotificationSettings.tsx` - Per-conversation settings
- `SmartNotificationBanner.tsx` - In-app notification

**Features:**
- Mute conversation (1 hour, 8 hours, 24 hours, forever)
- Email notification preferences
- SMS notification (optional)
- Push notifications (if PWA)
- Smart notifications:
  - Don't notify if user is actively viewing conversation
  - Bundle multiple messages
  - Urgent message flagging
- Notification preview in header
- Unread message counter

**Database Changes:**
```prisma
model ConsultRequest {
  // ... existing fields
  notificationSettings Json? // { muted: boolean, muteUntil: Date, emailNotifications: boolean }
}
```

**UI:**
- Mute icon in header
- Notification settings modal
- Unread badge count

---

### **Sprint 10: Polish, Performance & Video Call Integration** 🎥
**Goal:** Final polish and optional video calling

**Components to Create:**
- `VideoCallButton.tsx` - Initiate video call
- `VideoCallNotification.tsx` - Incoming call UI
- `MessageLoadingMore.tsx` - Lazy load old messages

**Features:**
- Performance optimizations:
  - Virtualized message list (react-window)
  - Lazy load message history (infinite scroll up)
  - Optimize re-renders
  - Image lazy loading
- Video call integration (optional):
  - One-click video call start
  - Integration with Zoom/Google Meet/Twilio
  - Generate meeting link and send in chat
- Advanced features:
  - Message reactions (❤️ 👍 😊)
  - Pin important messages
  - Archive conversations
  - Block user (safety)
- Accessibility:
  - Keyboard navigation
  - Screen reader support
  - ARIA labels
  - Focus management
- Mobile optimizations:
  - Touch-friendly tap targets
  - Swipe gestures (optional)
  - Better keyboard handling

**Documentation:**
- User guide for messaging features
- FAQ section
- Video tutorials

---

## 📊 IMPLEMENTATION SUMMARY

### Total Features Across 10 Sprints:
- ✅ Modern UI with WhatsApp/iMessage styling
- ✅ Typing indicators & online presence
- ✅ Read receipts (✓✓)
- ✅ File attachments (images, PDFs, docs)
- ✅ Quick replies & message templates
- ✅ Tour scheduling integration
- ✅ Rich text formatting & emojis
- ✅ Message search & export
- ✅ Notification preferences
- ✅ Video call integration
- ✅ Performance optimizations
- ✅ Accessibility improvements

### Database Changes:
- 3 new fields on `ConsultRequest`
- 3 new fields on `Message`
- 1 new model: `MessageTemplate`
- 1 new model: `TourAppointment`

### Components Created: ~20 new components

### API Endpoints:
- 4 new endpoints for typing, presence, read status, and tour scheduling

---

## 🎯 PRIORITIZATION

If time/scope is limited, prioritize:

**Must Have (Sprints 1-4):**
1. Modern UI (Sprint 1)
2. Typing Indicators (Sprint 2)
3. Read Receipts (Sprint 3)
4. File Attachments (Sprint 4)

**Should Have (Sprints 5-7):**
5. Quick Replies (Sprint 5)
6. Tour Scheduling (Sprint 6)
7. Rich Text (Sprint 7)

**Nice to Have (Sprints 8-10):**
8. Search (Sprint 8)
9. Notifications (Sprint 9)
10. Polish & Video (Sprint 10)

---

## 🚀 READY TO START

All sprints are designed to:
- Build incrementally on previous work
- Maintain backward compatibility
- Be production-ready at each step
- Include proper error handling
- Follow existing code patterns

Let me know when you're ready to begin with **Sprint 1: Modern Message UI & Visual Polish**!
