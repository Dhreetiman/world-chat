# 🔧 World Chat - Backend

The backend server for World Chat, a real-time anonymous chat application built with Node.js, Express, Socket.io, and PostgreSQL.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **TypeScript** | Type-safe development |
| **Express.js 5** | Web framework |
| **Socket.io 4.8** | Real-time WebSocket communication |
| **PostgreSQL** | Primary database |
| **Prisma ORM** | Database toolkit and ORM |
| **AWS S3** | Image file storage |
| **Redis** | Online user tracking (optional) |
| **node-cron** | Scheduled jobs |

---

## 📁 Project Structure

```
Backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── config/            # Configuration files
│   │   ├── db.ts          # Prisma client setup
│   │   └── s3.ts          # AWS S3 configuration
│   ├── modules/           # Feature modules
│   │   ├── users/         # Guest user management
│   │   ├── messages/      # Message CRUD operations
│   │   ├── reactions/     # Emoji reactions
│   │   ├── uploads/       # File upload handling
│   │   ├── avatars/       # Avatar management
│   │   ├── settings/      # User settings
│   │   └── room/          # Room metadata
│   ├── socket/            # WebSocket handlers
│   │   ├── handlers.ts    # Event handlers
│   │   └── events.ts      # Event constants
│   ├── middlewares/       # Express middlewares
│   │   ├── rateLimit.ts   # Rate limiting
│   │   └── validateInput.ts # Input validation
│   ├── jobs/              # Scheduled tasks
│   │   └── cleanupJob.ts  # Message cleanup cron
│   ├── routes/            # REST API routes
│   ├── utils/             # Utility functions
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── .env.example           # Environment template
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- AWS S3 bucket
- Redis (optional)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   PORT=4000
   NODE_ENV=development
   DATABASE_URL="postgresql://user:password@localhost:5432/openworldchat"
   
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=ap-south-1
   AWS_S3_BUCKET_NAME=your-bucket-name
   
   REDIS_URL=redis://localhost:6379  # Optional
   CORS_ORIGIN=http://localhost:3000
   COOKIE_SECRET=your-super-secret-key
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

4. **Start the server**
   ```bash
   # Development with hot reload
   npm run dev
   
   # Production
   npm run build
   npm run start
   ```

The server will start on `http://localhost:4000`

---

## 📡 API Endpoints

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/messages` | Get recent messages |
| `GET` | `/api/room` | Get room metadata |
| `GET` | `/api/avatars` | Get available avatars |
| `POST` | `/api/upload` | Upload image to S3 |
| `GET` | `/api/settings/:guestId` | Get user settings |
| `PUT` | `/api/settings/:guestId` | Update user settings |

### WebSocket Events

#### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `JOIN_CHAT` | `{ guestId }` | User joins chat |
| `SET_USERNAME` | `{ guestId, username }` | Set username |
| `SEND_MESSAGE` | `{ content, imageUrl?, replyToMessageId? }` | Send message |
| `SEND_REACTION` | `{ messageId, emoji }` | Toggle reaction |

#### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `USERNAME_REQUIRED` | - | Prompt for username |
| `NEW_MESSAGE` | `Message` | New message broadcast |
| `MESSAGE_REACTION_UPDATED` | `{ messageId, reactions }` | Reaction update |
| `ONLINE_USERS_COUNT` | `{ count }` | Online users count |
| `ERROR` | `{ message }` | Error notification |

---

## 🗃️ Database Models

### GuestUser
```prisma
model GuestUser {
  id           String    @id @default(uuid())
  guestId      String    @unique
  username     String
  avatarId     Int       @default(1)
  userTitle    String    @default("common")
  lastActiveAt DateTime  @default(now())
  createdAt    DateTime  @default(now())
}
```

### Message
```prisma
model Message {
  id               String   @id @default(uuid())
  content          String?
  imageUrl         String?
  senderId         String
  senderName       String
  replyToMessageId String?
  reactions        Json     @default("{}")
  createdAt        DateTime @default(now())
}
```

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Start production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:push` | Push schema changes without migration |
| `npm run prisma:studio` | Open Prisma Studio GUI |

---

## 🔐 Security

- **Rate Limiting:** 100 requests per 15 minutes per IP
- **XSS Prevention:** All inputs sanitized with `xss` library
- **CORS:** Configurable allowed origins
- **Input Validation:** Custom middleware for request validation
- **File Upload Limits:** Max 5MB, only jpg/png/webp allowed

---

## 🧹 Scheduled Jobs

### Message Cleanup
- Runs every hour
- Deletes messages older than 24 hours
- Keeps database lightweight

---

## 📝 Notes

- Messages are ephemeral - automatically deleted after 24 hours
- No authentication system - guest-only approach
- Redis is optional but recommended for accurate online user tracking
