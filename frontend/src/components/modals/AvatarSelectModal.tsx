'use client';

import { Avatar } from '@/types';
import { useUser } from '@/contexts/UserContext';

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
    const { settings } = useUser();
    const isDark = settings.theme === 'dark';

    if (!isOpen) return null;

    const handleConfirm = () => {
        onBack();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`rounded-3xl shadow-2xl w-full max-w-[420px] overflow-hidden relative flex flex-col items-center ${isDark
                    ? 'bg-[#182830] border border-[#233c48]'
                    : 'bg-white border border-slate-100'
                }`}>
                {/* Header with back button */}
                <div className="w-full flex items-center justify-between px-6 pt-6">
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

                <div className="pt-4 pb-8 px-8 w-full flex flex-col items-center">
                    {/* Title */}
                    <div className="text-center mb-6">
                        <h2 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Select Avatar
                        </h2>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Choose a predefined look for your profile
                        </p>
                    </div>

                    {/* Avatar grid */}
                    <div className="grid grid-cols-3 gap-4 w-full mb-6">
                        {avatars.map((avatar) => (
                            <button
                                key={avatar.id}
                                onClick={() => onSelect(avatar.id)}
                                className={`relative aspect-square rounded-full overflow-hidden border-4 transition-all hover:scale-105 shadow-lg ${selectedAvatarId === avatar.id
                                        ? 'border-[#13a4ec] ring-2 ring-[#13a4ec]/20'
                                        : isDark
                                            ? 'border-[#233c48] hover:border-[#375a6b]'
                                            : 'border-white hover:border-slate-200'
                                    }`}
                            >
                                {avatar.url ? (
                                    <div
                                        className="w-full h-full bg-cover bg-center bg-gradient-to-br from-[#13a4ec] to-cyan-400"
                                        style={{ backgroundImage: `url(${avatar.url})` }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#13a4ec] to-cyan-400 flex items-center justify-center">
                                        <span className="text-white text-2xl font-bold">{avatar.id}</span>
                                    </div>
                                )}
                                {selectedAvatarId === avatar.id && (
                                    <div className="absolute bottom-0 right-0 bg-[#13a4ec] text-white rounded-full p-1 border-2 border-white">
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Confirm button */}
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-[#13a4ec] hover:bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#13a4ec]/25 transition-all flex items-center justify-center gap-2"
                    >
                        <span>Confirm</span>
                        <span className="material-symbols-outlined">check</span>
                    </button>

                    {/* Upload option - disabled */}
                    <button
                        disabled
                        className={`mt-4 flex items-center gap-2 text-sm cursor-not-allowed ${isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">upload</span>
                        <span>Upload your own image</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark
                                ? 'bg-[#233c48] text-slate-400'
                                : 'bg-slate-100 text-slate-500'
                            }`}>Coming Soon</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
