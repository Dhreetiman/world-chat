'use client';

import { useState, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import MentionAutocomplete from './MentionAutocomplete';

const CODE_LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'html', 'css', 'json', 'sql', 'bash', 'yaml'];

let typingTimeout: NodeJS.Timeout | null = null;

export default function MessageInput() {
    const [message, setMessage] = useState('');
    const [mode, setMode] = useState<'text' | 'code'>('text');
    const [codeLanguage, setCodeLanguage] = useState('javascript');
    const [fileName, setFileName] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { sendMessage, isConnected, startTyping, stopTyping } = useSocket();

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;
        setMessage(newValue);

        if (mode === 'text') {
            const textBeforeCursor = newValue.substring(0, cursorPos);
            const lastAtIndex = textBeforeCursor.lastIndexOf('@');
            if (lastAtIndex !== -1 && !textBeforeCursor.substring(lastAtIndex + 1).includes(' ')) {
                setShowMentions(true);
                setMentionQuery(textBeforeCursor.substring(lastAtIndex + 1));
                setMentionStartIndex(lastAtIndex);
            } else {
                setShowMentions(false);
            }
        }

        if (typingTimeout) clearTimeout(typingTimeout);
        if (newValue.trim()) {
            startTyping();
            typingTimeout = setTimeout(stopTyping, 3000);
        } else {
            stopTyping();
        }
    };

    const handleSend = () => {
        if (!message.trim() || !isConnected) return;
        stopTyping();
        if (typingTimeout) clearTimeout(typingTimeout);
        setShowMentions(false);

        if (mode === 'code') {
            sendMessage({ codeSnippet: message, codeLanguage, codeFileName: fileName || undefined });
        } else {
            sendMessage({ content: message, isFormatted: /[*_`#\[\]]/g.test(message) });
        }
        setMessage('');
        setFileName('');
    };

    const handleMentionSelect = (username: string) => {
        if (mentionStartIndex === -1) return;
        setMessage(`${message.substring(0, mentionStartIndex)}@${username} ${message.substring(mentionStartIndex + mentionQuery.length + 1)}`);
        setShowMentions(false);
        setTimeout(() => textareaRef.current?.focus(), 0);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const insertMarkdown = (syntax: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart, end = textarea.selectionEnd;
        const sel = message.substring(start, end);
        let txt = '', off = 0;
        switch (syntax) {
            case 'bold': txt = `**${sel || 'text'}**`; off = 2; break;
            case 'italic': txt = `*${sel || 'text'}*`; off = 1; break;
            case 'code': txt = `\`${sel || 'code'}\``; off = 1; break;
            case 'link': txt = `[${sel || 'text'}](url)`; off = 1; break;
            case 'h1': txt = `# ${sel || 'Heading'}`; off = 2; break;
            case 'list': txt = `- ${sel || 'item'}`; off = 2; break;
        }
        setMessage(message.substring(0, start) + txt + message.substring(end));
        setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + off, start + off); }, 0);
    };

    return (
        <div className="p-6 pt-2 shrink-0 z-20">
            {showMentions && (
                <MentionAutocomplete query={mentionQuery} onSelect={handleMentionSelect} onClose={() => setShowMentions(false)} position={{ top: 80, left: 20 }} />
            )}

            {/* Code mode options - minimal */}
            {mode === 'code' && (
                <div className="flex items-center gap-2 mb-2">
                    <select value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)}
                        className="px-2 py-1 text-xs rounded bg-[#0f172a] text-gray-300 border border-white/10 focus:outline-none">
                        {CODE_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <input type="text" placeholder="filename" value={fileName} onChange={(e) => setFileName(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs rounded bg-[#0f172a] text-gray-300 border border-white/10 focus:outline-none placeholder-gray-600" />
                    <button onClick={() => setMode('text')} className="text-xs text-gray-500 hover:text-white">← Text</button>
                </div>
            )}

            {/* Glass Panel - Compact */}
            <div className="glass-panel rounded-xl shadow-2xl overflow-hidden focus-within:ring-1 focus-within:ring-[#06b6d4]/30 transition-all">
                {/* Toolbar - exactly like mockup */}
                <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-black/20">
                    <button onClick={() => insertMarkdown('bold')} className="markdown-btn font-bold">B</button>
                    <button onClick={() => insertMarkdown('italic')} className="markdown-btn italic">I</button>
                    <button onClick={() => insertMarkdown('code')} className="markdown-btn">&lt;/&gt;</button>
                    <button onClick={() => insertMarkdown('link')} className="markdown-btn">
                        <span className="material-symbols-outlined text-[14px]">link</span>
                    </button>
                    <div className="h-3 w-px bg-white/10 mx-1" />
                    <button onClick={() => insertMarkdown('h1')} className="markdown-btn">H1</button>
                    <button onClick={() => insertMarkdown('list')} className="markdown-btn">
                        <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
                    </button>
                </div>

                {/* Textarea - exact mockup size */}
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyPress}
                    onDoubleClick={() => mode === 'text' && setMode('code')}
                    placeholder="Type a message to #global-dev..."
                    className="w-full bg-transparent border-none text-gray-200 placeholder-gray-600 focus:ring-0 resize-none h-[60px] py-3 px-4 text-sm leading-relaxed"
                    disabled={!isConnected}
                    rows={1}
                />

                {/* Bottom bar - compact */}
                <div className="flex justify-between items-center px-3 pb-2">
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 text-gray-500 hover:text-[#06b6d4] rounded transition-colors">
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-[#06b6d4] rounded transition-colors">
                            <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-[#06b6d4] rounded transition-colors">
                            <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                        </button>
                    </div>

                    <button onClick={handleSend} disabled={!message.trim() || !isConnected}
                        className="flex items-center gap-2 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/20 hover:border-[#06b6d4]/50 text-xs font-semibold px-4 py-1.5 rounded-md transition-all shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <span>Send</span>
                        <span className="material-symbols-outlined text-[14px]">send</span>
                    </button>
                </div>
            </div>

            {/* Keyboard hints */}
            <div className="flex justify-end mt-2 px-1">
                <p className="text-[10px] text-gray-600">
                    <span className="font-mono text-gray-500">⏎</span> send <span className="mx-1">·</span>
                    <span className="font-mono text-gray-500">⇧ ⏎</span> newline
                </p>
            </div>
        </div>
    );
}
