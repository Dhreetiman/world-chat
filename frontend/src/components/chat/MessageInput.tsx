'use client';

import { useState, KeyboardEvent } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { useChat } from '@/contexts/ChatContext';
import CustomEmojiPicker from './CustomEmojiPicker';

interface MessageInputProps {
    onUsernameClick: () => void;
}

export default function MessageInput({ onUsernameClick }: MessageInputProps) {
    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);


    const { user, settings, isUsernameSet } = useUser();
    const { sendMessage, isConnected } = useSocket();
    const { replyingTo, setReplyingTo, inputRef } = useChat(); // inputRef added here

    const isDark = settings.theme === 'dark';

    const handleSubmit = () => {
        if (!content.trim() || !isConnected) return;

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

    const handleEmojiSelect = (emoji: string) => {
        setContent(prev => prev + emoji);
        inputRef.current?.focus();
    };

    return (
        <div className={`px-4 py-3 z-20 border-t ${isDark
            ? 'bg-[#101c22]/95 backdrop-blur border-[#233c48]'
            : 'bg-white/95 backdrop-blur border-slate-200'
            }`}>
            <div className="flex flex-col gap-2 max-w-4xl mx-auto w-full">
                {/* Reply preview */}
                {replyingTo && (
                    <div className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${isDark
                        ? 'bg-[#182830] border border-[#233c48]'
                        : 'bg-slate-50 border border-slate-200'
                        }`}>
                        <div className="flex items-center gap-2 text-xs overflow-hidden">
                            <span className="material-symbols-outlined text-[#13a4ec] text-base">reply</span>
                            <span className={isDark ? 'text-[#92b7c9]' : 'text-slate-500'}>Replying to</span>
                            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {replyingTo.senderName}
                            </span>
                            <span className={`truncate ${isDark ? 'text-[#92b7c9]' : 'text-slate-500'}`}>
                                {replyingTo.content?.slice(0, 30)}...
                            </span>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            className={`p-0.5 rounded outline-none ${isDark ? 'hover:bg-[#233c48]' : 'hover:bg-slate-200'}`}
                        >
                            <span className={`material-symbols-outlined text-sm ${isDark ? 'text-[#92b7c9]' : 'text-slate-500'}`}>
                                close
                            </span>
                        </button>
                    </div>
                )}

                {/* Username bar */}
                <div className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${isDark
                    ? 'bg-[#13a4ec]/10 border border-[#13a4ec]/20'
                    : 'bg-[#13a4ec]/5 border border-[#13a4ec]/20'
                    }`}>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="material-symbols-outlined text-[#13a4ec] text-base">face</span>
                        <span className={isDark ? 'text-[#92b7c9]' : 'text-slate-500'}>Chatting as:</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded border text-xs ${isDark
                            ? 'text-white bg-[#182830] border-[#233c48]'
                            : 'text-slate-900 bg-white border-slate-200'
                            }`}>
                            {user?.username || 'Guest'}
                        </span>
                    </div>
                    <button
                        onClick={onUsernameClick}
                        className="text-[10px] font-bold text-[#13a4ec] hover:text-sky-400 transition-colors uppercase tracking-wide outline-none"
                    >
                        Change Name
                    </button>
                </div>

                {/* Input Box */}
                <div className={`relative flex items-center gap-1 rounded-2xl px-2 py-1 transition-all ${isDark
                    ? 'bg-[#182830] border border-[#233c48] focus-within:border-[#13a4ec]/50'
                    : 'bg-slate-50 border border-slate-200 focus-within:border-[#13a4ec]/50'
                    }`}>
                    {/* Custom Emoji Picker */}
                    <CustomEmojiPicker
                        isOpen={showEmojiPicker}
                        onClose={() => setShowEmojiPicker(false)}
                        onEmojiSelect={handleEmojiSelect}
                        isDark={isDark}
                    />

                    {/* Attachment button */}
                    <button
                        disabled
                        className="size-8 flex items-center justify-center rounded-lg opacity-50 cursor-not-allowed outline-none text-[#92b7c9]"
                        title="Add Attachment"
                    >
                        <span className="material-symbols-outlined text-xl">add_circle</span>
                    </button>

                    {/* Textarea */}
                    <textarea
                        ref={inputRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className={`flex-1 bg-transparent border-none outline-none focus:ring-0 focus:outline-none resize-none py-2 text-sm leading-relaxed ${isDark
                            ? 'text-white placeholder-[#5e7a8a]'
                            : 'text-slate-900 placeholder-slate-400'
                            }`}
                        style={{ minHeight: '36px', maxHeight: '80px' }}
                    />

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 shrink-0">
                        {/* Emoji picker button */}
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`size-8 flex items-center justify-center rounded-lg transition-colors outline-none ${showEmojiPicker
                                ? 'bg-[#233c48] text-[#13a4ec]'
                                : isDark
                                    ? 'text-[#92b7c9] hover:text-[#13a4ec] hover:bg-[#233c48]'
                                    : 'text-slate-400 hover:text-[#13a4ec] hover:bg-slate-100'
                                }`}
                            title="Emoji"
                        >
                            <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
                        </button>

                        {/* Send button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!content.trim() || !isConnected}
                            className="size-8 bg-[#13a4ec] hover:bg-sky-500 text-white rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 outline-none"
                        >
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
