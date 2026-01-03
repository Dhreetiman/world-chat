<p align="center">
  <h1 align="center">🌍 World Chat</h1>
  <p align="center">
    <strong>A real-time, anonymous global chat platform where everyone is welcome.</strong>
  </p>
  <p align="center">
    No login. No registration. Just pick a name and start chatting with the world.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20+-339933?style=flat&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Socket.io-4.8-010101?style=flat&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License" />
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🚀 **No Registration Required** | Jump right into conversations without any signup process |
| 💬 **Real-Time Messaging** | Instant message delivery powered by Socket.io |
| 😀 **Emoji Reactions** | React to messages with emojis |
| ↩️ **Reply to Messages** | Quote and reply to specific messages in the chat |
| 🖼️ **Image Sharing** | Upload and share images via AWS S3 |
| 👥 **Live User Count** | See how many people are online in real-time |
| 🎨 **Customizable Avatars** | Choose from 10 pre-built avatars |
| 🌙 **Dark/Light Theme** | Switch between themes for comfortable viewing |
| 🧹 **Auto-Cleanup** | Messages are automatically cleaned up after 24 hours for privacy |
| 🔒 **XSS Protection** | Built-in sanitization to prevent malicious content |

---

## 🏗️ Architecture

```
world-chat/
├── Backend/              # Node.js + Express + Socket.io API server
│   ├── src/
│   │   ├── config/       # Database, S3, and app configuration
│   │   ├── modules/      # Feature modules (users, messages, uploads, etc.)
│   │   ├── socket/       # WebSocket event handlers
│   │   ├── middlewares/  # Express middlewares
│   │   ├── jobs/         # Cron jobs (message cleanup)
│   │   └── routes/       # REST API routes
│   └── prisma/           # Database schema and migrations
│
└── frontend/             # Next.js 16 + React 19 client application
    └── src/
        ├── app/          # Next.js app router pages
        ├── components/   # React components
        ├── contexts/     # React contexts (Socket, User, Theme)
        ├── lib/          # Utility functions and hooks
        └── types/        # TypeScript type definitions
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js 5
- **Real-Time:** Socket.io 4.8
- **Database:** PostgreSQL with Prisma ORM
- **File Storage:** AWS S3
- **Caching (Optional):** Redis (ioredis)
- **Security:** XSS sanitization, Rate limiting, CORS

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** TailwindCSS 4
- **Real-Time Client:** Socket.io Client
- **Date/Time:** Day.js
- **Emoji Picker:** emoji-picker-react

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- PostgreSQL 14+
- AWS S3 bucket (for image uploads)
- Redis (optional, for online user tracking)

### 1. Clone the repository
```bash
git clone https://github.com/Dhreetiman/world-chat.git
cd world-chat
```

### 2. Backend Setup
```bash
cd Backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your credentials:
# - DATABASE_URL (PostgreSQL connection string)
# - AWS credentials (for S3 image uploads)
# - REDIS_URL (optional)

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend will start on `http://localhost:4000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend (`Backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 4000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `AWS_REGION` | AWS region (e.g., ap-south-1) | Yes |
| `AWS_S3_BUCKET_NAME` | S3 bucket name for uploads | Yes |
| `REDIS_URL` | Redis connection URL | No |
| `CORS_ORIGIN` | Allowed CORS origin | No |
| `COOKIE_SECRET` | Secret for cookie signing | Yes |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

---

## 📡 WebSocket Events

### Client → Server
| Event | Description |
|-------|-------------|
| `JOIN_CHAT` | User joins the global chat room |
| `SET_USERNAME` | User sets/updates their username |
| `SEND_MESSAGE` | Send a new message |
| `SEND_REACTION` | Add/remove emoji reaction to a message |
| `DISCONNECT` | User leaves the chat |

### Server → Client
| Event | Description |
|-------|-------------|
| `USERNAME_REQUIRED` | Prompt user to set username |
| `NEW_MESSAGE` | New message broadcast |
| `MESSAGE_REACTION_UPDATED` | Reaction count updated |
| `ONLINE_USERS_COUNT` | Live online user count |
| `ERROR` | Error notification |

---

## 🔐 Security Features

- **XSS Protection:** All user inputs are sanitized using the `xss` library
- **Rate Limiting:** Prevents spam and abuse with express-rate-limit
- **CORS Configuration:** Restricts cross-origin requests
- **No Sensitive Data Storage:** Guest-only system with minimal data retention
- **Auto Message Cleanup:** Messages are deleted after 24 hours

---

## 📦 Available Scripts

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:studio # Open Prisma Studio GUI
npm run prisma:migrate # Run database migrations
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## 🗃️ Database Schema

The application uses the following Prisma models:

- **GuestUser** - Anonymous users with UUID, username, avatar, and title
- **Message** - Chat messages with reactions and reply support
- **UserSettings** - Theme and notification preferences
- **RoomMetadata** - Global chat room information
- **Avatar** - Pre-stored avatar images

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Dhreetiman Prasad**

---

<p align="center">
  Made with ❤️ for the world to chat freely
</p>