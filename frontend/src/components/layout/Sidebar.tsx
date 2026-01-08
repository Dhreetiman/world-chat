'use client';

import { useChat } from '@/contexts/ChatContext';
import { useUser } from '@/contexts/UserContext';

interface SidebarProps {
    onSettingsClick: () => void;
}

export default function Sidebar({ onSettingsClick }: SidebarProps) {
    const { onlineCount } = useChat();
    const { settings } = useUser();
    const isDark = settings.theme === 'dark';

    return (
        <aside className={`hidden md:flex w-80 flex-col border-r shrink-0 relative overflow-hidden z-10 ${isDark
            ? 'border-[#1e3a5f] bg-[#0f1a2b]'
            : 'border-slate-200 bg-white shadow-sm'
            }`}>
            {/* Gradient overlay */}
            <div className={`absolute top-0 left-0 w-full h-96 pointer-events-none ${isDark
                ? 'bg-gradient-to-b from-[#13a4ec]/10 to-transparent'
                : 'bg-gradient-to-b from-[#13a4ec]/5 to-transparent'
                }`} />

            <div className="flex flex-col h-full relative z-10 p-6 gap-8">
                {/* Logo & App Name */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-[#13a4ec] to-cyan-300 rounded-2xl size-12 flex items-center justify-center shrink-0 shadow-lg shadow-[#13a4ec]/20">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="size-7">
                                <circle cx="16" cy="16" r="12" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
                                <ellipse cx="16" cy="16" rx="4" ry="12" fill="none" stroke="white" strokeWidth="1.5" />
                                <path d="M4 16h24" stroke="white" strokeWidth="1.5" />
                                <path d="M6 10h20" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                                <path d="M6 22h20" stroke="white" strokeWidth="1" strokeOpacity="0.6" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`text-xl font-bold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'
                                }`}>
                                Open<span className="text-[#13a4ec]">wave</span>
                            </h1>
                        </div>
                    </div>

                    {/* Online Count */}
                    <div className={`rounded-xl p-4 flex items-center justify-between ${isDark
                        ? 'bg-[#162032] border border-[#1e3a5f]'
                        : 'bg-white border border-slate-100 shadow-sm ring-1 ring-slate-900/5'
                        }`}>
                        <div className="flex flex-col">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}>Online</span>
                            <span className={`text-2xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-slate-900'
                                }`}>{onlineCount.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="relative flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                                </span>
                                <span className="text-green-500 text-xs font-bold">LIVE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 flex-1">
                    <button className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#13a4ec]/10 text-[#13a4ec] border border-[#13a4ec]/20 transition-all hover:bg-[#13a4ec]/20 group shadow-sm">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">forum</span>
                        <span className="text-sm font-bold">Global Chat</span>
                    </button>

                    <button className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors group ${isDark
                        ? 'text-slate-400 hover:bg-[#162032] hover:text-white'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        }`}>
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">group</span>
                        <span className="text-sm font-medium">Friends</span>
                        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-[#162032] text-slate-500' : 'bg-slate-100 text-slate-400'
                            }`}>Soon</span>
                    </button>

                    <button
                        onClick={onSettingsClick}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors group ${isDark
                            ? 'text-slate-400 hover:bg-[#162032] hover:text-white'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                    >
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings</span>
                        <span className="text-sm font-medium">Settings</span>
                    </button>
                </nav>

                {/* About Section */}
                <div className="mt-auto">
                    <div className={`rounded-2xl p-5 relative overflow-hidden group ${isDark
                        ? 'bg-[#162032] border border-[#1e3a5f]'
                        : 'bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm'
                        }`}>
                        <div className={`absolute -right-6 -top-6 size-24 rounded-full blur-2xl transition-colors ${isDark
                            ? 'bg-[#13a4ec]/10 group-hover:bg-[#13a4ec]/20'
                            : 'bg-[#13a4ec]/10 group-hover:bg-[#13a4ec]/20'
                            }`} />
                        <div className={`flex items-center gap-2 mb-2 font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'
                            }`}>
                            <span className="material-symbols-outlined text-[#13a4ec] text-lg">info</span>
                            <span>About this space</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                            Join the conversation instantly. No login, no history tracking. Just pick a name and say hello to the world.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
