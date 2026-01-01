'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message, RoomInfo, Avatar } from '@/types';

interface ChatContextType {
    messages: Message[];
    roomInfo: RoomInfo | null;
    onlineCount: number;
    replyingTo: Message | null;
    isLoadingMessages: boolean;
    hasMoreMessages: boolean;
    currentPage: number;
    avatars: Avatar[];
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
    addMessage: (message: Message) => void;
    updateMessageReactions: (messageId: string, reactions: Record<string, string[]>) => void;
    setReplyingTo: (message: Message | null) => void;
    setRoomInfo: (info: RoomInfo | null) => void;
    setOnlineCount: (count: number) => void;
    setIsLoadingMessages: (loading: boolean) => void;
    setHasMoreMessages: (hasMore: boolean) => void;
    setCurrentPage: (page: number) => void;
    loadMoreMessages: () => void;
    setAvatars: (avatars: Avatar[]) => void;
    getAvatarUrl: (avatarId: number) => string | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [onlineCount, setOnlineCount] = useState(0);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [avatars, setAvatars] = useState<Avatar[]>([]);

    const addMessage = useCallback((message: Message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const updateMessageReactions = useCallback((messageId: string, reactions: Record<string, string[]>) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === messageId ? { ...msg, reactions } : msg
            )
        );
    }, []);

    const loadMoreMessages = useCallback(() => {
        setCurrentPage(prev => prev + 1);
    }, []);

    const getAvatarUrl = useCallback((avatarId: number) => {
        const avatar = avatars.find(a => a.id === avatarId);
        return avatar?.url;
    }, [avatars]);

    return (
        <ChatContext.Provider
            value={{
                messages,
                roomInfo,
                onlineCount,
                replyingTo,
                isLoadingMessages,
                hasMoreMessages,
                currentPage,
                avatars,
                setMessages,
                addMessage,
                updateMessageReactions,
                setReplyingTo,
                setRoomInfo,
                setOnlineCount,
                setIsLoadingMessages,
                setHasMoreMessages,
                setCurrentPage,
                loadMoreMessages,
                setAvatars,
                getAvatarUrl,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
