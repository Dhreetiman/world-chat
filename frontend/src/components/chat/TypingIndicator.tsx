'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface TypingUser {
    userId: string;
    username: string;
}

export default function TypingIndicator() {
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleUserTyping = (data: { userId: string; username: string }) => {
            setTypingUsers(prev => {
                // Don't add duplicates
                if (prev.some(u => u.userId === data.userId)) {
                    return prev;
                }
                // Max 3 users shown
                return [...prev, data].slice(0, 3);
            });
        };

        const handleUserStoppedTyping = (data: { userId: string }) => {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        };

        socket.on('USER_TYPING', handleUserTyping);
        socket.on('USER_STOPPED_TYPING', handleUserStoppedTyping);

        return () => {
            socket.off('USER_TYPING', handleUserTyping);
            socket.off('USER_STOPPED_TYPING', handleUserStoppedTyping);
        };
    }, [socket]);

    if (typingUsers.length === 0) return null;

    const getTypingText = () => {
        if (typingUsers.length === 1) {
            return `${typingUsers[0].username} is typing`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0].username} and ${typingUsers[1].username} are typing`;
        } else {
            return `${typingUsers[0].username}, ${typingUsers[1].username}, and ${typingUsers[2].username} are typing`;
        }
    };

    return (
        <div className="px-6 py-2 text-sm text-[#90adcb] flex items-center gap-2">
            <span>{getTypingText()}</span>
            <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#90adcb] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#90adcb] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#90adcb] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
}
