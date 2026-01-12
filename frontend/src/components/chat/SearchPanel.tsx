'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/types';
import dayjs from 'dayjs';

interface SearchPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onMessageClick: (messageId: string) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function SearchPanel({ isOpen, onClose, onMessageClick }: SearchPanelProps) {
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'text' | 'code' | 'file'>('all');
    const [results, setResults] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // Search messages
    useEffect(() => {
        const searchMessages = async () => {
            if (!query.trim()) {
                setResults([]);
                setTotal(0);
                return;
            }

            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const typeParam = filter !== 'all' ? `&type=${filter}` : '';
                const response = await fetch(
                    `${API_URL}/messages/search?q=${encodeURIComponent(query)}${typeParam}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setResults(data.messages || []);
                    setTotal(data.pagination?.total || 0);
                } else {
                    setResults([]);
                    setTotal(0);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setResults([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchMessages, 500);
        return () => clearTimeout(debounce);
    }, [query, filter]);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const highlightMatch = (text: string) => {
        if (!query.trim()) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-[#0d7ff2]/30 text-white">$1</mark>');
    };

    const getPreview = (message: Message) => {
        if (message.content) return message.content;
        if (message.codeSnippet) return message.codeSnippet;
        if (message.fileName) return message.fileName;
        return 'File';
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-[#101a23] border-l border-[#223649] z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="p-4 border-b border-[#223649] flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-[24px]">search</span>
                        Search Messages
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#223649] rounded transition-colors"
                    >
                        <span className="material-symbols-outlined text-[#90adcb] text-[20px]">close</span>
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-[#223649] space-y-3">
                    <input
                        type="text"
                        placeholder="Search for messages..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#16202a] text-white border border-[#223649] focus:border-[#0d7ff2] focus:outline-none placeholder-[#6b7988]"
                        autoFocus
                    />

                    {/* Filter */}
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#16202a] text-white border border-[#223649] focus:border-[#0d7ff2] focus:outline-none"
                    >
                        <option value="all">All Messages</option>
                        <option value="text">Text Only</option>
                        <option value="code">Code Only</option>
                        <option value="file">Files Only</option>
                    </select>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="p-6 text-center text-[#90adcb]">
                            <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
                            <p className="mt-2">Searching...</p>
                        </div>
                    )}

                    {!loading && query && results.length === 0 && (
                        <div className="p-6 text-center text-[#6b7988]">
                            <span className="material-symbols-outlined text-[48px] mb-2">search_off</span>
                            <p>No messages found</p>
                        </div>
                    )}

                    {!loading && !query && (
                        <div className="p-6 text-center text-[#6b7988]">
                            <span className="material-symbols-outlined text-[48px] mb-2">search</span>
                            <p>Start typing to search messages</p>
                        </div>
                    )}

                    {!loading && results.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-xs text-[#6b7988] uppercase tracking-wider bg-[#101922]">
                                {total} {total === 1 ? 'result' : 'results'}
                            </div>

                            <div className="divide-y divide-[#223649]">
                                {results.map((message) => (
                                    <button
                                        key={message.id}
                                        onClick={() => {
                                            onMessageClick(message.id);
                                            onClose();
                                        }}
                                        className="w-full p-4 hover:bg-[#16202a] transition-colors text-left"
                                    >
                                        <div className="flex items-start gap-3">
                                            {message.sender.avatarUrl ? (
                                                <img
                                                    src={message.sender.avatarUrl}
                                                    alt={message.sender.username}
                                                    className="w-8 h-8 rounded"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0d7ff2] to-[#054a91] flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white text-xs font-bold">
                                                        {message.sender.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="font-semibold text-white text-sm">
                                                        {message.sender.username}
                                                    </span>
                                                    <span className="text-xs text-[#6b7988]">
                                                        {dayjs(message.createdAt).format('MMM D, h:mm A')}
                                                    </span>
                                                </div>

                                                <p
                                                    className="text-sm text-[#e0e6ed] line-clamp-2"
                                                    dangerouslySetInnerHTML={{
                                                        __html: highlightMatch(getPreview(message).substring(0, 200))
                                                    }}
                                                />

                                                {message.codeSnippet && (
                                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs rounded bg-[#0d7ff2]/20 text-[#0d7ff2] border border-[#0d7ff2]/30">
                                                        <span className="material-symbols-outlined text-[14px]">code</span>
                                                        {message.codeLanguage || 'code'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
