'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { SocketProvider, useSocket } from '@/contexts/SocketContext';
import Sidebar from '@/components/layout/Sidebar';
import ChatHeader from '@/components/layout/ChatHeader';
import MobileNav from '@/components/layout/MobileNav';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import JoinModal from '@/components/modals/JoinModal';
import AvatarSelectModal from '@/components/modals/AvatarSelectModal';
import SettingsPanel from '@/components/modals/SettingsPanel';
import { userApi, messagesApi, roomApi } from '@/lib/api';
import { Avatar } from '@/types';

function ChatApp() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(1);

  const { user, settings, isLoading, updateUsername, registerUser } = useUser();
  const {
    setMessages,
    setRoomInfo,
    setOnlineCount,
    setIsLoadingMessages,
    setHasMoreMessages,
    currentPage
  } = useChat();
  const { joinChat, setUsername, isConnected } = useSocket();

  const isDark = settings.theme === 'dark';

  // Load avatars
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const response = await userApi.getAvatars();
        if (response.data) {
          setAvatars(response.data);
        }
      } catch (error) {
        console.error('Failed to load avatars:', error);
        // Fallback avatars
        setAvatars([
          { id: 1, name: 'Avatar 1', url: '' },
          { id: 2, name: 'Avatar 2', url: '' },
          { id: 3, name: 'Avatar 3', url: '' },
          { id: 4, name: 'Avatar 4', url: '' },
          { id: 5, name: 'Avatar 5', url: '' },
          { id: 6, name: 'Avatar 6', url: '' },
        ]);
      }
    };
    loadAvatars();
  }, []);

  // Load initial messages
  const loadMessages = useCallback(async (page = 1) => {
    setIsLoadingMessages(true);
    try {
      const response = await messagesApi.getMessages(page, 50);
      if (response.data) {
        if (page === 1) {
          setMessages(response.data.reverse());
        } else {
          setMessages(prev => [...response.data.reverse(), ...prev]);
        }
        setHasMoreMessages(response.pagination.page < response.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [setMessages, setIsLoadingMessages, setHasMoreMessages]);

  // Load room info
  useEffect(() => {
    const loadRoomInfo = async () => {
      try {
        const response = await roomApi.getMetadata();
        if (response.data) {
          setRoomInfo(response.data);
          setOnlineCount(response.data.onlineCount);
        }
      } catch (error) {
        console.error('Failed to load room info:', error);
      }
    };
    loadRoomInfo();
  }, [setRoomInfo, setOnlineCount]);

  // Load messages on page change
  useEffect(() => {
    loadMessages(currentPage);
  }, [currentPage, loadMessages]);

  // Join chat when connected
  useEffect(() => {
    if (isConnected && user) {
      joinChat();
    }
  }, [isConnected, user, joinChat]);

  // Register user on first load
  useEffect(() => {
    if (!isLoading && !user) {
      registerUser().catch(console.error);
    }
  }, [isLoading, user, registerUser]);

  // Update selected avatar when user changes
  useEffect(() => {
    if (user) {
      setSelectedAvatarId(user.avatarId);
    }
  }, [user]);

  const handleUsernameSubmit = async (username: string, avatarId: number) => {
    await updateUsername(username, avatarId);
    setUsername(username, avatarId);
  };

  if (isLoading) {
    return (
      <div className={`h-screen flex items-center justify-center ${isDark ? 'bg-[#0c1524]' : 'bg-slate-50'
        }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#13a4ec] border-t-transparent animate-spin" />
          <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Connecting to chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-hidden ${isDark ? 'bg-[#0c1524] text-white' : 'bg-slate-50 text-slate-900'
      }`}>
      <div className="relative flex h-full w-full overflow-hidden">
        {/* Sidebar - Desktop */}
        <Sidebar onSettingsClick={() => setSettingsOpen(true)} />

        {/* Mobile Nav */}
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          onSettingsClick={() => setSettingsOpen(true)}
        />

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative h-full">
          <ChatHeader
            onMenuClick={() => setMobileNavOpen(true)}
          />

          <MessageList />

          <MessageInput
            onUsernameClick={() => setJoinModalOpen(true)}
          />
        </main>
      </div>

      {/* Modals */}
      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onAvatarClick={() => {
          setJoinModalOpen(false);
          setAvatarModalOpen(true);
        }}
        avatars={avatars}
        selectedAvatarId={selectedAvatarId}
        onSubmit={handleUsernameSubmit}
      />

      <AvatarSelectModal
        isOpen={avatarModalOpen}
        onClose={() => {
          setAvatarModalOpen(false);
          setJoinModalOpen(false);
        }}
        onBack={() => {
          setAvatarModalOpen(false);
          setJoinModalOpen(true);
        }}
        avatars={avatars}
        selectedAvatarId={selectedAvatarId}
        onSelect={setSelectedAvatarId}
      />

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

// Wrap with providers
export default function Home() {
  return (
    <UserProvider>
      <ChatProvider>
        <SocketProvider>
          <ChatApp />
        </SocketProvider>
      </ChatProvider>
    </UserProvider>
  );
}
