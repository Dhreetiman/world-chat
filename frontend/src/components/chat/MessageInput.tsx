'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { useChat } from '@/contexts/ChatContext';
import dynamic from 'next/dynamic';

// Dynamic import for emoji picker to reduce initial bundle size
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
import { Theme } from 'emoji-picker-react';

interface MessageInputProps {
    onUsernameClick: () => void;
}

export default function MessageInput({ onUsernameClick }: MessageInputProps) {
    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { user, settings, isUsernameSet } = useUser();
    const { sendMessage, isConnected } = useSocket();
    const { replyingTo, setReplyingTo } = useChat();

    const isDark = settings.theme === 'dark';

    const handleSubmit = () => {
        if (!content.trim() || !isConnected) return;

        // If username not set, open modal
        if (!isUsernameSet) {
            onUsernameClick();
            return;
        }

        sendMessage({
            content: content.trim(),
            replyToMessageId: replyingTo?.id,
        });

        setContent('');
        setReplyingTo(null);
        setShowEmojiPicker(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleEmojiSelect = (emojiData: { emoji: string }) => {
        setContent(prev => prev + emojiData.emoji);
        textareaRef.current?.focus();
    };

    return (
        <div className={`p-4 md:p-6 z-20 border-t ${isDark
            ? 'bg-[#0f1a2b]/90 backdrop-blur border-[#1e3a5f]'
            : 'bg-white/90 backdrop-blur border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]'
            }`}>
            <div className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
                {/* Reply preview */}
                {replyingTo && (
                    <div className={`flex items-center justify-between rounded-lg px-4 py-2 ${isDark
                        ? 'bg-[#162032] border border-[#1e3a5f]'
                        : 'bg-slate-50 border border-slate-200'
                        }`}>
                        <div className="flex items-center gap-2 text-sm overflow-hidden">
                            <span className="material-symbols-outlined text-[#13a4ec] text-lg">reply</span>
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Replying to</span>
                            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {replyingTo.senderName}
                            </span>
                            <span className={`truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {replyingTo.content?.slice(0, 30)}...
                            </span>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className={`p-1 rounded ${isDark ? 'hover:bg-[#1e3a5f]' : 'hover:bg-slate-200'}`}
                        >
                            <span className={`material-symbols-outlined text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                close
                            </span>
                        </button>
                    </div>
                )}

                {/* Username bar */}
                <div className={`flex items-center justify-between rounded-lg px-4 py-2 ${isDark
                    ? 'bg-[#13a4ec]/10 border border-[#13a4ec]/20'
                    : 'bg-[#13a4ec]/5 border border-[#13a4ec]/20'
                    }`}>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[#13a4ec] text-lg">face</span>
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>Chatting as:</span>
                        <span className={`font-bold px-2 py-0.5 rounded border ${isDark
                            ? 'text-white bg-[#162032] border-[#1e3a5f] shadow-sm'
                            : 'text-slate-900 bg-white border-slate-200 shadow-sm'
                            }`}>
                            {user?.username || 'Guest'}
                        </span>
                    </div>
                    <button
                        onClick={onUsernameClick}
                        className="text-xs font-bold text-[#13a4ec] hover:text-sky-400 transition-colors uppercase tracking-wide"
                    >
                        Change Name
                    </button>
                </div>

                {/* Input area */}
                <div className={`relative flex items-end gap-2 rounded-2xl p-2 transition-all ${isDark
                    ? 'bg-[#162032] border border-[#1e3a5f] focus-within:border-[#13a4ec]/50 focus-within:shadow-[0_0_0_1px_rgba(19,164,236,0.3)]'
                    : 'bg-slate-50 border border-slate-200 focus-within:border-[#13a4ec]/50 focus-within:shadow-[0_0_0_1px_rgba(19,164,236,0.3)] focus-within:bg-white'
                    }`}>
                    {/* Attachment button - disabled for now */}
                    <button
                        disabled
                        className={`p-2 rounded-xl transition-colors shrink-0 opacity-50 cursor-not-allowed ${isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}
                        title="Coming soon"
                    >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className={`w-full bg-transparent border-none focus:ring-0 resize-none py-3 max-h-32 text-sm leading-relaxed ${isDark
                            ? 'text-white placeholder-slate-500'
                            : 'text-slate-900 placeholder-slate-400'
                            }`}
                        style={{ minHeight: '44px' }}
                    />

                    <div className="flex items-center gap-1 shrink-0 pb-1">
                        {/* Emoji picker */}
                        <div className="relative">
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-2 rounded-xl transition-colors ${isDark
                                    ? 'text-slate-400 hover:text-[#13a4ec] hover:bg-[#1e3a5f]'
                                    : 'text-slate-400 hover:text-[#13a4ec] hover:bg-slate-100'
                                    }`}
                                title="Emoji"
                            >
                                <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute bottom-full right-0 mb-2 z-50">
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiSelect}
                                        theme={isDark ? Theme.DARK : Theme.LIGHT}
                                        width={320}
                                        height={400}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Send button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim() || !isConnected}
                            className="p-2.5 bg-[#13a4ec] hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-[#13a4ec]/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <span className="material-symbols-outlined text-xl leading-none">send</span>
                        </button>
                    </div>
                </div>

                {/* Help text */}
                <p className={`text-center text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Press <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Enter</span> to send. Messages are not saved permanently.
                </p>
            </div>
        </div>
    );
}
