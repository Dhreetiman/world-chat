'use client';

import { Avatar } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useState, useRef } from 'react';

interface AvatarSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
    avatars: Avatar[];
    selectedAvatarId: number;
    onSelect: (avatarId: number) => void;
}

export default function AvatarSelectModal({
    isOpen,
    onClose,
    onBack,
    avatars,
    selectedAvatarId,
    onSelect,
}: AvatarSelectModalProps) {
    const { settings, user, uploadAvatar, deleteAvatar } = useUser();
    const isDark = settings.theme === 'dark';

    const [uploadingFile, setUploadingFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onBack();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset states
        setUploadError(null);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Only JPG, PNG, and WebP images are allowed');
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setUploadError('File too large. Maximum size is 5MB');
            return;
        }

        // Create preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setUploadingFile(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!uploadingFile) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        try {
            // Simulate progress (since we don't have real progress from fetch)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            await uploadAvatar(uploadingFile);

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Clear upload state
            setTimeout(() => {
                setUploadingFile(null);
                setPreviewUrl(null);
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);
        } catch (error: any) {
            setUploadError(error.message || 'Upload failed');
            setIsUploading(false);
        }
    };

    const handleCancelUpload = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setUploadingFile(null);
        setPreviewUrl(null);
        setUploadError(null);
        setUploadProgress(0);
    };

    const handleDeleteCustomAvatar = async () => {
        try {
            await deleteAvatar();
        } catch (error: any) {
            setUploadError(error.message || 'Failed to delete avatar');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`rounded-3xl shadow-2xl w-full max-w-[480px] max-h-[85vh] overflow-hidden relative flex flex-col ${isDark
                ? 'bg-[#182830] border border-[#233c48]'
                : 'bg-white border border-slate-100'
                }`}>
                {/* Header with back button */}
                <div className="w-full flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
                    <button
                        onClick={onBack}
                        className={`flex items-center gap-1 transition-colors text-sm ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span>Back</span>
                    </button>
                    <button
                        onClick={onClose}
                        className={`transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Title */}
                <div className="text-center px-6 pb-4 shrink-0">
                    <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Select Avatar
                    </h2>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Choose a predefined look or upload your own
                    </p>
                </div>

                {/* Upload preview */}
                {uploadingFile && previewUrl && (
                    <div className={`mx-6 mb-4 p-3 rounded-lg border ${isDark ? 'bg-[#233c48]/30 border-[#233c48]' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            <img src={previewUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {uploadingFile.name}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {(uploadingFile.size / 1024).toFixed(1)} KB
                                </p>
                                {isUploading && (
                                    <div className="mt-2">
                                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#182830]' : 'bg-slate-200'}`}>
                                            <div
                                                className="h-full bg-[#13a4ec] transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            {!isUploading && (
                                <button
                                    onClick={handleCancelUpload}
                                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#182830] text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            )}
                        </div>
                        {!isUploading && (
                            <button
                                onClick={handleUpload}
                                className="w-full mt-3 bg-[#13a4ec] hover:bg-sky-500 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                            >
                                Upload & Use
                            </button>
                        )}
                    </div>
                )}

                {/* Error message */}
                {uploadError && (
                    <div className="mx-6 mb-4 text-xs text-red-500 px-3 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                        {uploadError}
                    </div>
                )}

                {/* Scrollable Avatar grid */}
                <div className={`flex-1 overflow-y-auto px-6 pb-4 ${isDark ? 'scrollbar-dark' : 'scrollbar-light'
                    }`}>
                    <div className="grid grid-cols-4 gap-3">
                        {/* Custom avatar if exists */}
                        {user?.customAvatarUrl && (
                            <div className="aspect-square relative">
                                <button
                                    onClick={() => {/* Custom avatar is always active */ }}
                                    className={`w-full h-full relative rounded-full overflow-hidden border-[3px] transition-all shadow-md border-[#13a4ec] ring-2 ring-[#13a4ec]/30 scale-105`}
                                >
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${user.customAvatarUrl})` }}
                                    />
                                    <div className="absolute bottom-0 right-0 bg-[#13a4ec] text-white rounded-full p-0.5 border-2 border-white">
                                        <span className="material-symbols-outlined text-xs">check</span>
                                    </div>
                                </button>
                                {/* Delete button */}
                                <button
                                    onClick={handleDeleteCustomAvatar}
                                    className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md z-10"
                                    title="Remove custom avatar"
                                >
                                    <span className="material-symbols-outlined text-xs">close</span>
                                </button>
                            </div>
                        )}

                        {/* Predefined avatars */}
                        {avatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                onClick={() => onSelect(avatar.id)}
                                disabled={!!user?.customAvatarUrl}
                                className={`relative aspect-square rounded-full overflow-hidden border-[3px] transition-all hover:scale-105 shadow-md ${!user?.customAvatarUrl && selectedAvatarId === avatar.id
                                    ? 'border-[#13a4ec] ring-2 ring-[#13a4ec]/30 scale-105'
                                    : isDark
                                        ? 'border-[#233c48] hover:border-[#375a6b]'
                                        : 'border-slate-200 hover:border-slate-300'
                                    } ${user?.customAvatarUrl ? 'opacity-50' : ''}`}
                            >
                                {avatar.url ? (
                                    <div
                                        className="w-full h-full bg-cover bg-center bg-gradient-to-br from-[#13a4ec] to-cyan-400"
                                        style={{ backgroundImage: `url(${avatar.url})` }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#13a4ec] to-cyan-400 flex items-center justify-center">
                                        <span className="text-white text-lg font-bold">{avatar.id}</span>
                                    </div>
                                )}
                                {!user?.customAvatarUrl && selectedAvatarId === avatar.id && (
                                    <div className="absolute bottom-0 right-0 bg-[#13a4ec] text-white rounded-full p-0.5 border-2 border-white">
                                        <span className="material-symbols-outlined text-xs">check</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer with buttons */}
                <div className={`px-6 py-4 shrink-0 border-t ${isDark ? 'border-[#233c48]' : 'border-slate-100'}`}>
                    {/* Confirm button */}
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-[#13a4ec] hover:bg-sky-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#13a4ec]/25 transition-all flex items-center justify-center gap-2"
                    >
                        <span>Confirm</span>
                        <span className="material-symbols-outlined text-lg">check</span>
                    </button>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Upload option - enabled */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`mt-3 w-full flex items-center justify-center gap-2 text-xs transition-colors ${isUploading
                            ? 'opacity-50 cursor-not-allowed'
                            : isDark
                                ? 'text-[#13a4ec] hover:text-sky-400'
                                : 'text-[#13a4ec] hover:text-sky-600'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">upload</span>
                        <span>Upload your own image</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
