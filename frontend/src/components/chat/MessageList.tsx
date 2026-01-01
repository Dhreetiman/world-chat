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
    const lastMessageIdRef = useRef<string | null>(null);
    const messageCountRef = useRef<number>(0);

    // Auto-scroll to bottom ONLY when new messages are added (not on reaction updates)
    useEffect(() => {
        const currentLastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
        const currentMessageCount = messages.length;

        // Only scroll if a new message was added (count increased and last message ID changed)
        if (currentMessageCount > messageCountRef.current && currentLastMessageId !== lastMessageIdRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

        // Update refs for next comparison
        lastMessageIdRef.current = currentLastMessageId;
        messageCountRef.current = currentMessageCount;
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
            return 'Today';
        } else if (d.isSame(yesterday, 'day')) {
            return 'Yesterday';
        }
        return d.format('MMM D, YYYY');
    };

    // Check if message should show header (first in group from same sender)
    const shouldShowHeader = (index: number, msgList: typeof messages) => {
        if (index === 0) return true;
        const currentMsg = msgList[index];
        const prevMsg = msgList[index - 1];
        // Show header if different sender or more than 5 minutes apart
        const timeDiff = dayjs(currentMsg.createdAt).diff(dayjs(prevMsg.createdAt), 'minute');
        return currentMsg.senderId !== prevMsg.senderId || timeDiff > 5;
    };

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-2 md:p-3 flex flex-col gap-0.5"
        >
            {/* Load More Button */}
            {hasMoreMessages && (
                <div className="flex justify-center mb-2">
                    <button
                        onClick={loadMoreMessages}
                        disabled={isLoadingMessages}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${isDark
                            ? 'bg-[#162032] border border-[#1e3a5f] text-slate-300 hover:bg-[#1e3a5f]'
                            : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                            } disabled:opacity-50`}
                    >
                        {isLoadingMessages ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}

            {/* Messages grouped by date */}
            {groupedMessages.map((group) => (
                <div key={group.date} className="flex flex-col gap-0.5">
                    {/* Date separator */}
                    <div className="flex justify-center my-1">
                        <span className={`px-2 py-0.5 text-[9px] font-medium rounded-full ${isDark
                            ? 'bg-[#162032]/50 text-slate-400 border border-[#1e3a5f]/50'
                            : 'bg-slate-200/50 text-slate-500 border border-slate-200/50'
                            }`}>
                            {formatDateLabel(group.date)}
                        </span>
                    </div>

                    {/* Messages */}
                    {group.messages.map((message, index) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            showHeader={shouldShowHeader(index, group.messages)}
                        />
                    ))}
                </div>
            ))}

            {/* Empty state */}
            {messages.length === 0 && !isLoadingMessages && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <span className={`material-symbols-outlined text-5xl mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                        forum
                    </span>
                    <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        No messages yet
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Be the first to say hello!
                    </p>
                </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-2" />
        </div>
    );
}
