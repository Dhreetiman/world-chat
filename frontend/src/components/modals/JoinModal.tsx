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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`rounded-3xl shadow-2xl w-full max-w-[420px] overflow-hidden relative flex flex-col items-center ${isDark
                ? 'bg-[#182830] border border-[#233c48]'
                : 'bg-white border border-slate-100'
                }`}>
                {/* Gradient overlay */}
                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#13a4ec]/10 to-transparent pointer-events-none" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 transition-colors z-20 ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="pt-10 pb-8 px-8 w-full flex flex-col items-center relative z-10">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Join Conversation
                        </h2>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Customize how you appear to others
                        </p>
                    </div>

                    {/* Avatar preview */}
                    <div
                        className="relative group cursor-pointer mb-8"
                        onClick={onAvatarClick}
                    >
                        <div className={`w-32 h-32 rounded-full border-[6px] shadow-xl bg-gradient-to-br from-[#13a4ec] to-cyan-400 flex items-center justify-center overflow-hidden relative ${isDark ? 'border-[#233c48]' : 'border-slate-50'
                            }`}>
                            {/* Show custom avatar if available, otherwise show predefined */}
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
                                <span className="text-white text-4xl font-bold">
                                    {username.charAt(0).toUpperCase() || 'G'}
                                </span>
                            )}
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <span className="material-symbols-outlined text-white text-3xl">edit</span>
                            </div>
                        </div>
                        <button className={`absolute bottom-1 right-1 bg-[#13a4ec] text-white rounded-full p-2.5 shadow-md border-4 hover:bg-sky-500 transition-colors group-hover:scale-110 ${isDark ? 'border-[#182830]' : 'border-white'
                            }`}>
                            <span className="material-symbols-outlined text-[18px] leading-none">edit</span>
                        </button>
                    </div>

                    {/* Username input */}
                    <div className="w-full space-y-5">
                        <div className="space-y-1.5">
                            <label className={`text-xs font-bold uppercase tracking-wider ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                Display Name
                            </label>
                            <div className="relative group focus-within:text-[#13a4ec]">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#13a4ec] transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-[22px]">person</span>
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Enter username"
                                    maxLength={20}
                                    className={`w-full border rounded-xl py-3.5 pl-12 pr-4 font-semibold focus:outline-none focus:ring-2 focus:ring-[#13a4ec]/20 focus:border-[#13a4ec] transition-all shadow-sm ${isDark
                                        ? 'bg-[#101c22] border-[#233c48] text-white placeholder:text-slate-500'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
                                        }`}
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-xs ml-1">{error}</p>
                            )}
                        </div>

                        {/* Submit button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !username.trim()}
                            className="w-full bg-[#13a4ec] hover:bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#13a4ec]/25 transition-all hover:translate-y-[-1px] active:translate-y-[1px] flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>{isSubmitting ? 'Saving...' : 'Enter Chat'}</span>
                            <span className="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </button>
                    </div>

                    {/* No registration note */}
                    <div className={`mt-6 flex items-center gap-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        <span>No registration required</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
