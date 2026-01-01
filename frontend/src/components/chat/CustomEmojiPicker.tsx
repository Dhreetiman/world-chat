'use client';

import { useState, useRef, useEffect } from 'react';

interface EmojiPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onEmojiSelect: (emoji: string) => void;
    isDark?: boolean;
}

const EMOJI_CATEGORIES = {
    'Recent': ['😂', '🔥', '❤️', '👍', '🎉', '😍', '😭'],
    'Smileys & People': [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
        '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
        '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
        '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
        '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
        '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵',
        '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕'
    ],
    'Animals & Nature': [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
        '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
        '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
        '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞',
        '🌸', '🌷', '🌹', '🌺', '🌻', '🌼', '🌿', '🍀'
    ],
    'Food & Drink': [
        '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
        '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
        '🍅', '🍆', '🥑', '🥒', '🌯', '🍕', '🍔', '🍟',
        '🌭', '🍿', '🧇', '🥞', '🍳', '🥓', '🍖', '🍗',
        '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷'
    ],
    'Activities': [
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉',
        '🎱', '🏓', '🏸', '🥅', '⛳', '🎯', '🎮', '🎲',
        '🎭', '🎨', '🎬', '🎤', '🎧', '🎷', '🎸', '🎹',
        '🎺', '🎻', '🥁', '🎪', '🎡', '🎢', '🎠', '🏆'
    ],
    'Objects': [
        '💡', '🔦', '🏮', '📱', '💻', '⌨️', '🖥️', '🖨️',
        '🖱️', '💾', '📀', '📷', '🎥', '📞', '☎️', '📺',
        '📻', '⏰', '⌚', '💰', '💳', '💎', '🔑', '🔒',
        '📦', '📫', '📮', '✉️', '📝', '📚', '📖', '🔧'
    ],
    'Symbols': [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
        '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
        '💝', '✨', '⭐', '🌟', '💫', '🔥', '💥', '⚡',
        '✅', '❌', '❓', '❗', '💯', '🎵', '🎶', '➕'
    ]
};

const CATEGORY_ICONS: Record<string, string> = {
    'Recent': 'schedule',
    'Smileys & People': 'sentiment_satisfied',
    'Animals & Nature': 'pets',
    'Food & Drink': 'lunch_dining',
    'Activities': 'sports_soccer',
    'Objects': 'lightbulb',
    'Symbols': 'favorite'
};

export default function CustomEmojiPicker({ isOpen, onClose, onEmojiSelect, isDark = true }: EmojiPickerProps) {
    const [activeCategory, setActiveCategory] = useState('Recent');
    const [searchQuery, setSearchQuery] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleEmojiClick = (emoji: string) => {
        onEmojiSelect(emoji);
    };

    const filteredEmojis = searchQuery
        ? Object.values(EMOJI_CATEGORIES).flat().filter(emoji => emoji.includes(searchQuery))
        : null;

    return (
        <div
            ref={pickerRef}
            className="absolute bottom-full right-0 mb-3 w-80 bg-[#182830] border border-[#233c48] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col z-50"
        >
            {/* Category tabs */}
            <div className="flex items-center justify-between px-2 pt-2 pb-1 gap-1 border-b border-[#233c48]">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`p-2 rounded-lg transition-colors relative outline-none ${activeCategory === category
                                ? 'bg-[#233c48] text-[#13a4ec]'
                                : 'text-[#92b7c9] hover:bg-[#233c48]/50 hover:text-white'
                            }`}
                        title={category}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {CATEGORY_ICONS[category]}
                        </span>
                        {activeCategory === category && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#13a4ec]"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="p-3 pb-0">
                <div className="flex items-center bg-[#101c22] rounded-xl px-3 py-2 border border-[#233c48] focus-within:border-[#375a6b] transition-colors">
                    <span className="material-symbols-outlined text-[#5e7a8a] text-lg mr-2">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-sm text-white focus:ring-0 focus:outline-none outline-none p-0 placeholder-[#5e7a8a] w-full h-5 leading-none"
                        placeholder="Search emojis..."
                    />
                </div>
            </div>

            {/* Emoji grid */}
            <div className="h-64 overflow-y-auto p-3">
                {filteredEmojis ? (
                    <div>
                        <h3 className="text-[10px] font-bold text-[#5e7a8a] uppercase tracking-wider mb-2 sticky top-0 bg-[#182830]/95 backdrop-blur py-1 z-10">
                            Search Results
                        </h3>
                        <div className="grid grid-cols-7 gap-1">
                            {filteredEmojis.map((emoji, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="aspect-square flex items-center justify-center hover:bg-[#233c48] rounded-lg text-xl transition-transform hover:scale-110 outline-none"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    Object.entries(EMOJI_CATEGORIES)
                        .filter(([cat]) => cat === activeCategory || activeCategory === 'Recent')
                        .map(([category, emojis]) => (
                            <div key={category} className="mb-4">
                                <h3 className="text-[10px] font-bold text-[#5e7a8a] uppercase tracking-wider mb-2 sticky top-0 bg-[#182830]/95 backdrop-blur py-1 z-10">
                                    {category === 'Recent' ? 'Frequently Used' : category}
                                </h3>
                                <div className="grid grid-cols-7 gap-1">
                                    {emojis.map((emoji, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="aspect-square flex items-center justify-center hover:bg-[#233c48] rounded-lg text-xl transition-transform hover:scale-110 outline-none"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                )}
            </div>

            {/* Skin tone selector */}
            <div className="px-3 py-2 border-t border-[#233c48] bg-[#111c22]/50 flex items-center justify-between">
                <span className="text-[10px] text-[#5e7a8a]">Skin tone</span>
                <div className="flex gap-1">
                    <button className="w-3 h-3 rounded-full bg-[#fecaca] hover:scale-125 transition-transform outline-none"></button>
                    <button className="w-3 h-3 rounded-full bg-[#fca5a5] hover:scale-125 transition-transform outline-none"></button>
                    <button className="w-3 h-3 rounded-full bg-[#d69e76] ring-1 ring-white/50 hover:scale-125 transition-transform outline-none"></button>
                    <button className="w-3 h-3 rounded-full bg-[#ad835e] hover:scale-125 transition-transform outline-none"></button>
                    <button className="w-3 h-3 rounded-full bg-[#755239] hover:scale-125 transition-transform outline-none"></button>
                </div>
            </div>
        </div>
    );
}
