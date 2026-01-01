'use client';

import { useUser } from '@/contexts/UserContext';

interface ChatHeaderProps {
    onMenuClick: () => void;
    onSearchChange?: (query: string) => void;
}

export default function ChatHeader({ onMenuClick, onSearchChange }: ChatHeaderProps) {
    const { settings } = useUser();
    const isDark = settings.theme === 'dark';

    return (
        <header className={`h-18 px-6 py-4 flex items-center justify-between border-b z-20 sticky top-0 ${isDark
            ? 'border-[#1e3a5f] bg-[#0f1a2b]/80 backdrop-blur'
            : 'border-slate-200 bg-white/80 backdrop-blur shadow-sm'
            }`}>
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className={`md:hidden transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                        }`}
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Room info */}
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#13a4ec]/10 flex items-center justify-center text-[#13a4ec]">
                        <span className="material-symbols-outlined text-lg">public</span>
                    </div>
                    <div>
                        <h2 className={`text-lg font-bold leading-none tracking-tight ${isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                            Global Chat Room
                        </h2>
                        <span className={`text-xs flex items-center gap-1 mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                            <span className="block w-1.5 h-1.5 rounded-full bg-green-500" />
                            Server Stable
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Search */}
                <div className={`hidden sm:flex items-center rounded-lg px-3 py-1.5 border transition-all ${isDark
                    ? 'bg-[#162032] border-[#1e3a5f] focus-within:ring-2 focus-within:ring-[#13a4ec]/20 focus-within:border-[#13a4ec]'
                    : 'bg-slate-100 border-slate-200 focus-within:ring-2 focus-within:ring-[#13a4ec]/20 focus-within:border-[#13a4ec]'
                    }`}>
                    <span className={`material-symbols-outlined text-sm mr-2 ${isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>search</span>
                    <input
                        type="text"
                        placeholder="Search in chat..."
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className={`bg-transparent border-none outline-none focus:ring-0 focus:outline-none text-sm p-0 w-32 lg:w-48 ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
                            }`}
                    />
                </div>

                {/* More options */}
                <button className={`flex items-center justify-center size-10 rounded-lg transition-colors ${isDark
                    ? 'text-slate-400 hover:bg-[#162032] hover:text-white'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                    }`}>
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </div>
        </header>
    );
}
