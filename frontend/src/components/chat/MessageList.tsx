'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import dayjs from 'dayjs';

export default function MessageList() {
    const { messages } = useChat();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#06b6d4]/10 flex items-center justify-center mx-auto mb-3">
                        <span className="material-symbols-outlined text-[#06b6d4] text-[24px]">chat_bubble</span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">No messages yet</h3>
                    <p className="text-sm text-gray-500">Be the first to say something!</p>
                </div>
            </div>
        );
    }

    const getDateString = (dateStr: string) => {
        const date = dayjs(dateStr);
        const today = dayjs().startOf('day');
        const yesterday = today.subtract(1, 'day');
        if (date.isSame(today, 'day')) return `Today, ${date.format('MMMM D')}`;
        if (date.isSame(yesterday, 'day')) return 'Yesterday';
        return date.format('MMMM D, YYYY');
    };

    let lastDateString = '';

    return (
        <>
            {messages.map((message, index) => {
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const showHeader = !prevMessage || prevMessage.senderId !== message.senderId;

                const currentDateString = getDateString(message.createdAt);
                const showDateSeparator = currentDateString !== lastDateString;
                lastDateString = currentDateString;

                return (
                    <div key={message.id}>
                        {showDateSeparator && (
                            <div className="flex items-center justify-center my-6 opacity-60">
                                <span className="px-3 text-[10px] font-mono text-gray-500">
                                    {currentDateString}
                                </span>
                            </div>
                        )}
                        <MessageBubble message={message} showHeader={showHeader} />
                    </div>
                );
            })}
            <TypingIndicator />
            <div ref={bottomRef} />
        </>
    );
}
