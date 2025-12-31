'use client';

import { useChat } from '@/contexts/ChatContext';
import { useUser } from '@/contexts/UserContext';

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    onSettingsClick: () => void;
}

export default function MobileNav({ isOpen, onClose, onSettingsClick }: MobileNavProps) {
    const { onlineCount } = useChat();
    const { settings } = useUser();
    const isDark = settings.theme === 'dark';

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full w-80 z-50 flex flex-col md:hidden transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } ${isDark
                    ? 'bg-[#0f1a2b] border-r border-[#1e3a5f]'
                    : 'bg-white border-r border-slate-200'
                }`}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-[#162032]' : 'text-slate-500 hover:bg-slate-100'
                        }`}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="flex flex-col h-full p-6 gap-8">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-[#13a4ec] to-cyan-300 rounded-2xl size-12 flex items-center justify-center shrink-0 shadow-lg">
                            <span className="material-symbols-outlined text-white text-3xl">public</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'
                                }`}>
                                Open World<br />
                                <span className="text-[#13a4ec]">Chat</span>
                            </h1>
                        </div>
                    </div>

                    {/* Online Count */}
                    <div className={`rounded-xl p-4 flex items-center justify-between ${isDark ? 'bg-[#162032] border border-[#1e3a5f]' : 'bg-slate-50 border border-slate-200'
                        }`}>
                        <div className="flex flex-col">
                            <span className={`text-xs font-semibold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Online</span>
                            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{onlineCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative rounded-full h-2.5 w-2.5 bg-green-500" />
                            </span>
                            <span className="text-green-500 text-xs font-bold">LIVE</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#13a4ec]/10 text-[#13a4ec] border border-[#13a4ec]/20"
                        >
                            <span className="material-symbols-outlined">forum</span>
                            <span className="text-sm font-bold">Global Chat</span>
                        </button>

                        <button className={`flex items-center gap-4 px-4 py-3.5 rounded-xl ${isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-sm font-medium">Friends</span>
                            <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-[#162032] text-slate-500' : 'bg-slate-100 text-slate-400'
                                }`}>Soon</span>
                        </button>

                        <button
                            onClick={() => { onSettingsClick(); onClose(); }}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl ${isDark ? 'text-slate-400 hover:bg-[#162032]' : 'text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-sm font-medium">Settings</span>
                        </button>
                    </nav>
                </div>
            </aside>
        </>
    );
}
