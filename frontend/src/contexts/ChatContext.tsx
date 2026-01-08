'use client';

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode, RefObject } from 'react';
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
    updateMessage: (messageId: string, updates: Partial<Message>) => void;
    markMessageDeleted: (messageId: string) => void;
    setReplyingTo: (message: Message | null) => void;
    setRoomInfo: (info: RoomInfo | null) => void;
    setOnlineCount: (count: number) => void;
    setIsLoadingMessages: (loading: boolean) => void;
    setHasMoreMessages: (hasMore: boolean) => void;
    setCurrentPage: (page: number) => void;
    loadMoreMessages: () => void;
    setAvatars: (avatars: Avatar[]) => void;
    getAvatarUrl: (avatarId: number) => string | undefined;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    inputRef: RefObject<HTMLTextAreaElement | null>;
    focusInput: () => void;
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
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const focusInput = useCallback(() => {
        // Use setTimeout to ensure the DOM has updated before focusing
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    }, []);

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

    const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === messageId ? { ...msg, ...updates } : msg
            )
        );
    }, []);

    const markMessageDeleted = useCallback((messageId: string) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === messageId ? { ...msg, isDeleted: true, content: null } : msg
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
                updateMessage,
                markMessageDeleted,
                setReplyingTo,
                setRoomInfo,
                setOnlineCount,
                setIsLoadingMessages,
                setHasMoreMessages,
                setCurrentPage,
                loadMoreMessages,
                setAvatars,
                getAvatarUrl,
                searchQuery,
                setSearchQuery,
                inputRef,
                focusInput,
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
