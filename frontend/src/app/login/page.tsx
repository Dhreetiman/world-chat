'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isSignup) {
                await register(username, password, email || undefined);
            } else {
                await login(username, password);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-[#101922]">
            {/* Blurred background */}
            <div className="flex w-full h-full relative z-0">
                {/* Sidebar mockup (blurred) */}
                <aside className="hidden md:flex w-72 flex-col border-r border-[#223649] bg-[#101a23] opacity-40 blur-sm">
                    <div className="p-5 border-b border-[#223649]/50">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-[#0d7ff2] to-[#054a91] rounded-lg w-10 h-10 shadow-inner" />
                            <div className="flex flex-col">
                                <h1 className="text-white text-lg font-bold leading-none tracking-tight">World Chat</h1>
                                <p className="text-[#90adcb] text-xs font-medium">v2.0.0</p>
                            </div>
                        </div>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                        <div className="px-3 py-2">
                            <p className="text-xs font-bold text-[#90adcb] uppercase tracking-wider mb-2">Channels</p>
                        </div>
                        <div className="h-8 w-full bg-[#223649]/60 rounded-lg mb-2"></div>
                        <div className="h-8 w-full bg-[#16202a] rounded-lg mb-2"></div>
                        <div className="h-8 w-full bg-[#16202a] rounded-lg"></div>
                    </nav>
                </aside>

                {/* Main content mockup (blurred) */}
                <main className="flex-1 flex flex-col h-full bg-[#101922] relative opacity-40 blur-sm">
                    <header className="h-16 border-b border-[#223649] flex items-center justify-between px-6 bg-[#101a23]/95">
                        <div className="flex items-center gap-2">
                            <span className="text-[#90adcb]">#</span>
                            <h2 className="font-bold text-white">general</h2>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                        <div className="h-16 w-3/4 bg-[#1e2d3d]/50 rounded-lg"></div>
                        <div className="h-16 w-2/3 bg-[#1e2d3d]/50 rounded-lg"></div>
                    </div>
                </main>
            </div>

            {/* Login Modal Overlay */}
            <div className="absolute inset-0 z-50 bg-[#080d12]/60 backdrop-blur-[6px] flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-[#101922] rounded-2xl border border-[#0d7ff2]/50 shadow-[0_0_40px_-10px_rgba(13,127,242,0.3)] relative overflow-hidden flex flex-col items-center text-center">
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0d7ff2] to-transparent opacity-80"></div>

                    <div className="p-8 w-full flex flex-col gap-6">
                        {/* Icon & Title */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0d7ff2] to-[#054a91] flex items-center justify-center shadow-lg shadow-[#0d7ff2]/20 mb-1">
                                <span className="material-symbols-outlined text-white text-[32px]">fingerprint</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Set Identity</h2>
                            <p className="text-[#90adcb] text-sm max-w-[280px]">
                                Enter your alias and secure passcode to join the session.
                            </p>
                        </div>

                        {/* Login/Signup Tabs */}
                        <div className="w-full bg-[#0c141c] p-1.5 rounded-xl border border-[#223649] flex relative">
                            <button
                                type="button"
                                onClick={() => setIsSignup(false)}
                                className={`flex-1 py-2.5 text-sm font-bold transition-all rounded-lg ${!isSignup
                                        ? 'text-white bg-[#0d7ff2] shadow-lg shadow-[#0d7ff2]/25'
                                        : 'text-[#90adcb] hover:text-white'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsSignup(true)}
                                className={`flex-1 py-2.5 text-sm font-bold transition-all rounded-lg ${isSignup
                                        ? 'text-white bg-[#0d7ff2] shadow-lg shadow-[#0d7ff2]/25'
                                        : 'text-[#90adcb] hover:text-white'
                                    }`}
                            >
                                Signup
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                            {/* Username Input */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="font-mono text-[#0d7ff2] font-bold text-lg">&gt;</span>
                                </div>
                                <input
                                    autoFocus
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#16202a] text-white font-mono placeholder-[#90adcb]/40 border-2 border-[#0d7ff2]/40 rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:border-[#0d7ff2] focus:ring-4 focus:ring-[#0d7ff2]/10 transition-all text-lg tracking-tight"
                                    placeholder="enter_alias_"
                                    required
                                />
                            </div>

                            {/* Email Input (Signup only) */}
                            {isSignup && (
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="font-mono text-[#0d7ff2] font-bold text-lg">&gt;</span>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#16202a] text-white font-mono placeholder-[#90adcb]/40 border-2 border-[#0d7ff2]/40 rounded-xl py-3.5 pl-10 pr-4 focus:outline-none focus:border-[#0d7ff2] focus:ring-4 focus:ring-[#0d7ff2]/10 transition-all text-lg tracking-tight"
                                        placeholder="enter_email_ (optional)"
                                    />
                                </div>
                            )}

                            {/* Password Input */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="font-mono text-[#0d7ff2] font-bold text-lg">&gt;</span>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#16202a] text-white font-mono placeholder-[#90adcb]/40 border-2 border-[#0d7ff2]/40 rounded-xl py-3.5 pl-10 pr-12 focus:outline-none focus:border-[#0d7ff2] focus:ring-4 focus:ring-[#0d7ff2]/10 transition-all text-lg tracking-tight"
                                    placeholder="enter_passcode_"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-sans font-bold text-[#90adcb] bg-[#223649] rounded border border-white/10 shadow-sm">
                                        RETURN
                                    </kbd>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="text-sm text-red-400 px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#0d7ff2] hover:bg-[#0b6ecc] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#0d7ff2]/25 hover:shadow-[#0d7ff2]/40 flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>{isLoading ? 'Please wait...' : isSignup ? 'Create Account' : 'Join Chat'}</span>
                                {!isLoading && (
                                    <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">
                                        arrow_forward
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Terms */}
                        <p className="text-[11px] text-[#90adcb]/60 font-mono">
                            By joining, you agree to the{' '}
                            <a className="text-[#0d7ff2] hover:underline underline-offset-2" href="#">
                                Rules of Conduct
                            </a>
                        </p>
                    </div>

                    {/* Bottom decorative stripe */}
                    <div className="w-full h-1.5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(13,127,242,0.05)_10px,rgba(13,127,242,0.05)_20px)] border-t border-white/5"></div>
                </div>
            </div>
        </div>
    );
}
