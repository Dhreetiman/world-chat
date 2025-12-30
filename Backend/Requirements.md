
---

```md
# 🌍 Open World Chat – Backend Requirements & Specification

## 📌 Overview
**Open World Chat** is a real-time web chat application where users can join instantly **without login or registration**.  
A user becomes active only when they send their **first message**, at which point the system asks them to choose a **username**.

---

## 🎯 Core Features
- No login / no signup
- Guest-based chat system
- Username prompt on first message
- Real-time global chat room
- Online users count (live)
- Message reactions (emoji)
- Reply to specific messages
- Image sharing via AWS S3
- Temporary message storage (ephemeral chat)

---

## 🛠 Tech Stack
- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Prisma ORM**
- **Socket.io (WebSockets)**
- **AWS S3** (image uploads)
- **Redis (optional but recommended)** for online users
- **UUID** for guest identification
- **dotenv** for environment variables

---

## 🗂 Project Structure
```

src/
├─ config/
│   ├─ db.ts
│   ├─ socket.ts
│   └─ s3.ts
├─ modules/
│   ├─ users/
│   ├─ messages/
│   ├─ reactions/
│   └─ uploads/
├─ routes/
├─ middlewares/
├─ utils/
├─ jobs/
├─ app.ts
└─ server.ts

prisma/
└─ schema.prisma

```

---

## 👤 Guest User System
- On first visit, generate a **guestId (UUID)**
- Store guestId in:
  - socket session
  - httpOnly cookie
- Default username format:
```

Guest_XXXX

````
- User can change username anytime
- Username required **before first message**
- If user tries to send a message without username → block & prompt

---

## 🧠 User Flow
1. User opens app
2. Socket connection established
3. GuestId assigned
4. User joins chat silently
5. When sending first message:
 - Show username modal
6. Username saved
7. Message is sent
8. User appears as online

---

## 💬 Messaging System
### Message Capabilities
- Text messages
- Image messages
- Reply to a specific message
- Emoji reactions

### Message Fields
- id (UUID)
- content (text)
- imageUrl (nullable)
- senderId (guestId)
- senderName
- replyToMessageId (nullable)
- reactions (JSONB)
- createdAt

---

## 😀 Reactions
- Emoji-based reactions
- Toggle reaction (add/remove)
- One user can react once per emoji

### Reaction Structure (JSONB)
```json
{
"🔥": ["guestId1", "guestId2"],
"❤️": ["guestId3"]
}
````

---

## ↩️ Reply System

* Messages can reply to another message
* Store `replyToMessageId`
* Frontend renders quoted message
* Backend validates parent message existence

---

## 🖼 Image Upload

* Images uploaded via REST API
* Stored in **AWS S3**
* Public URL saved in message
* Allowed formats:

  * jpg
  * png
  * webp
* Max size: **5MB**

---

## 👥 Online Users Count

* Track active users via socket connections
* Emit real-time count on:

  * User join
  * User disconnect
* Avoid duplicate count on refresh
* Redis recommended for accuracy

---

## 🔌 WebSocket Events

### Client → Server

* `JOIN_CHAT`
* `SET_USERNAME`
* `SEND_MESSAGE`
* `SEND_REACTION`
* `DISCONNECT`

### Server → Client

* `USERNAME_REQUIRED`
* `NEW_MESSAGE`
* `MESSAGE_REACTION_UPDATED`
* `ONLINE_USERS_COUNT`
* `ERROR`

---

## 🧾 Database Design (PostgreSQL)

### GuestUser

* id (UUID)
* guestId (unique)
* username
* lastActiveAt

### Message

* id (UUID)
* content
* imageUrl
* senderId
* senderName
* replyToMessageId
* reactions (JSONB)
* createdAt

---

## 🧹 Message Retention

* Messages are **not permanent**
* Auto-delete messages older than **24 hours**
* Cron job runs every hour
* Keeps database lightweight

---

## 🔐 Security & Validation

* Rate limit per guest
* Sanitize text input
* Prevent XSS
* Validate image type & size
* Enable CORS safely
* No sensitive data stored

---

## ⚙️ Environment Variables

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/openworldchat
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
REDIS_URL=
```

---

## 📦 Deliverables

* Prisma schema
* Express server setup
* Socket.io real-time handlers
* Guest user management
* Message + reaction logic
* AWS S3 upload service
* Online user tracking
* Cleanup cron job
* Fully commented production-ready code

---

## 🚀 Non-Goals

* No authentication system
* No private chats
* No message history persistence beyond retention window
* No user profiles

---

## ✅ Summary

Open World Chat is a frictionless, anonymous, real-time chat platform focused on:

* Instant access
* Live interaction
* Minimal persistence
* Clean & scalable backend architecture

```

---

