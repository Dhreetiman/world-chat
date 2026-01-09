'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Avatar } from '@/types';

interface JoinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAvatarClick: () => void;
    avatars: Avatar[];
    selectedAvatarId: number;
    onSubmit: (username: string, avatarId: number) => Promise<void>;
}

export default function JoinModal({
    isOpen,
    onClose,
    onAvatarClick,
    avatars,
    selectedAvatarId,
    onSubmit,
}: JoinModalProps) {
    const { user, settings } = useUser();
    const isDark = settings.theme === 'dark';
    const [username, setUsername] = useState(user?.username || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const selectedAvatar = avatars.find(a => a.id === selectedAvatarId) || avatars[0];

    const handleSubmit = async () => {
        if (!username.trim() || username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onSubmit(username.trim(), selectedAvatarId);
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to set username';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
            <div className={`rounded-2xl w-full max-w-md overflow-hidden relative ${isDark
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

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className={`text-3xl font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Welcome! 👋
                        </h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Set up your profile to join the conversation
                        </p>
                    </div>

                    {/* Avatar Section */}
                    <div className="mb-8">
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Your Avatar
                        </label>
                        <div
                            onClick={onAvatarClick}
                            className={`relative w-full rounded-xl p-4 cursor-pointer transition-all group ${isDark
                                ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#13a4ec]/50'
                                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-[#13a4ec]/50'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Avatar Preview */}
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#13a4ec]/20 group-hover:ring-[#13a4ec]/50 transition-all">
                                        {user?.customAvatarUrl ? (
                                            <div
                                                className="w-full h-full bg-cover bg-center"
                                                style={{ backgroundImage: `url(${user.customAvatarUrl})` }}
                                            />
                                        ) : selectedAvatar?.url ? (
                                            <div
                                                className="w-full h-full bg-cover bg-center"
                                                style={{ backgroundImage: `url(${selectedAvatar.url})` }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#13a4ec] to-cyan-400 flex items-center justify-center">
                                                <span className="text-white text-2xl font-bold">
                                                    {username.charAt(0).toUpperCase() || 'G'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Text */}
                                <div className="flex-1">
                                    <p className={`text-sm font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Click to change
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                        Choose from presets or upload custom
                                    </p>
                                </div>

                                {/* Arrow Icon */}
                                <div className={`transition-transform group-hover:translate-x-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Username Input */}
                    <div className="mb-6">
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Display Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter your name"
                                maxLength={20}
                                className={`w-full px-4 py-3.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#13a4ec]/50 transition-all ${isDark
                                    ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:bg-white/10'
                                    : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                                    }`}
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Enter Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !username.trim()}
                        className="w-full bg-gradient-to-r from-[#13a4ec] to-sky-500 hover:from-sky-500 hover:to-[#13a4ec] text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#13a4ec]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <span>{isSubmitting ? 'Joining...' : 'Enter Chat'}</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>

                    {/* Footer */}
                    <div className={`mt-6 flex items-center justify-center gap-2 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        <span>No registration required • Anonymous chat</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
