'use client';

import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import FileMessage from './FileMessage';
import EmojiPicker from './EmojiPicker';

dayjs.extend(relativeTime);

interface MessageBubbleProps {
    message: Message;
    showHeader?: boolean;
}

export default function MessageBubble({ message, showHeader = true }: MessageBubbleProps) {
    const { user } = useAuth();
    const { sendReaction } = useSocket();
    const [showActions, setShowActions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const isOwnMessage = user?.id === message.senderId;
    const isDeleted = message.isDeleted;

    const handleReaction = (emoji: string) => {
        sendReaction({ messageId: message.id, emoji });
    };

    // Format timestamp
    const timeAgo = dayjs(message.createdAt).fromNow();
    const fullTime = dayjs(message.createdAt).format('MMMM D, YYYY h:mm A');

    // Render message content based on type
    const renderContent = () => {
        if (isDeleted) {
            return (
                <div className="text-[#6b7988] italic text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    <span>This message was deleted</span>
                </div>
            );
        }

        // Code snippet
        if (message.codeSnippet) {
            return (
                <CodeBlock
                    code={message.codeSnippet}
                    language={message.codeLanguage || undefined}
                    fileName={message.codeFileName || undefined}
                />
            );
        }

        // Image/File
        if (message.imageUrl || message.fileUrl) {
            return (
                <FileMessage
                    imageUrl={message.imageUrl || undefined}
                    fileUrl={message.fileUrl}
                    fileType={message.fileType}
                    fileName={message.fileName}
                    fileSize={message.fileSize}
                />
            );
        }

        // Formatted text (markdown)
        if (message.isFormatted && message.content) {
            return (
                <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ node, ...props }) => (
                                <a
                                    {...props}
                                    className="text-[#0d7ff2] hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            ),
                            code: ({ node, inline, ...props }) =>
                                inline ? (
                                    <code
                                        {...props}
                                        className="px-1.5 py-0.5 rounded bg-[#16202a] text-[#0d7ff2] font-mono text-sm border border-[#223649]"
                                    />
                                ) : (
                                    <code {...props} className="font-mono text-sm" />
                                ),
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
            );
        }

        // Plain text with @mentions highlighted
        if (message.content) {
            const contentWithMentions = message.content.replace(
                /@(\w+)/g,
                '@<span class="text-[#06b6d4] font-semibold bg-[#06b6d4]/10 px-1 rounded">@$1</span>'
            );

            return (
                <p
                    className="text-[#e0e6ed] text-[15px] leading-relaxed whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: contentWithMentions }}
                />
            );
        }

        return null;
    };

    return (
        <div
            className="group relative px-6 py-1.5 hover:bg-white/[0.02] transition-colors"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex gap-3">
                {/* Avatar (only shown with header) */}
                {showHeader ? (
                    <div className="flex-shrink-0 mt-0.5">
                        {message.sender.avatarUrl ? (
                            <img
                                src={message.sender.avatarUrl}
                                alt={message.sender.username}
                                className="w-9 h-9 rounded-md"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0284c7] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {message.sender.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-9" /> // Spacer for alignment
                )}

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    {showHeader && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-semibold text-white text-[15px] hover:underline cursor-pointer">
                                {message.sender.username}
                            </span>
                            <span
                                className="text-[#6b7988] text-xs cursor-default"
                                title={fullTime}
                            >
                                {timeAgo}
                            </span>
                            {message.isEdited && (
                                <span className="text-[#6b7988] text-xs">(edited)</span>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="text-[#e0e6ed]">
                        {renderContent()}
                    </div>

                    {/* Reply to */}
                    {message.replyToMessage && (
                        <div className="mt-1 pl-3 border-l-2 border-[#223649] text-sm text-[#90adcb] py-1">
                            <div className="font-semibold text-xs text-[#6b7988]">
                                {message.replyToMessage.sender.username}
                            </div>
                            <div className="truncate text-[#90adcb]">
                                {message.replyToMessage.content || message.replyToMessage.codeSnippet || 'File'}
                            </div>
                        </div>
                    )}

                    {/* Reactions Display */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map((reaction) => {
                                const hasReacted = reaction.users.some(u => u.id === user?.id);
                                return (
                                    <button
                                        key={reaction.emoji}
                                        onClick={() => handleReaction(reaction.emoji)}
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm transition-colors ${hasReacted
                                            ? 'bg-[#0d7ff2]/20 border border-[#0d7ff2] text-[#0d7ff2]'
                                            : 'bg-[#223649]/50 hover:bg-[#223649] text-[#90adcb]'
                                            }`}
                                        title={reaction.users.map(u => u.username).join(', ')}
                                    >
                                        <span>{reaction.emoji}</span>
                                        <span className="text-xs">{reaction.count}</span>
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setShowEmojiPicker(true)}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-sm bg-[#223649]/30 hover:bg-[#223649] text-[#6b7988] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[14px]">add</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Bar (visible on hover) */}
            {!isDeleted && showActions && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#16202a] border border-[#223649] rounded-lg shadow-lg flex items-center">
                    <div className="relative">
                        <button
                            className="p-2 hover:bg-[#223649] transition-colors rounded-l-lg"
                            title="Add reaction"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <span className="material-symbols-outlined text-[#90adcb] text-[18px]">add_reaction</span>
                        </button>
                        {showEmojiPicker && (
                            <EmojiPicker
                                onSelect={handleReaction}
                                onClose={() => setShowEmojiPicker(false)}
                            />
                        )}
                    </div>

                    {isOwnMessage && (
                        <>
                            <div className="w-px h-6 bg-[#223649]" />
                            <button
                                className="p-2 hover:bg-[#223649] transition-colors"
                                title="Edit message"
                            >
                                <span className="material-symbols-outlined text-[#90adcb] text-[18px]">edit</span>
                            </button>
                        </>
                    )}

                    <div className="w-px h-6 bg-[#223649]" />
                    <button
                        className="p-2 hover:bg-[#223649] transition-colors"
                        title="Reply"
                    >
                        <span className="material-symbols-outlined text-[#90adcb] text-[18px]">reply</span>
                    </button>

                    {isOwnMessage && (
                        <>
                            <div className="w-px h-6 bg-[#223649]" />
                            <button
                                className="p-2 hover:bg-[#ef4444]/10 transition-colors rounded-r-lg group/delete"
                                title="Delete message"
                            >
                                <span className="material-symbols-outlined text-[#90adcb] group-hover/delete:text-[#ef4444] text-[18px]">delete</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
