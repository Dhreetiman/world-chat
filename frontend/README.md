# 🎨 World Chat - Frontend

A modern, responsive chat interface built with Next.js 16, React 19, and TailwindCSS 4. Features real-time messaging, emoji reactions, and theme switching.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type-safe development |
| **TailwindCSS 4** | Utility-first CSS framework |
| **Socket.io Client** | Real-time communication |
| **Day.js** | Date/time formatting |
| **emoji-picker-react** | Emoji picker component |

---

## 📁 Project Structure

```
frontend/
├── public/                # Static assets
│   └── avatars/           # Pre-built avatar images
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── page.tsx       # Home page (chat interface)
│   │   ├── layout.tsx     # Root layout with providers
│   │   └── globals.css    # Global styles
│   ├── components/
│   │   ├── chat/          # Chat-related components
│   │   │   ├── ChatArea.tsx
│   │   │   ├── Message.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── ReplyPreview.tsx
│   │   ├── layout/        # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── modals/        # Modal dialogs
│   │       ├── UsernameModal.tsx
│   │       ├── AvatarModal.tsx
│   │       └── SettingsModal.tsx
│   ├── contexts/          # React Context providers
│   │   ├── SocketContext.tsx   # WebSocket connection
│   │   ├── UserContext.tsx     # User state management
│   │   └── ThemeContext.tsx    # Theme switching
│   ├── lib/               # Utilities and hooks
│   │   └── hooks/         # Custom React hooks
│   └── types/             # TypeScript interfaces
│       └── index.ts       # Shared type definitions
├── .env                   # Environment variables
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # TailwindCSS configuration
├── postcss.config.mjs     # PostCSS configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Backend server running (see Backend README)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # Create .env file
   echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features

### Core Functionality
- **Real-time messaging** - Messages appear instantly via WebSocket
- **Guest system** - No login required, just pick a username
- **Message replies** - Quote and reply to specific messages
- **Emoji reactions** - React to messages with emojis
- **Image sharing** - Upload and share images in chat

### User Experience
- **Dark/Light theme** - Toggle between themes
- **Customizable avatars** - Choose from 10 unique avatars
- **User titles** - Display badges like "VIP", "Pro Gamer", etc.
- **Online user count** - See active users in real-time
- **Responsive design** - Works on desktop and mobile

### Chat Features
- **Auto-scroll** - Automatically scroll to new messages
- **Emoji picker** - Built-in emoji picker for messages
- **Reply preview** - See context when replying to messages
- **Timestamp formatting** - Human-readable timestamps

---

## 🎨 Component Overview

### Core Components

| Component | Location | Description |
|-----------|----------|-------------|
| `ChatArea` | `components/chat/` | Main chat message container |
| `Message` | `components/chat/` | Individual message component |
| `MessageInput` | `components/chat/` | Message input with emoji picker |
| `Header` | `components/layout/` | App header with user info |
| `Sidebar` | `components/layout/` | Online users and room info |

### Contexts

| Context | Purpose |
|---------|---------|
| `SocketContext` | Manages WebSocket connection and events |
| `UserContext` | Stores guest user info and settings |
| `ThemeContext` | Handles dark/light theme preference |

---

## 📡 Socket Events

The frontend listens to and emits the following events:

### Outgoing (Client → Server)
```typescript
socket.emit('JOIN_CHAT', { guestId });
socket.emit('SET_USERNAME', { guestId, username });
socket.emit('SEND_MESSAGE', { content, imageUrl?, replyToMessageId? });
socket.emit('SEND_REACTION', { messageId, emoji });
```

### Incoming (Server → Client)
```typescript
socket.on('NEW_MESSAGE', (message) => { ... });
socket.on('MESSAGE_REACTION_UPDATED', ({ messageId, reactions }) => { ... });
socket.on('ONLINE_USERS_COUNT', ({ count }) => { ... });
socket.on('USERNAME_REQUIRED', () => { ... });
socket.on('ERROR', ({ message }) => { ... });
```

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code linting |

---

## 🎨 Styling

This project uses **TailwindCSS 4** for styling. Key features:

- **Dark mode support** - Built-in dark mode classes
- **Responsive design** - Mobile-first approach
- **Custom animations** - Smooth transitions and effects
- **Modern UI** - Glassmorphism, gradients, and shadows

### Theme Colors
The app uses a dark/light theme system managed by `ThemeContext`:

- **Dark theme** - Dark backgrounds with light text
- **Light theme** - Light backgrounds with dark text

---

## 📱 Responsive Design

The interface is fully responsive:

- **Desktop** - Full sidebar visibility with chat area
- **Tablet** - Collapsible sidebar
- **Mobile** - Hidden sidebar with toggle button

---

## 🔒 Security

- User inputs are sent to backend for sanitization
- No sensitive data stored in localStorage
- Guest IDs are managed via httpOnly cookies (set by backend)

---

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

---

## 🤝 Related

- [Backend Documentation](../Backend/README.md)
- [Main Project README](../README.md)
