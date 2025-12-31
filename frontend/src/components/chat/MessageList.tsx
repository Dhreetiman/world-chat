'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useUser } from '@/contexts/UserContext';
import MessageBubble from './MessageBubble';
import dayjs from 'dayjs';

export default function MessageList() {
    const { messages, isLoadingMessages, hasMoreMessages, loadMoreMessages } = useChat();
    const { settings } = useUser();
    const isDark = settings.theme === 'dark';
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Group messages by date
    const groupedMessages: { date: string; messages: typeof messages }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
        const msgDate = dayjs(msg.createdAt).format('YYYY-MM-DD');
        if (msgDate !== currentDate) {
            currentDate = msgDate;
            groupedMessages.push({
                date: msgDate,
                messages: [msg],
            });
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(msg);
        }
    });

    const formatDateLabel = (date: string) => {
        const d = dayjs(date);
        const today = dayjs();
        const yesterday = today.subtract(1, 'day');

        if (d.isSame(today, 'day')) {
            return `Today, ${d.format('h:mm A')}`;
        } else if (d.isSame(yesterday, 'day')) {
            return `Yesterday, ${d.format('h:mm A')}`;
        }
        return d.format('MMM D, YYYY');
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6"
        >
            {/* Load More Button */}
            {hasMoreMessages && (
                <div className="flex justify-center">
                    <button
                        onClick={loadMoreMessages}
                        disabled={isLoadingMessages}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isDark
                                ? 'bg-[#162032] border border-[#1e3a5f] text-slate-300 hover:bg-[#1e3a5f]'
                                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                            } disabled:opacity-50`}
                    >
                        {isLoadingMessages ? 'Loading...' : 'Load More Messages'}
                    </button>
                </div>
            )}

            {/* Messages grouped by date */}
            {groupedMessages.map((group) => (
                <div key={group.date} className="flex flex-col gap-6">
                    {/* Date separator */}
                    <div className="flex justify-center my-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${isDark
                                ? 'bg-[#162032]/50 text-slate-400 border border-[#1e3a5f]/50'
                                : 'bg-slate-200/50 text-slate-500 border border-slate-200/50'
                            }`}>
                            {formatDateLabel(group.date)}
                        </span>
                    </div>

                    {/* Messages */}
                    {group.messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
                </div>
            ))}

            {/* Empty state */}
            {messages.length === 0 && !isLoadingMessages && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <span className={`material-symbols-outlined text-6xl mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                        forum
                    </span>
                    <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No messages yet
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Be the first to say hello!
                    </p>
                </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-4" />
        </div>
    );
}
