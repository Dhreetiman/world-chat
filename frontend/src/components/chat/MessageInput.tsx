'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useSocket } from '@/contexts/SocketContext';
import { useChat } from '@/contexts/ChatContext';
import CustomEmojiPicker from './CustomEmojiPicker';
import FilePreview from './FilePreview';

interface MessageInputProps {
    onUsernameClick: () => void;
}

// File size limits
const FILE_SIZE_LIMITS = {
    video: 60 * 1024 * 1024, // 60 MB
    default: 20 * 1024 * 1024, // 20 MB
};

// Allowed file types
const ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const getFileCategory = (mimeType: string): 'image' | 'video' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
};

export default function MessageInput({ onUsernameClick }: MessageInputProps) {
    const [content, setContent] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user, settings, isUsernameSet } = useUser();
    const { sendMessage, isConnected } = useSocket();
    const { replyingTo, setReplyingTo, inputRef } = useChat();

    const isDark = settings.theme === 'dark';

    // Generate preview URL for image/video files
    useEffect(() => {
        if (selectedFile) {
            const category = getFileCategory(selectedFile.type);
            if (category === 'image' || category === 'video') {
                const url = URL.createObjectURL(selectedFile);
                setFilePreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        }
        setFilePreviewUrl(null);
    }, [selectedFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset error
        setUploadError(null);

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setUploadError('File type not supported');
            return;
        }

        // Validate file size
        const category = getFileCategory(file.type);
        const limit = category === 'video' ? FILE_SIZE_LIMITS.video : FILE_SIZE_LIMITS.default;
        if (file.size > limit) {
            const limitMB = Math.round(limit / 1024 / 1024);
            setUploadError(`File too large. Maximum: ${limitMB}MB for ${category}s`);
            return;
        }

        setSelectedFile(file);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCancelFile = () => {
        setSelectedFile(null);
        setFilePreviewUrl(null);
        setUploadError(null);
    };

    const uploadToS3 = async (file: File): Promise<string> => {
        // 1. Get pre-signed URL from backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/presigned-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to get upload URL');
        }

        const { data } = await response.json();
        const { uploadUrl, fileUrl } = data;

        // 2. Upload directly to S3 with progress tracking
        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(percent);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    console.error('S3 upload error:', xhr.status, xhr.statusText, xhr.responseText);
                    reject(new Error(`S3 upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', (e) => {
                console.error('XHR error:', e);
                reject(new Error('Network error during upload. Check S3 CORS configuration.'));
            });

            xhr.open('PUT', uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });

        return fileUrl;
    };

    const handleSubmit = async () => {
        if ((!content.trim() && !selectedFile) || !isConnected) return;

        if (!isUsernameSet) {
            onUsernameClick();
            return;
        }

        try {
            let fileUrl: string | undefined;
            let fileType: string | undefined;
            let fileName: string | undefined;
            let fileSize: number | undefined;

            // Upload file if selected
            if (selectedFile) {
                setIsUploading(true);
                setUploadProgress(0);

                fileUrl = await uploadToS3(selectedFile);
                fileType = selectedFile.type;
                fileName = selectedFile.name;
                fileSize = selectedFile.size;
            }

            // Send message
            sendMessage({
                content: content.trim() || undefined,
                fileUrl,
                fileType,
                fileName,
                fileSize,
                replyToMessageId: replyingTo?.id,
            });

            // Reset state
            setContent('');
            setSelectedFile(null);
            setFilePreviewUrl(null);
            setReplyingTo(null);
            setShowEmojiPicker(false);
            setUploadError(null);
        } catch (error: any) {
            setUploadError(error.message || 'Upload failed');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
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

                {/* File preview */}
                {selectedFile && (
                    <FilePreview
                        file={selectedFile}
                        previewUrl={filePreviewUrl}
                        uploadProgress={uploadProgress}
                        isUploading={isUploading}
                        onCancel={handleCancelFile}
                        isDark={isDark}
                    />
                )}

                {/* Upload error */}
                {uploadError && (
                    <div className="text-xs text-red-500 px-3 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                        {uploadError}
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

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_FILE_TYPES.join(',')}
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Attachment button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`size-8 flex items-center justify-center rounded-lg transition-colors outline-none ${isUploading
                            ? 'opacity-50 cursor-not-allowed text-[#92b7c9]'
                            : isDark
                                ? 'text-[#92b7c9] hover:text-[#13a4ec] hover:bg-[#233c48]'
                                : 'text-slate-400 hover:text-[#13a4ec] hover:bg-slate-100'
                            }`}
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
                        disabled={isUploading}
                        className={`flex-1 bg-transparent border-none outline-none focus:ring-0 focus:outline-none resize-none py-2 text-sm leading-relaxed ${isDark
                            ? 'text-white placeholder-[#5e7a8a]'
                            : 'text-slate-900 placeholder-slate-400'
                            } ${isUploading ? 'opacity-50' : ''}`}
                        style={{ minHeight: '36px', maxHeight: '80px' }}
                    />

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 shrink-0">
                        {/* Emoji picker button */}
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            disabled={isUploading}
                            className={`size-8 flex items-center justify-center rounded-lg transition-colors outline-none ${showEmojiPicker
                                ? 'bg-[#233c48] text-[#13a4ec]'
                                : isDark
                                    ? 'text-[#92b7c9] hover:text-[#13a4ec] hover:bg-[#233c48]'
                                    : 'text-slate-400 hover:text-[#13a4ec] hover:bg-slate-100'
                                } ${isUploading ? 'opacity-50' : ''}`}
                            title="Emoji"
                        >
                            <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
                        </button>

                        {/* Send button */}
                        <button
                            onClick={handleSubmit}
                            disabled={(!content.trim() && !selectedFile) || !isConnected || isUploading}
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
