'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { Message, SendMessagePayload, SendReactionPayload, EditMessagePayload, DeleteMessagePayload } from '@/types';

interface OnlineUser {
    id: string;
    username: string;
    avatarUrl: string | null;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: OnlineUser[];
    onlineCount: number;
    sendMessage: (payload: SendMessagePayload) => void;
    sendReaction: (payload: SendReactionPayload) => void;
    editMessage: (payload: EditMessagePayload) => void;
    deleteMessage: (payload: DeleteMessagePayload) => void;
    startTyping: (roomId?: string) => void;
    stopTyping: (roomId?: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const { user, accessToken, isAuthenticated } = useAuth();
    const { addMessage, updateMessageReactions, updateMessage, markMessageDeleted } = useChat();

    // Initialize socket connection with JWT auth
    useEffect(() => {
        if (!isAuthenticated || !accessToken || !user) {
            // Not authenticated, disconnect if connected
            if (socket) {
                console.log('🔒 Not authenticated, disconnecting socket');
                disconnectSocket();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Get socket instance with JWT token
        const s = getSocket(accessToken);
        setSocket(s);

        const onConnect = () => {
            console.log('✅ Socket connected with authentication');
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        };

        const onError = (error: { code: string; message: string }) => {
            console.error('Socket error:', error);
        };

        const onNewMessage = (message: Message) => {
            addMessage(message);
        };

        const onMessageEdited = (data: { id: string; content: string; isEdited: boolean; editedAt: string }) => {
            updateMessage(data.id, {
                content: data.content,
                isEdited: data.isEdited,
                editedAt: data.editedAt,
            });
        };

        const onMessageDeleted = (data: { id: string; isDeleted: boolean }) => {
            markMessageDeleted(data.id);
        };

        const onOnlineUsersUpdated = (data: { count: number; users: OnlineUser[] }) => {
            setOnlineUsers(data.users);
            setOnlineCount(data.count);
        };

        const onReactionUpdated = (data: { messageId: string; emoji: string; action: 'added' | 'removed'; userId: string; username?: string }) => {
            // Tell ChatContext to update the message's reactions
            updateMessageReactions(data.messageId, data.emoji, data.action, data.userId, data.username);
        };

        // Register event listeners
        s.on('connect', onConnect);
        s.on('disconnect', onDisconnect);
        s.on('ERROR', onError);
        s.on('NEW_MESSAGE', onNewMessage);
        s.on('REACTION_UPDATED', onReactionUpdated);
        s.on('ONLINE_USERS_UPDATED', onOnlineUsersUpdated);
        s.on('MESSAGE_EDITED', onMessageEdited);
        s.on('MESSAGE_DELETED', onMessageDeleted);

        // Cleanup on unmount or auth change
        return () => {
            s.off('connect', onConnect);
            s.off('disconnect', onDisconnect);
            s.off('ERROR', onError);
            s.off('NEW_MESSAGE', onNewMessage);
            s.off('REACTION_UPDATED', onReactionUpdated);
            s.off('ONLINE_USERS_UPDATED', onOnlineUsersUpdated);
            s.off('MESSAGE_EDITED', onMessageEdited);
            s.off('MESSAGE_DELETED', onMessageDeleted);
            disconnectSocket();
        };
    }, [isAuthenticated, accessToken, user, addMessage, updateMessageReactions, updateMessage, markMessageDeleted]);

    // Send message
    const sendMessage = useCallback((payload: SendMessagePayload) => {
        if (!socket || !isConnected) {
            console.error('Socket not connected');
            return;
        }
        socket.emit('SEND_MESSAGE', payload);
    }, [socket, isConnected]);

    // Send reaction
    const sendReaction = useCallback((payload: SendReactionPayload) => {
        if (!socket || !isConnected) {
            console.error('Socket not connected');
            return;
        }
        socket.emit('ADD_REACTION', payload);
    }, [socket, isConnected]);

    // Edit message
    const editMessage = useCallback((payload: EditMessagePayload) => {
        if (!socket || !isConnected) {
            console.error('Socket not connected');
            return;
        }
        socket.emit('EDIT_MESSAGE', payload);
    }, [socket, isConnected]);

    // Delete message
    const deleteMessage = useCallback((payload: DeleteMessagePayload) => {
        if (!socket || !isConnected) {
            console.error('Socket not connected');
            return;
        }
        socket.emit('DELETE_MESSAGE', payload);
    }, [socket, isConnected]);

    // Typing indicators
    const startTyping = useCallback((roomId = 'global') => {
        if (!socket || !isConnected) return;
        socket.emit('TYPING_START', { roomId });
    }, [socket, isConnected]);

    const stopTyping = useCallback((roomId = 'global') => {
        if (!socket || !isConnected) return;
        socket.emit('TYPING_STOP', { roomId });
    }, [socket, isConnected]);

    const value = {
        socket,
        isConnected,
        onlineUsers,
        onlineCount,
        sendMessage,
        sendReaction,
        editMessage,
        deleteMessage,
        startTyping,
        stopTyping,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
