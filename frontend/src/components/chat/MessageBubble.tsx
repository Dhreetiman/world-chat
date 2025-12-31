'use client';

import { Message } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { useChat } from '@/contexts/ChatContext';
import dayjs from 'dayjs';
import { useState } from 'react';

interface MessageBubbleProps {
    message: Message;
}

// Badge colors based on user title
const titleBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
    VIP: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800' },
    Activist: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-800' },
    Warrior: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-800' },
    'Pro Gamer': { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-800' },
};

// Avatar placeholder colors
const avatarColors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-orange-400 to-orange-600',
    'from-teal-400 to-teal-600',
];

export default function MessageBubble({ message }: MessageBubbleProps) {
    const { user, settings } = useUser();
    const { sendReaction } = useSocket();
    const { setReplyingTo } = useChat();
    const [showReactions, setShowReactions] = useState(false);

    const isDark = settings.theme === 'dark';
    const isOwnMessage = user?.guestId === message.senderId;
    const isSystemMessage = message.senderId === 'system';

    const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

    const handleReaction = (emoji: string) => {
        sendReaction({ messageId: message.id, emoji });
        setShowReactions(false);
    };

    // Get reaction counts
    const reactionCounts = Object.entries(message.reactions || {}).map(([emoji, users]) => ({
        emoji,
        count: users.length,
        hasReacted: user ? users.includes(user.guestId) : false,
    }));

    if (isSystemMessage) {
        return (
            <div className="flex gap-4">
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 border ${isDark
                        ? 'bg-[#162032] border-[#1e3a5f]'
                        : 'bg-slate-100 border-slate-200'
                    }`}>
                    <span className={`material-symbols-outlined text-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>smart_toy</span>
                </div>
                <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>System</span>
                        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {dayjs(message.createdAt).format('h:mm A')}
                        </span>
                    </div>
                    <div className={`rounded-2xl rounded-tl-none px-5 py-3 text-sm leading-relaxed ${isDark
                            ? 'bg-[#162032] border border-[#1e3a5f] text-slate-300'
                            : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                        }`}>
                        {message.content}
                    </div>
                </div>
            </div>
        );
    }

    if (isOwnMessage) {
        return (
            <div className="flex flex-row-reverse gap-4 group">
                <div className="size-10 rounded-full bg-gradient-to-tr from-[#13a4ec] to-cyan-400 shrink-0 shadow-md border-2 border-white dark:border-[#0f1a2b] flex items-center justify-center text-white font-bold text-sm">
                    ME
                </div>
                <div className="flex flex-col gap-1 items-end max-w-[80%]">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {dayjs(message.createdAt).format('h:mm A')}
                        </span>
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>You</span>
                    </div>

                    {/* Reply preview */}
                    {message.replyToMessage && (
                        <div className={`text-xs px-3 py-1.5 rounded-lg mb-1 max-w-full truncate ${isDark ? 'bg-[#13a4ec]/20 text-slate-300' : 'bg-[#13a4ec]/10 text-slate-600'
                            }`}>
                            ↩ {message.replyToMessage.senderName}: {message.replyToMessage.content?.slice(0, 50)}...
                        </div>
                    )}

                    <div className="bg-[#13a4ec] text-white rounded-2xl rounded-tr-none px-5 py-3 text-sm leading-relaxed shadow-md shadow-[#13a4ec]/20">
                        {message.content}
                    </div>

                    {/* Hardcoded read receipt */}
                    <div className="flex items-center gap-1 mt-1 text-slate-400">
                        <span className="text-[10px]">Read</span>
                        <span className="material-symbols-outlined text-[12px] text-[#13a4ec]">done_all</span>
                    </div>
                </div>
            </div>
        );
    }

    // Other users' messages
    const avatarColorIndex = message.avatarId % avatarColors.length;

    return (
        <div className="flex gap-4 group">
            <div
                className={`size-10 rounded-full shrink-0 shadow-md border-2 border-white dark:border-[#0f1a2b] flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${avatarColors[avatarColorIndex]} group-hover:border-[#13a4ec]/50 transition-colors`}
            >
                {message.senderName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1 max-w-[80%]">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${isDark ? 'text-[#13a4ec]' : 'text-indigo-600'}`}>
                        {message.senderName}
                    </span>
                    {message.userTitle && message.userTitle !== 'common' && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${titleBadgeColors[message.userTitle]?.bg || 'bg-slate-100'
                            } ${titleBadgeColors[message.userTitle]?.text || 'text-slate-600'} ${titleBadgeColors[message.userTitle]?.border || 'border-slate-200'
                            }`}>
                            {message.userTitle}
                        </span>
                    )}
                    <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {dayjs(message.createdAt).format('h:mm A')}
                    </span>
                </div>

                {/* Reply preview */}
                {message.replyToMessage && (
                    <div className={`text-xs px-3 py-1.5 rounded-lg mb-1 max-w-full truncate ${isDark ? 'bg-[#162032] text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                        ↩ {message.replyToMessage.senderName}: {message.replyToMessage.content?.slice(0, 50)}...
                    </div>
                )}

                <div className={`rounded-2xl rounded-tl-none px-5 py-3 text-sm leading-relaxed ${isDark
                        ? 'bg-[#162032] border border-[#1e3a5f] text-slate-200'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                    }`}>
                    {message.content}
                </div>

                {/* Reactions */}
                <div className="flex gap-1 mt-1 flex-wrap items-center">
                    {reactionCounts.map(({ emoji, count, hasReacted }) => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${hasReacted
                                    ? 'bg-[#13a4ec]/10 border-[#13a4ec]/30'
                                    : isDark
                                        ? 'bg-[#162032] border-[#1e3a5f] hover:border-[#13a4ec]/50'
                                        : 'bg-slate-50 border-slate-200 hover:border-[#13a4ec]/50'
                                }`}
                        >
                            <span className="text-xs">{emoji}</span>
                            <span className={`text-[10px] ${hasReacted ? 'text-[#13a4ec]' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {count}
                            </span>
                        </button>
                    ))}

                    {/* Add reaction button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowReactions(!showReactions)}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${isDark ? 'hover:bg-[#162032]' : 'hover:bg-slate-100'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                add_reaction
                            </span>
                        </button>

                        {showReactions && (
                            <div className={`absolute left-0 bottom-full mb-2 flex gap-1 p-2 rounded-xl shadow-lg z-10 ${isDark ? 'bg-[#162032] border border-[#1e3a5f]' : 'bg-white border border-slate-200'
                                }`}>
                                {commonEmojis.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReaction(emoji)}
                                        className="hover:scale-125 transition-transform text-lg"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reply button */}
                    <button
                        onClick={() => setReplyingTo(message)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${isDark ? 'hover:bg-[#162032]' : 'hover:bg-slate-100'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            reply
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
