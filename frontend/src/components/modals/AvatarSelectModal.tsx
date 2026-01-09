'use client';

import { Avatar } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useState, useRef } from 'react';

interface AvatarSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    avatars: Avatar[];
    selectedAvatarId: number;
    onSelect: (avatarId: number) => void;
    onSubmit: (username: string, avatarId: number) => Promise<void>;
}

export default function AvatarSelectModal({
    isOpen,
    onClose,
    avatars,
    selectedAvatarId,
    onSelect,
    onSubmit,
}: AvatarSelectModalProps) {
    const { settings, user, uploadAvatar, deleteAvatar } = useUser();
    const isDark = settings.theme === 'dark';

    const [username, setUsername] = useState(user?.username || '');
    const [currentIndex, setCurrentIndex] = useState(
        user?.customAvatarUrl ? 0 : avatars.findIndex(a => a.id === selectedAvatarId) || 0
    );
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // Type for carousel items (includes custom avatar)
    type CarouselAvatar = Avatar & { isCustom?: boolean };

    // Include custom avatar in the carousel
    const allAvatars: CarouselAvatar[] = user?.customAvatarUrl
        ? [{ id: -1, name: 'Custom', url: user.customAvatarUrl, isCustom: true }, ...avatars]
        : avatars;

    const currentAvatar = allAvatars[currentIndex];
    const prevAvatar = allAvatars[(currentIndex - 1 + allAvatars.length) % allAvatars.length];
    const nextAvatar = allAvatars[(currentIndex + 1) % allAvatars.length];

    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + allAvatars.length) % allAvatars.length;
        setCurrentIndex(newIndex);
        const newAvatar = allAvatars[newIndex];
        if (!newAvatar.isCustom) {
            onSelect(newAvatar.id);
        }
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % allAvatars.length;
        setCurrentIndex(newIndex);
        const newAvatar = allAvatars[newIndex];
        if (!newAvatar.isCustom) {
            onSelect(newAvatar.id);
        }
    };

    const handleSubmit = async () => {
        if (!username.trim() || username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // If user has custom avatar but selected a predefined one, delete custom avatar
            if (user?.customAvatarUrl && !currentAvatar.isCustom) {
                await deleteAvatar();
            }

            const avatarIdToSubmit = currentAvatar.isCustom ? selectedAvatarId : currentAvatar.id;
            if (!currentAvatar.isCustom) {
                onSelect(currentAvatar.id);
            }
            await onSubmit(username.trim(), avatarIdToSubmit);
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setError('Only JPG, PNG, WebP allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Max 5MB');
            return;
        }

        setIsUploading(true);

        try {
            await uploadAvatar(file);
            setIsUploading(false);
            setCurrentIndex(0); // Move to custom avatar
        } catch (error: any) {
            setError(error.message || 'Upload failed');
            setIsUploading(false);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteCustom = async () => {
        try {
            await deleteAvatar();
            setCurrentIndex(0); // Move to first predefined avatar
        } catch (error: any) {
            setError(error.message || 'Failed to delete');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            <div className={`rounded-3xl w-full max-w-[540px] overflow-hidden relative ${isDark
                ? 'bg-gradient-to-br from-[#1a2332] to-[#0f1419]'
                : 'bg-gradient-to-br from-white to-slate-50'
                }`}>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-5 right-5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDark
                        ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                        : 'bg-black/5 hover:bg-black/10 text-slate-500 hover:text-slate-900'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div className="p-8 md:p-10 flex flex-col items-center">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Welcome! 👋
                        </h2>
                        <p className={`text-lg mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Set up your profile to get started
                        </p>
                    </div>

                    {/* Username Input */}
                    <div className="w-full mb-8">
                        <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError(null);
                            }}
                            placeholder="Enter your name"
                            maxLength={20}
                            className={`w-full px-4 py-3.5 rounded-xl font-semibold text-lg text-center focus:outline-none focus:ring-2 focus:ring-[#13a4ec]/50 transition-all ${isDark
                                ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:bg-white/10'
                                : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                                }`}
                        />
                    </div>

                    {/* Carousel */}
                    <div className="relative w-full flex items-center justify-center gap-4 mb-8">
                        {/* Left Arrow */}
                        <button
                            onClick={handlePrev}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#13a4ec] to-sky-500 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#13a4ec]/30"
                        >
                            <span className="material-symbols-outlined text-2xl font-bold">chevron_left</span>
                        </button>

                        {/* Avatars */}
                        <div className="flex items-center gap-4">
                            {/* Prev (faded) */}
                            <div className="hidden sm:block w-20 h-20 rounded-full opacity-20 grayscale transform scale-75 border-2 border-slate-700/50 overflow-hidden">
                                {prevAvatar.url ? (
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${prevAvatar.url})` }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#13a4ec] to-cyan-400" />
                                )}
                            </div>

                            {/* Current (large) */}
                            <div className="relative group">
                                <div className={`absolute -inset-4 bg-gradient-to-tr from-[#13a4ec]/40 via-sky-500/40 to-cyan-400/40 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity`} />
                                <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full p-2 ring-4 overflow-hidden ${isDark ? 'ring-slate-800 bg-slate-800' : 'ring-slate-200 bg-slate-200'}`}
                                    style={{ boxShadow: '0 0 30px rgba(19, 164, 236, 0.3)' }}
                                >
                                    {currentAvatar.url ? (
                                        <div
                                            className="w-full h-full rounded-full bg-cover bg-center"
                                            style={{ backgroundImage: `url(${currentAvatar.url})` }}
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#13a4ec] to-cyan-400 flex items-center justify-center">
                                            <span className="text-white text-5xl font-bold">{currentAvatar.id}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Checkmark */}
                                <div className="absolute -bottom-1 right-2 bg-[#13a4ec] text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-bounce">
                                    <span className="material-symbols-outlined text-lg font-bold">check</span>
                                </div>
                                {/* Delete button for custom */}
                                {currentAvatar.isCustom && (
                                    <button
                                        onClick={handleDeleteCustom}
                                        className="absolute top-1 right-2 p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all"
                                        title="Remove custom avatar"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                    </button>
                                )}
                            </div>

                            {/* Next (faded) */}
                            <div className="hidden sm:block w-20 h-20 rounded-full opacity-20 grayscale transform scale-75 border-2 border-slate-700/50 overflow-hidden">
                                {nextAvatar.url ? (
                                    <div
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${nextAvatar.url})` }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#13a4ec] to-cyan-400" />
                                )}
                            </div>
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={handleNext}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-pink-500/30"
                        >
                            <span className="material-symbols-outlined text-2xl font-bold">chevron_right</span>
                        </button>
                    </div>

                    {/* Upload Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={`mb-6 px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${isUploading
                            ? 'opacity-50 cursor-not-allowed'
                            : isDark
                                ? 'bg-white/5 text-[#13a4ec] hover:bg-white/10'
                                : 'bg-slate-100 text-[#13a4ec] hover:bg-slate-200'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {isUploading ? 'hourglass_empty' : 'add_a_photo'}
                        </span>
                        <span>{isUploading ? 'Uploading...' : 'Upload Custom Image'}</span>
                    </button>

                    {/* Error */}
                    {error && (
                        <div className="text-sm text-red-400 px-4 py-2 bg-red-500/10 rounded-lg mb-4 w-full text-center flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !username.trim()}
                        className="w-full bg-gradient-to-r from-[#ff7e21] to-[#ff8f40] hover:from-[#ff8f40] hover:to-[#ff7e21] text-white text-xl font-black py-5 rounded-3xl shadow-[0_8px_0_#9a4508] transition-all hover:translate-y-[2px] hover:shadow-[0_6px_0_#9a4508] active:translate-y-[6px] active:shadow-none flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-[0_8px_0_#9a4508]"
                    >
                        <span>{isSubmitting ? 'Saving...' : "Let's Go!"}</span>
                        <span className="material-symbols-outlined text-2xl font-bold">rocket_launch</span>
                    </button>

                    {/* Footer */}
                    <div className={`mt-6 flex items-center justify-center gap-2 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        <span>No registration required • Anonymous chat</span>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
}
