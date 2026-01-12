'use client';

import { useState, useRef, useEffect } from 'react';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

// Common reaction emojis
const EMOJI_CATEGORIES = {
    frequent: ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'],
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗'],
    gestures: ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '🤟', '🤘', '👌', '🤌', '👋', '💪', '🙏'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💞', '💓', '💗', '💖', '💝'],
    symbols: ['✅', '❌', '⭐', '🔥', '💯', '🎉', '🎊', '🏆', '💡', '⚡', '🚀', '🎯', '🔔', '💬'],
};

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
    const [category, setCategory] = useState<keyof typeof EMOJI_CATEGORIES>('frequent');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div
            ref={containerRef}
            className="absolute bottom-full left-0 mb-2 bg-[#16202a] border border-[#223649] rounded-lg shadow-xl z-50 w-72"
        >
            {/* Quick reactions */}
            <div className="p-2 border-b border-[#223649] flex gap-1">
                {EMOJI_CATEGORIES.frequent.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => {
                            onSelect(emoji);
                            onClose();
                        }}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#223649] rounded transition-colors"
                    >
                        {emoji}
                    </button>
                ))}
            </div>

            {/* Category tabs */}
            <div className="p-1 border-b border-[#223649] flex gap-1">
                {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat as keyof typeof EMOJI_CATEGORIES)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${category === cat
                                ? 'bg-[#06b6d4] text-white'
                                : 'text-[#90adcb] hover:bg-[#223649]'
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Emoji grid */}
            <div className="p-2 max-h-48 overflow-y-auto grid grid-cols-8 gap-1">
                {EMOJI_CATEGORIES[category].map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => {
                            onSelect(emoji);
                            onClose();
                        }}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#223649] rounded transition-colors"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}
