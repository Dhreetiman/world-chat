
---

```md
# 🌍 Open World Chat – Frontend Requirements & Specification

## 📌 Overview
**Open World Chat (Frontend)** is a responsive, real-time web interface built using **Next.js** that allows users to instantly join a global chat without login.  
The UI prompts for a username only when the user sends their **first message**.

---

## 🛠 Tech Stack
- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Socket.io Client**
- **Axios / Fetch**
- **AWS S3 (via backend URLs)**
- **Responsive-first design**
- **Dark mode (default)**

---

## 📱 Responsive Design Goals
- Desktop (≥1024px)
- Tablet (768px – 1023px)
- Mobile (≤767px)
- Mobile-first layout
- Touch-friendly UI
- No horizontal scrolling
- Smooth animations & transitions

---

## 🧭 Application Pages & Layout

### Routes
```

/                → Global Chat Room

```

No auth routes required.

---

## 🧩 Layout Structure

### Desktop Layout
```

┌──────── Sidebar ────────┐┌──────── Chat Area ─────────┐
│ App Name                ││ Header (Room + Online)     │
│ Online Users Count      ││ Messages List              │
│ Global Chat (active)    ││ Message Input              │
│ Friends (disabled)     │└─────────────────────────────┘
│ Settings (disabled)    │
└────────────────────────┘

```

---

### Mobile Layout
```

┌──────── Header ────────┐
│ Open World Chat (Live) │
│ Online Users           │
└────────────────────────┘
│ Messages (Scrollable)  │
│                        │
└──────── Input ─────────┘

````

Sidebar collapses into a hamburger menu.

---

## 🖼 UI Components

### 1️⃣ Sidebar
- App logo & name
- Online users count (live)
- Navigation:
  - Global Chat (enabled)
  - Friends (disabled / coming soon)
  - Settings (disabled)
- Hidden on mobile (toggle)

---

### 2️⃣ Chat Header
- Room name: `Global Chat Room`
- Server status: `Live`
- Search input (UI only)
- Online users badge

---

### 3️⃣ Messages List
- Infinite vertical scroll
- Auto-scroll to latest message
- Message grouping by sender
- Timestamp visibility on hover / tap

---

### 4️⃣ Message Bubble
- Left-aligned for others
- Right-aligned for current user
- Avatar
- Username
- Message content
- Image preview (if any)
- Reaction button
- Reply button

---

### 5️⃣ Reply Preview
- Display quoted message above input
- Show sender + short message
- Cancel reply option

---

### 6️⃣ Emoji Reactions
- Click emoji icon on message
- Popup emoji selector
- Show reaction count
- Highlight user-selected reactions

---

### 7️⃣ Message Input Bar
- Text input
- Image upload button
- Emoji picker
- Send button
- Disabled until username is set

---

## 👤 Username Flow (Critical UX)

### Initial State
- User is treated as `Guest_XXXX`
- Can read messages
- Cannot send messages

### On First Message Attempt
- Show modal:
  - Avatar selector
  - Username input
  - Confirm button
- Block message sending until completed

---

## 🪟 Modals

### Join Conversation Modal
- Avatar preview
- Username input
- CTA: `Enter Chat`
- No login required
- Close disabled until username is valid

---

### Avatar Selection Modal
- Predefined avatars
- Optional image upload
- Avatar preview
- Confirm button

---

## 🖼 Image Upload UX
- Client-side validation:
  - Image only
  - Max 5MB
- Preview before sending
- Upload progress indicator
- Send as message after upload success

---

## 🔌 WebSocket Integration

### Socket Events (Frontend)

#### Emit
- `JOIN_CHAT`
- `SET_USERNAME`
- `SEND_MESSAGE`
- `SEND_REACTION`

#### Listen
- `USERNAME_REQUIRED`
- `NEW_MESSAGE`
- `MESSAGE_REACTION_UPDATED`
- `ONLINE_USERS_COUNT`
- `ERROR`

---

## 🧠 State Management
- Local React state + Context
- Suggested contexts:
  - SocketContext
  - UserContext
  - ChatContext

---

## 🎨 Styling Guidelines
- Tailwind CSS
- Dark theme as default
- Soft shadows
- Rounded corners
- Smooth hover & tap feedback
- Consistent spacing
- Accessible contrast ratios

---

## ♿ Accessibility
- Keyboard navigation
- Focus indicators
- ARIA labels
- Screen reader friendly
- Large touch targets on mobile

---

## ⚡ Performance
- Memoized message list
- Virtualized scrolling (optional)
- Debounced typing
- Lazy image loading
- Minimal re-renders

---

## 🔐 Security (Frontend)
- Escape message content
- Do not trust client input
- No secrets in frontend
- Validate uploads before send

---

## ⚙️ Environment Variables
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
````

---

## 🚫 Non-Goals

* No authentication UI
* No private chats
* No user profile page
* No persistent user accounts

---

## ✅ Success Criteria

* Instant chat access
* Mobile-friendly UX
* Smooth real-time updates
* No friction to join
* Clean, modern UI

---

## 🚀 Future Enhancements (Optional)

* PWA support
* Theme switcher
* Mentions (@username)
* Moderation tools
* Message pinning

---

## 📌 Summary

The frontend of **Open World Chat** focuses on:

* Zero-friction entry
* Real-time communication
* Mobile-first experience
* Clean, modern UI
* Scalability & performance

```

---

