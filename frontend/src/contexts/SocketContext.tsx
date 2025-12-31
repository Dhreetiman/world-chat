'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useUser } from './UserContext';
import { useChat } from './ChatContext';
import { Message, SendMessagePayload, SendReactionPayload } from '@/types';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinChat: () => void;
    setUsername: (username: string, avatarId: number) => void;
    sendMessage: (payload: SendMessagePayload) => void;
    sendReaction: (payload: SendReactionPayload) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, registerUser, refreshUser } = useUser();
    const { addMessage, updateMessageReactions, setOnlineCount } = useChat();

    // Initialize socket connection
    useEffect(() => {
        const s = getSocket();
        setSocket(s);

        const onConnect = () => {
            console.log('Socket connected');
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        };

        const onError = (error: { code: string; message: string }) => {
            console.error('Socket error:', error);
        };

        const onNewMessage = (message: Message) => {
            addMessage(message);
        };

        const onReactionUpdated = (data: { messageId: string; reactions: Record<string, string[]> }) => {
            updateMessageReactions(data.messageId, data.reactions);
        };

        const onOnlineCount = (data: { count: number }) => {
            setOnlineCount(data.count);
        };

        const onUsernameRequired = async () => {
            // Will be handled by the modal in the UI
            console.log('Username required');
        };

        const onUsernameSet = async () => {
            await refreshUser();
        };

        const onSystemMessage = (data: { content: string; isPrivate: boolean }) => {
            // Add system message to chat
            const systemMessage: Message = {
                id: `system-${Date.now()}`,
                content: data.content,
                imageUrl: null,
                senderId: 'system',
                senderName: 'System',
                avatarId: 0,
                reactions: {},
                createdAt: new Date().toISOString(),
            };
            addMessage(systemMessage);
        };

        // Register event listeners
        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);
        s.on('ERROR', onError);
        s.on('NEW_MESSAGE', onNewMessage);
        s.on('MESSAGE_REACTION_UPDATED', onReactionUpdated);
        s.on('ONLINE_USERS_COUNT', onOnlineCount);
        s.on('USERNAME_REQUIRED', onUsernameRequired);
        s.on('USERNAME_SET', onUsernameSet);
        s.on('SYSTEM_MESSAGE', onSystemMessage);

        // Connect
        connectSocket();

        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            s.off('ERROR', onError);
            s.off('NEW_MESSAGE', onNewMessage);
            s.off('MESSAGE_REACTION_UPDATED', onReactionUpdated);
            s.off('ONLINE_USERS_COUNT', onOnlineCount);
            s.off('USERNAME_REQUIRED', onUsernameRequired);
            s.off('USERNAME_SET', onUsernameSet);
            s.off('SYSTEM_MESSAGE', onSystemMessage);
            disconnectSocket();
        };
    }, [addMessage, updateMessageReactions, setOnlineCount, refreshUser]);

    // Join chat when user is available
    const joinChat = useCallback(async () => {
        if (!socket || !isConnected) return;

        let guestId = user?.guestId;

        // If no user, register first
        if (!guestId) {
            try {
                await registerUser();
                guestId = localStorage.getItem('guestId') || undefined;
            } catch (error) {
                console.error('Failed to register:', error);
                return;
            }
        }

        if (guestId) {
            socket.emit('JOIN_CHAT', { guestId });
        }
    }, [socket, isConnected, user, registerUser]);

    // Set username
    const setUsername = useCallback((username: string, avatarId: number) => {
        if (!socket || !user) return;
        socket.emit('SET_USERNAME', {
            guestId: user.guestId,
            username,
            avatarId,
        });
    }, [socket, user]);

    // Send message
    const sendMessage = useCallback((payload: SendMessagePayload) => {
        if (!socket || !isConnected) return;
        socket.emit('SEND_MESSAGE', payload);
    }, [socket, isConnected]);

    // Send reaction
    const sendReaction = useCallback((payload: SendReactionPayload) => {
        if (!socket || !isConnected) return;
        socket.emit('SEND_REACTION', payload);
    }, [socket, isConnected]);

    return (
        <SocketContext.Provider
            value={{
                socket,
                isConnected,
                joinChat,
                setUsername,
                sendMessage,
                sendReaction,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
