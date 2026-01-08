'use client';

import { Message } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { useChat } from '@/contexts/ChatContext';
import dayjs from 'dayjs';
import { useState, useRef, useEffect } from 'react';

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
    const { sendReaction, editMessage, deleteMessage } = useSocket();
    const { setReplyingTo, getAvatarUrl, focusInput } = useChat();
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content || '');
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    const isDark = settings.theme === 'dark';
    const isOwnMessage = user?.guestId === message.senderId;
    const isSystemMessage = message.senderId === 'system';

    // Check if message can be edited (within 30 minutes)
    const canEdit = isOwnMessage && !message.isDeleted && dayjs().diff(dayjs(message.createdAt), 'minute') < 30;

    // Get avatar URL for this message's sender
    const senderAvatarUrl = getAvatarUrl(message.avatarId);
    const ownAvatarUrl = user?.avatarId ? getAvatarUrl(user.avatarId) : undefined;

    // Focus edit input when entering edit mode
    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.setSelectionRange(editContent.length, editContent.length);
        }
    }, [isEditing, editContent.length]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowMoreMenu(false);
            setShowReactionPicker(false);
        };
        if (showMoreMenu || showReactionPicker) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showMoreMenu, showReactionPicker]);

    const handleReaction = (emoji: string) => {
        sendReaction({ messageId: message.id, emoji });
        setShowReactionPicker(false);
    };

    const handleReply = () => {
        setReplyingTo(message);
        focusInput();
    };

    const handleEdit = () => {
        setEditContent(message.content || '');
        setIsEditing(true);
        setShowMoreMenu(false);
    };

    const handleSaveEdit = () => {
        if (editContent.trim() && editContent.trim() !== message.content) {
            editMessage({ messageId: message.id, content: editContent.trim() });
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditContent(message.content || '');
        setIsEditing(false);
    };

    const handleDelete = () => {
        deleteMessage({ messageId: message.id });
        setShowMoreMenu(false);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    // Scroll to and highlight the original message when reply preview is clicked
    const scrollToReply = () => {
        if (message.replyToMessage?.id) {
            const targetMessage = document.getElementById(`message-${message.replyToMessage.id}`);
            if (targetMessage) {
                targetMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    // System message
    if (isSystemMessage) {
        return (
            <div className="flex items-center justify-center py-1">
                <div className={`text-xs leading-relaxed py-1.5 px-3 rounded-full ${isDark ? 'bg-[#162032]/50 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    {message.content}
                </div>
            </div>
        );
    }

    // Deleted message placeholder
    if (message.isDeleted) {
        if (isOwnMessage) {
            // Own deleted message - right aligned
            return (
                <div id={`message-${message.id}`} className="flex items-start py-0.5 pl-12">
                    <div className="flex-1" />
                    <div className={`px-4 py-2 rounded-2xl text-sm italic ${isDark ? 'bg-[#1a2836]/50 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                        🗑️ This message has been deleted
                    </div>
                    <span className={`text-[10px] shrink-0 self-center ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{timeStr}</span>
                    <div className="w-9 shrink-0 ml-2" />
                </div>
            );
        } else {
            // Other user's deleted message - left aligned with proper spacing
            return (
                <div id={`message-${message.id}`} className="flex items-start py-0.5 pr-12">
                    <div className="w-9 shrink-0 mr-2" />
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{timeStr}</span>
                        <div className={`px-4 py-2 rounded-2xl text-sm italic ${isDark ? 'bg-[#1a2836]/50 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                            🗑️ This message has been deleted
                        </div>
                    </div>
                </div>
            );
        }
    }

    // Inline action toolbar - appears at the end of message row
    const ActionToolbar = ({ alignRight = false }: { alignRight?: boolean }) => (
        <div className={`flex items-center gap-0 rounded-lg px-1 py-0.5 shadow-lg shrink-0 opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'bg-[#1a2836] border border-[#233c48]' : 'bg-white border border-slate-200 shadow-md'}`}>
            {/* Quick emoji reactions */}
            {quickEmojis.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`size-7 flex items-center justify-center rounded text-base hover:scale-110 transition-transform outline-none ${isDark ? 'hover:bg-[#233c48]' : 'hover:bg-slate-100'}`}
                >
                    {emoji}
                </button>
            ))}

            {/* Add reaction button with picker */}
            <div className="relative">
                <button
                    onClick={(e) => { e.stopPropagation(); setShowReactionPicker(!showReactionPicker); setShowMoreMenu(false); }}
                    className={`size-7 flex items-center justify-center rounded transition-colors outline-none ${isDark ? 'text-slate-400 hover:bg-[#233c48] hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
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
                    <div className={`absolute bottom-full mb-2 ${alignRight ? 'right-0' : 'left-0'} z-50`} onClick={e => e.stopPropagation()}>
                        <div className={`flex gap-1 p-1.5 rounded-lg shadow-xl ${isDark ? 'bg-[#1a2836] border border-[#233c48]' : 'bg-white border border-slate-200'}`}>
                            {['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    className={`size-7 flex items-center justify-center rounded text-lg hover:scale-110 transition-all outline-none ${isDark ? 'hover:bg-[#233c48]' : 'hover:bg-slate-100'}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Reply button */}
            <button
                onClick={handleReply}
                className={`size-7 flex items-center justify-center rounded transition-colors outline-none ${isDark ? 'text-slate-400 hover:bg-[#233c48] hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                title="Reply"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 14l-5-5 5-5" />
                    <path d="M4 9h11a4 4 0 0 1 0 8h-1" />
                </svg>
            </button>

            {/* More options - only for own messages */}
            {isOwnMessage && (
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMoreMenu(!showMoreMenu); setShowReactionPicker(false); }}
                        className={`size-7 flex items-center justify-center rounded transition-colors outline-none ${isDark ? 'text-slate-400 hover:bg-[#233c48] hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                        title="More"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                        </svg>
                    </button>

                    {showMoreMenu && (
                        <div className={`absolute bottom-full mb-2 ${alignRight ? 'right-0' : 'left-0'} z-50 min-w-[120px]`} onClick={e => e.stopPropagation()}>
                            <div className={`rounded-lg shadow-xl overflow-hidden ${isDark ? 'bg-[#1a2836] border border-[#233c48]' : 'bg-white border border-slate-200'}`}>
                                {canEdit && (
                                    <button
                                        onClick={handleEdit}
                                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${isDark ? 'hover:bg-[#233c48] text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-500 ${isDark ? 'hover:bg-[#233c48]' : 'hover:bg-slate-100'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Message content component
    const MessageContent = ({ isOwn }: { isOwn: boolean }) => {
        if (isEditing) {
            return (
                <div className={`rounded-2xl ${isOwn ? 'rounded-tr-none bg-[#13a4ec]' : 'rounded-tl-none'} px-3 py-2 max-w-2xl ${isDark ? 'bg-[#233c48]' : 'bg-white border border-slate-200'}`}>
                    <textarea
                        ref={editInputRef}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        className={`w-full min-w-[200px] bg-transparent resize-none text-sm outline-none ${isOwn ? 'text-white placeholder-white/50' : isDark ? 'text-white' : 'text-slate-800'}`}
                        rows={2}
                    />
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/20">
                        <button onClick={handleCancelEdit} className="text-xs px-2 py-1 rounded opacity-70 hover:opacity-100">Cancel</button>
                        <button onClick={handleSaveEdit} className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30">Save</button>
                    </div>
                </div>
            );
        }

        return (
            <div className={`${isOwn ? 'bg-[#13a4ec] text-white rounded-2xl rounded-tr-none shadow-lg shadow-[#13a4ec]/20' : `rounded-2xl rounded-tl-none ${isDark ? 'bg-[#233c48] text-white' : 'bg-white border border-slate-200 text-slate-800'}`} px-4 py-3 text-sm leading-relaxed max-w-2xl break-words`}>
                {message.replyToMessage && (
                    <div onClick={scrollToReply} className={`text-xs mb-2 pb-2 border-b cursor-pointer hover:opacity-80 transition-opacity ${isOwn ? 'border-white/20' : isDark ? 'border-[#375a6b] text-[#92b7c9]' : 'border-slate-200 text-slate-500'}`}>
                        <span className={`font-semibold ${isOwn ? 'text-white' : isDark ? 'text-[#13a4ec]' : 'text-indigo-500'}`}>↩ {message.replyToMessage.senderName}</span>
                        <span className={isOwn ? 'text-white/70' : 'opacity-70'}> · {message.replyToMessage.content?.slice(0, 35)}...</span>
                    </div>
                )}
                {message.content}
                {message.isEdited && (
                    <span className={`text-[10px] ml-2 ${isOwn ? 'text-white/50' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>(edited)</span>
                )}
            </div>
        );
    };

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
                        {/* Toolbar appears inline to the left of message */}
                        <ActionToolbar alignRight={true} />

                        {/* Message bubble */}
                        <div className="flex flex-col items-end">
                            <MessageContent isOwn={true} />
                            {reactionCounts.length > 0 && (
                                <div className="flex gap-1 mt-1 flex-wrap justify-end">
                                    {reactionCounts.map(({ emoji, count, hasReacted }) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReaction(emoji)}
                                            className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] transition-colors ${hasReacted
                                                ? 'bg-[#13a4ec]/10 border border-[#13a4ec]/30'
                                                : isDark ? 'bg-[#162032] border border-[#1e3a5f]' : 'bg-slate-50 border border-slate-200'
                                                }`}
                                        >
                                            <span>{emoji}</span>
                                            <span className={hasReacted ? 'text-[#13a4ec]' : isDark ? 'text-slate-400' : 'text-slate-500'}>{count}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className={`text-[10px] shrink-0 self-start mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{timeStr}</span>
                    </div>
                </div>

                {showHeader ? (
                    <div className="size-9 rounded-full shrink-0 overflow-hidden ml-2 border-2 border-[#13a4ec]/30">
                        {ownAvatarUrl ? (
                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${ownAvatarUrl})` }} />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-tr from-[#13a4ec] to-cyan-400 flex items-center justify-center text-white font-bold text-xs">ME</div>
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
                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${senderAvatarUrl})` }} />
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
                        <span className={`text-sm font-bold ${isDark ? 'text-[#13a4ec]' : 'text-indigo-600'}`}>{message.senderName}</span>
                        {message.userTitle && message.userTitle !== 'common' && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${titleBadgeColors[message.userTitle]?.bg || 'bg-slate-100'} ${titleBadgeColors[message.userTitle]?.text || 'text-slate-600'} ${titleBadgeColors[message.userTitle]?.border || 'border-slate-200'}`}>
                                {message.userTitle}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <span className={`text-[10px] shrink-0 pt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{timeStr}</span>
                    <MessageContent isOwn={false} />
                    {/* Toolbar appears inline to the right of message */}
                    <ActionToolbar alignRight={false} />
                </div>

                {reactionCounts.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap ml-12">
                        {reactionCounts.map(({ emoji, count, hasReacted }) => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] transition-colors ${hasReacted
                                    ? 'bg-[#13a4ec]/10 border border-[#13a4ec]/30'
                                    : isDark ? 'bg-[#162032] border border-[#1e3a5f]' : 'bg-slate-50 border border-slate-200'
                                    }`}
                            >
                                <span>{emoji}</span>
                                <span className={hasReacted ? 'text-[#13a4ec]' : isDark ? 'text-slate-400' : 'text-slate-500'}>{count}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
