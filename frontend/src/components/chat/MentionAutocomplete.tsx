'use client';

import { useState, useEffect, useRef } from 'react';

interface User {
    id: string;
    username: string;
    avatarUrl: string | null;
}

interface MentionAutocompleteProps {
    query: string;
    onSelect: (username: string) => void;
    onClose: () => void;
    position: { top: number; left: number };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function MentionAutocomplete({ query, onSelect, onClose, position }: MentionAutocompleteProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch users matching query
    useEffect(() => {
        const fetchUsers = async () => {
            if (!query || query.length < 1) {
                setUsers([]);
                return;
            }

            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data || []);
                    setSelectedIndex(0);
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error('Failed to search users:', error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (users.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % users.length);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (users[selectedIndex]) {
                        onSelect(users[selectedIndex].username);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [users, selectedIndex, onSelect, onClose]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (loading) {
        return (
            <div
                ref={containerRef}
                className="absolute z-50 bg-[#16202a] border border-[#223649] rounded-lg shadow-xl p-3 min-w-[240px]"
                style={{ bottom: `${position.top}px`, left: `${position.left}px` }}
            >
                <div className="flex items-center gap-2 text-[#90adcb] text-sm">
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Searching...</span>
                </div>
            </div>
        );
    }

    if (users.length === 0 && query.length > 0) {
        return (
            <div
                ref={containerRef}
                className="absolute z-50 bg-[#16202a] border border-[#223649] rounded-lg shadow-xl p-3 min-w-[240px]"
                style={{ bottom: `${position.top}px`, left: `${position.left}px` }}
            >
                <div className="text-[#6b7988] text-sm">No users found</div>
            </div>
        );
    }

    if (users.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className="absolute z-50 bg-[#16202a] border border-[#223649] rounded-lg shadow-xl overflow-hidden min-w-[240px] max-h-[240px] overflow-y-auto"
            style={{ bottom: `${position.top}px`, left: `${position.left}px` }}
        >
            {/* Header */}
            <div className="px-3 py-2 border-b border-[#223649] text-xs text-[#6b7988] uppercase tracking-wide">
                Mention someone
            </div>

            {/* User List */}
            <div className="py-1">
                {users.map((user, index) => (
                    <button
                        key={user.id}
                        onClick={() => onSelect(user.username)}
                        className={`w-full flex items-center gap-3 px-3 py-2 transition-colors ${index === selectedIndex
                            ? 'bg-[#0d7ff2] text-white'
                            : 'hover:bg-[#223649]/50 text-[#e0e6ed]'
                            }`}
                    >
                        {user.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="w-6 h-6 rounded"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#0d7ff2] to-[#054a91] flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <span className="text-sm font-medium">{user.username}</span>
                    </button>
                ))}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2 border-t border-[#223649] text-xs text-[#6b7988]">
                ↑↓ to navigate • Enter to select • Esc to close
            </div>
        </div>
    );
}
