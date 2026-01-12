'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { SocketProvider, useSocket } from '@/contexts/SocketContext';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import SearchPanel from '@/components/chat/SearchPanel';

function ChatApp() {
  const { user, logout } = useAuth();
  const { onlineCount } = useSocket();
  const [showSearch, setShowSearch] = useState(false);
  const [activeNav, setActiveNav] = useState('chat');

  const handleMessageClick = (messageId: string) => {
    console.log('Jump to message:', messageId);
  };

  return (
    <div className="flex h-screen w-full bg-[#0B1121] text-slate-300 font-sans overflow-hidden selection:bg-[#06b6d4]/30 selection:text-white">
      {/* Icon Sidebar - 70px */}
      <aside className="w-[70px] flex flex-col items-center py-6 gap-4 border-r border-white/[0.08] bg-[#020617] z-30 shrink-0">
        {/* Logo */}
        <div className="size-10 flex items-center justify-center text-[#06b6d4] mb-2 shadow-glow rounded-xl bg-[#06b6d4]/10">
          <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Nav buttons */}
        <button
          onClick={() => setActiveNav('chat')}
          className={`size-10 rounded-lg flex items-center justify-center transition-all ${activeNav === 'chat'
              ? 'bg-[rgba(30,41,59,0.4)] text-[#06b6d4] border border-[#06b6d4]/20 shadow-glow-sm'
              : 'bg-transparent hover:bg-white/5 text-gray-500 hover:text-gray-200'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
        </button>

        <button
          onClick={() => setActiveNav('code')}
          className={`size-10 rounded-lg flex items-center justify-center transition-all ${activeNav === 'code'
              ? 'bg-[rgba(30,41,59,0.4)] text-[#06b6d4] border border-[#06b6d4]/20 shadow-glow-sm'
              : 'bg-transparent hover:bg-white/5 text-gray-500 hover:text-gray-200'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">code</span>
        </button>

        <button
          onClick={() => setActiveNav('files')}
          className={`size-10 rounded-lg flex items-center justify-center transition-all ${activeNav === 'files'
              ? 'bg-[rgba(30,41,59,0.4)] text-[#06b6d4] border border-[#06b6d4]/20 shadow-glow-sm'
              : 'bg-transparent hover:bg-white/5 text-gray-500 hover:text-gray-200'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">folder_open</span>
        </button>

        <button
          onClick={() => setActiveNav('settings')}
          className={`size-10 rounded-lg flex items-center justify-center transition-all ${activeNav === 'settings'
              ? 'bg-[rgba(30,41,59,0.4)] text-[#06b6d4] border border-[#06b6d4]/20 shadow-glow-sm'
              : 'bg-transparent hover:bg-white/5 text-gray-500 hover:text-gray-200'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User avatar at bottom */}
        <button
          onClick={logout}
          className="size-9 rounded-lg bg-cover bg-center border border-white/[0.08] hover:border-[#06b6d4]/50 transition-colors opacity-80 hover:opacity-100 flex items-center justify-center bg-gradient-to-br from-[#06b6d4] to-[#0284c7]"
          title="Logout"
        >
          <span className="text-white font-bold text-sm">
            {user?.username.charAt(0).toUpperCase()}
          </span>
        </button>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-[#0B1121] relative">
        {/* Radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#06b6d4]/10 via-transparent to-transparent pointer-events-none z-0" />

        {/* Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.08] bg-[#0B1121]/80 backdrop-blur-md z-20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-500 text-[20px]">tag</span>
            <div className="flex flex-col">
              <h2 className="text-gray-100 text-sm font-semibold tracking-wide flex items-center gap-2">
                global-dev
              </h2>
            </div>
            <div className="h-4 w-px bg-white/[0.08] mx-2" />
            <p className="text-xs text-gray-500">General discussion for all developers</p>
          </div>

          <div className="flex items-center gap-4">
            {/* LIVE indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06b6d4] shadow-[0_0_8px_2px_rgba(6,182,212,0.4)]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#06b6d4] uppercase tracking-widest">Live</span>
                <span className="text-[10px] text-gray-500 font-medium">·</span>
                <span className="text-[10px] text-gray-400 font-medium">{onlineCount.toLocaleString()} online</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center justify-center size-8 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-gray-300"
                title="Search"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
              </button>
              <button
                className="flex items-center justify-center size-8 rounded hover:bg-white/5 transition-colors text-gray-500 hover:text-gray-300"
                title="Notifications"
              >
                <span className="material-symbols-outlined text-[18px]">notifications</span>
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-2 scroll-smooth relative z-10">
          <MessageList />
        </div>

        {/* Input */}
        <MessageInput />
      </main>

      {/* Search Panel */}
      <SearchPanel
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onMessageClick={handleMessageClick}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <ChatProvider>
        <SocketProvider>
          <ChatApp />
        </SocketProvider>
      </ChatProvider>
    </ProtectedRoute>
  );
}
