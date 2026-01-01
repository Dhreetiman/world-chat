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

const quickEmojis = ['👍', '✌️', '😎'];

export default function MessageBubble({ message, showHeader = true }: MessageBubbleProps) {
    const { user, settings } = useUser();
    const { sendReaction } = useSocket();
    const { setReplyingTo, getAvatarUrl } = useChat();
    const [showReactionPicker, setShowReactionPicker] = useState(false);

    const isDark = settings.theme === 'dark';
    const isOwnMessage = user?.guestId === message.senderId;
    const isSystemMessage = message.senderId === 'system';

    // Get avatar URL for this message's sender
    const senderAvatarUrl = getAvatarUrl(message.avatarId);
    const ownAvatarUrl = user?.avatarId ? getAvatarUrl(user.avatarId) : undefined;

    const handleReaction = (emoji: string) => {
        sendReaction({ messageId: message.id, emoji });
        setShowReactionPicker(false);
    };

    const handleReply = () => {
        setReplyingTo(message);
    };

    // Scroll to and highlight the original message when reply preview is clicked
    const scrollToReply = () => {
        if (message.replyToMessage?.id) {
            const targetMessage = document.getElementById(`message-${message.replyToMessage.id}`);
            if (targetMessage) {
                targetMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add highlight effect
                targetMessage.classList.add('ring-2', 'ring-[#13a4ec]', 'ring-opacity-50');
                setTimeout(() => {
                    targetMessage.classList.remove('ring-2', 'ring-[#13a4ec]', 'ring-opacity-50');
                }, 2000);
            }
        }
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

    // Floating action toolbar component - compact version
    const ActionToolbar = ({ isOwn = false }: { isOwn?: boolean }) => (
        <div className={`absolute ${isOwn
            ? 'bottom-full right-0 mb-2'
            : 'left-full top-0 ml-2'
            } opacity-0 group-hover:opacity-100 transition-all z-20`}>
            <div className={`flex items-center gap-0 rounded-lg px-1 py-0.5 shadow-lg ${isDark ? 'bg-[#1a2836] border border-[#233c48]' : 'bg-white border border-slate-200 shadow-md'
                }`}>
                {/* Quick emoji reactions */}
                {quickEmojis.map(emoji => (
                    <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className={`size-7 flex items-center justify-center rounded text-base hover:scale-110 transition-transform outline-none ${isDark ? 'hover:bg-[#233c48]' : 'hover:bg-slate-100'
                            }`}
                    >
                        {emoji}
                    </button>
                ))}

                {/* Add reaction button */}
                <div className="relative">
                    <button
                        onClick={() => setShowReactionPicker(!showReactionPicker)}
                        className={`size-7 flex items-center justify-center rounded transition-colors outline-none ${isDark ? 'text-slate-400 hover:bg-[#233c48] hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                        title="Add reaction"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                            <line x1="9" y1="9" x2="9.01" y2="9" />
                            <line x1="15" y1="9" x2="15.01" y2="9" />
                            <line x1="12" y1="17" x2="12" y2="20" />
                            <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
                        </svg>
                    </button>

                    {showReactionPicker && (
                        <div className={`absolute bottom-full mb-2 ${isOwn ? 'right-0' : 'left-0'} z-30`}>
                            <div className={`flex gap-1 p-1.5 rounded-lg shadow-xl ${isDark ? 'bg-[#1a2836] border border-[#233c48]' : 'bg-white border border-slate-200'
                                }`}>
                                {['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'].map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReaction(emoji)}
                                        className="size-7 flex items-center justify-center rounded text-lg hover:scale-110 hover:bg-[#233c48] transition-all outline-none"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Reply button - simple arrow */}
                <button
                    onClick={handleReply}
                    className={`size-7 flex items-center justify-center rounded transition-colors outline-none ${isDark ? 'text-slate-400 hover:bg-[#233c48] hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                    title="Reply"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 14l-5-5 5-5" />
                        <path d="M4 9h11a4 4 0 0 1 0 8h-1" />
                    </svg>
                </button>

                {/* More options - vertical dots */}
                <button
                    className={`size-7 flex items-center justify-center rounded transition-colors outline-none ${isDark ? 'text-slate-400 hover:bg-[#233c48] hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                    title="More"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                </button>
            </div>
        </div>
    );

    // Sender (own) messages - right aligned
    if (isOwnMessage) {
        return (
            <div id={`message-${message.id}`} className="flex items-start py-0.5 group pl-12 transition-all duration-300 rounded-lg">
                <div className="flex-1" />

                <div className="flex flex-col items-end">
                    {showHeader && (
                        <span className={`text-sm font-bold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>You</span>
                    )}

                    <div className="flex items-center gap-2">
                        {/* Action toolbar - compact version for own messages */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all">
                            <div className={`flex items-center gap-0 rounded-lg px-1 py-0.5 shadow-lg ${isDark ? 'bg-[#1a2836] border border-[#233c48]' : 'bg-white border border-slate-200 shadow-md'
                                }`}>
                                {quickEmojis.map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => handleReaction(emoji)}
                                        className={`size-7 flex items-center justify-center rounded text-base hover:scale-110 transition-transform outline-none ${isDark ? 'hover:bg-[#233c48]' : 'hover:bg-slate-100'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                                    className={`size-7 flex items-center justify-center rounded transition-colors outline-none ${isDark ? 'text-slate-400 hover:bg-[#233c48] hover:text-white' : 'text-slate-500 hover:bg-slate-100'
                                        }`}
                                    title="Add reaction"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                        <line x1="15" y1="9" x2="15.01" y2="9" />
                                        <line x1="12" y1="17" x2="12" y2="20" />
                                        <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleReply}
                                    className={`size-7 flex items-center justify-center rounded transition-colors outline-none ${isDark ? 'text-slate-400 hover:bg-[#233c48] hover:text-white' : 'text-slate-500 hover:bg-slate-100'
                                        }`}
                                    title="Reply"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 14l-5-5 5-5" />
                                        <path d="M4 9h11a4 4 0 0 1 0 8h-1" />
                                    </svg>
                                </button>
                                <button
                                    className={`size-7 flex items-center justify-center rounded transition-colors outline-none ${isDark ? 'text-slate-400 hover:bg-[#233c48] hover:text-white' : 'text-slate-500 hover:bg-slate-100'
                                        }`}
                                    title="More"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="5" r="2" />
                                        <circle cx="12" cy="12" r="2" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Message bubble with reactions underneath */}
                        <div className="flex flex-col items-end">
                            <div className="bg-[#13a4ec] text-white rounded-2xl rounded-tr-none px-4 py-3 text-sm leading-relaxed shadow-lg shadow-[#13a4ec]/20">
                                {/* Reply quote - simple and clean */}
                                {message.replyToMessage && (
                                    <div onClick={scrollToReply} className="text-xs mb-2 pb-2 border-b border-white/20 cursor-pointer hover:opacity-80 transition-opacity">
                                        <span className="font-semibold text-white">↩ {message.replyToMessage.senderName}</span>
                                        <span className="text-white/70"> · {message.replyToMessage.content?.slice(0, 35)}...</span>
                                    </div>
                                )}
                                {message.content}
                            </div>
                            {/* Reactions - aligned with message bubble */}
                            {reactionCounts.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap justify-end">
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
                        <span className={`text-[10px] shrink-0 self-start mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {timeStr}
                        </span>
                    </div>
                </div>

                {showHeader ? (
                    <div className="size-9 rounded-full shrink-0 overflow-hidden ml-2 border-2 border-[#13a4ec]/30">
                        {ownAvatarUrl ? (
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${ownAvatarUrl})` }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-[#13a4ec] to-cyan-400 flex items-center justify-center text-white font-bold text-xs">
                                ME
                            </div>
                        )}
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
        <div id={`message-${message.id}`} className="flex items-start py-0.5 group pr-12 transition-all duration-300 rounded-lg">
            {showHeader ? (
                <div className={`size-9 rounded-full shrink-0 overflow-hidden mr-2 border-2 ${isDark ? 'border-[#233c48]' : 'border-slate-200'}`}>
                    {senderAvatarUrl ? (
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${senderAvatarUrl})` }}
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${avatarColors[avatarColorIndex]} flex items-center justify-center text-white font-bold text-xs`}>
                            {message.senderName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-9 shrink-0 mr-2" />
            )}

            <div className="flex flex-col">
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

                <div className="flex items-start gap-2 relative">
                    <span className={`text-[10px] shrink-0 pt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {timeStr}
                    </span>
                    <div className={`rounded-2xl rounded-tl-none px-4 py-3 text-sm leading-relaxed ${isDark ? 'bg-[#233c48] text-white' : 'bg-white border border-slate-200 text-slate-800'
                        }`}>
                        {/* Reply quote - simple and clean */}
                        {message.replyToMessage && (
                            <div onClick={scrollToReply} className={`text-xs mb-2 pb-2 border-b cursor-pointer hover:opacity-80 transition-opacity ${isDark ? 'border-[#375a6b] text-[#92b7c9]' : 'border-slate-200 text-slate-500'}`}>
                                <span className={`font-semibold ${isDark ? 'text-[#13a4ec]' : 'text-indigo-500'}`}>
                                    ↩ {message.replyToMessage.senderName}
                                </span>
                                <span className="opacity-70"> · {message.replyToMessage.content?.slice(0, 35)}...</span>
                            </div>
                        )}
                        {message.content}
                    </div>

                    {/* Action toolbar - appears on right for other messages */}
                    <ActionToolbar />
                </div>

                {/* Existing reactions */}
                {reactionCounts.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap ml-12">
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
        </div>
    );
}
