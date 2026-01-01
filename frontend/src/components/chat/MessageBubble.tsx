'use client';

import { Message } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { useChat } from '@/contexts/ChatContext';
import dayjs from 'dayjs';
import { useState } from 'react';

interface MessageBubbleProps {
    message: Message;
    showHeader?: boolean;
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

export default function MessageBubble({ message, showHeader = true }: MessageBubbleProps) {
    const { user, settings } = useUser();
    const { sendReaction } = useSocket();
    const { setReplyingTo } = useChat();
    const [showReactions, setShowReactions] = useState(false);

    const isDark = settings.theme === 'dark';
    const isOwnMessage = user?.guestId === message.senderId;
    const isSystemMessage = message.senderId === 'system';

    const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

    const handleReaction = (emoji: string) => {
        sendReaction({ messageId: message.id, emoji });
        setShowReactions(false);
    };

    const handleReply = () => {
        setReplyingTo(message);
    };

    const reactionCounts = Object.entries(message.reactions || {}).map(([emoji, users]) => ({
        emoji,
        count: users.length,
        hasReacted: user ? users.includes(user.guestId) : false,
    }));

    const timeStr = dayjs(message.createdAt).format('h:mm A');

    if (isSystemMessage) {
        return (
            <div className="flex items-center justify-center py-1">
                <div className={`text-xs leading-relaxed py-1.5 px-3 rounded-full ${isDark ? 'bg-[#162032]/50 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                    {message.content}
                </div>
            </div>
        );
    }

    // Sender (own) messages - right aligned, mirrored layout
    if (isOwnMessage) {
        return (
            <div className="flex items-start py-0.5 group pl-12">
                {/* Spacer to push content right */}
                <div className="flex-1" />

                <div className="flex flex-col items-end">
                    {/* Header: Name */}
                    {showHeader && (
                        <span className={`text-sm font-bold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>You</span>
                    )}

                    {/* Reply preview */}
                    {message.replyToMessage && (
                        <div className={`text-[11px] px-2.5 py-1 rounded-lg mb-1 max-w-full truncate ${isDark ? 'bg-[#13a4ec]/20 text-slate-300' : 'bg-[#13a4ec]/10 text-slate-600'
                            }`}>
                            ↩ {message.replyToMessage.senderName}: {message.replyToMessage.content?.slice(0, 30)}...
                        </div>
                    )}

                    {/* Message row: Bubble + Time (time on right for sender) */}
                    <div className="flex items-start gap-2">
                        <div className="bg-[#13a4ec] text-white rounded-xl rounded-tr-sm px-4 py-2 text-sm leading-relaxed">
                            {message.content}
                        </div>
                        <span className={`text-[10px] pt-2 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {timeStr}
                        </span>
                    </div>
                </div>

                {/* Avatar */}
                {showHeader ? (
                    <div className="size-9 rounded-full bg-gradient-to-tr from-[#13a4ec] to-cyan-400 shrink-0 flex items-center justify-center text-white font-bold text-xs ml-2">
                        ME
                    </div>
                ) : (
                    <div className="w-9 shrink-0 ml-2" />
                )}
            </div>
        );
    }

    // Receiver (other users) messages - left aligned
    const avatarColorIndex = message.avatarId % avatarColors.length;

    return (
        <div className="flex items-start py-0.5 group pr-12">
            {/* Avatar */}
            {showHeader ? (
                <div className={`size-9 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-xs bg-gradient-to-br ${avatarColors[avatarColorIndex]} mr-2`}>
                    {message.senderName.charAt(0).toUpperCase()}
                </div>
            ) : (
                <div className="w-9 shrink-0 mr-2" />
            )}

            <div className="flex flex-col">
                {/* Header: Name + Badge */}
                {showHeader && (
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-bold ${isDark ? 'text-[#13a4ec]' : 'text-indigo-600'}`}>
                            {message.senderName}
                        </span>
                        {message.userTitle && message.userTitle !== 'common' && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${titleBadgeColors[message.userTitle]?.bg || 'bg-slate-100'
                                } ${titleBadgeColors[message.userTitle]?.text || 'text-slate-600'} ${titleBadgeColors[message.userTitle]?.border || 'border-slate-200'
                                }`}>
                                {message.userTitle}
                            </span>
                        )}
                    </div>
                )}

                {/* Reply preview */}
                {message.replyToMessage && (
                    <div className={`text-[11px] px-2.5 py-1 rounded-lg mb-1 max-w-full truncate ${isDark ? 'bg-[#162032] text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                        ↩ {message.replyToMessage.senderName}: {message.replyToMessage.content?.slice(0, 30)}...
                    </div>
                )}

                {/* Message row: Time + Bubble (time on left for receiver) */}
                <div className="flex items-start gap-2">
                    <span className={`text-[10px] pt-2 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {timeStr}
                    </span>
                    <div className={`rounded-xl rounded-tl-sm px-4 py-2 text-sm leading-relaxed ${isDark ? 'bg-[#162032] text-slate-200' : 'bg-white border border-slate-200 text-slate-800'
                        }`}>
                        {message.content}
                    </div>
                </div>

                {/* Reactions */}
                {reactionCounts.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap items-center ml-12">
                        {reactionCounts.map(({ emoji, count, hasReacted }) => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] transition-colors ${hasReacted
                                        ? 'bg-[#13a4ec]/10 border border-[#13a4ec]/30'
                                        : isDark
                                            ? 'bg-[#162032] border border-[#1e3a5f]'
                                            : 'bg-slate-50 border border-slate-200'
                                    }`}
                            >
                                <span>{emoji}</span>
                                <span className={hasReacted ? 'text-[#13a4ec]' : isDark ? 'text-slate-400' : 'text-slate-500'}>
                                    {count}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1 ml-1">
                <div className="relative">
                    <button
                        onClick={() => setShowReactions(!showReactions)}
                        className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-[#162032]' : 'hover:bg-slate-100'}`}
                        title="React"
                    >
                        <span className={`material-symbols-outlined text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            add_reaction
                        </span>
                    </button>

                    {showReactions && (
                        <div className={`absolute left-0 bottom-full mb-1 flex gap-1 p-2 rounded-lg shadow-lg z-10 ${isDark ? 'bg-[#162032] border border-[#1e3a5f]' : 'bg-white border border-slate-200'
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

                <button
                    onClick={handleReply}
                    className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-[#162032]' : 'hover:bg-slate-100'}`}
                    title="Reply"
                >
                    <span className={`material-symbols-outlined text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        reply
                    </span>
                </button>
            </div>
        </div>
    );
}
