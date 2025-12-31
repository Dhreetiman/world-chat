'use client';

import { useUser } from '@/contexts/UserContext';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const { settings, updateTheme } = useUser();
    const isDark = settings.theme === 'dark';

    if (!isOpen) return null;

    const handleThemeToggle = () => {
        updateTheme(isDark ? 'light' : 'dark');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`fixed right-0 top-0 h-full w-full max-w-md z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                } ${isDark ? 'bg-[#0f1a2b]' : 'bg-white'
                } shadow-2xl`}>
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-[#1e3a5f]' : 'border-slate-200'
                    }`}>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-[#162032]' : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Theme setting */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#162032] border border-[#1e3a5f]' : 'bg-slate-50 border border-slate-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1e3a5f] text-yellow-400' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    <span className="material-symbols-outlined">
                                        {isDark ? 'dark_mode' : 'light_mode'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Theme
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {isDark ? 'Dark mode' : 'Light mode'}
                                    </p>
                                </div>
                            </div>

                            {/* Toggle switch */}
                            <button
                                onClick={handleThemeToggle}
                                className={`relative w-14 h-8 rounded-full transition-colors ${isDark ? 'bg-[#13a4ec]' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${isDark ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications setting */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#162032] border border-[#1e3a5f]' : 'bg-slate-50 border border-slate-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#1e3a5f] text-[#13a4ec]' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    <span className="material-symbols-outlined">notifications</span>
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Notifications
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Sound & desktop alerts
                                    </p>
                                </div>
                            </div>

                            {/* Toggle switch - enabled by default */}
                            <button
                                className={`relative w-14 h-8 rounded-full transition-colors ${settings.notifications ? 'bg-[#13a4ec]' : isDark ? 'bg-[#1e3a5f]' : 'bg-slate-300'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>
                    </div>

                    {/* Info section */}
                    <div className={`mt-8 p-4 rounded-xl ${isDark ? 'bg-[#162032]/50' : 'bg-slate-50'
                        }`}>
                        <p className={`text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Open World Chat v1.0.0<br />
                            Messages are automatically deleted after 24 hours
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
