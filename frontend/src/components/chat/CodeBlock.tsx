'use client';

import { useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

interface CodeBlockProps {
    code: string;
    language?: string;
    fileName?: string;
}

export default function CodeBlock({ code, language = 'plaintext', fileName }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    // Highlight code
    const highlightedCode = language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value;

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-[580px] bg-[#0f172a] border border-white/[0.08] rounded-md overflow-hidden mt-1 shadow-lg">
            {/* Header bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/20 border-b border-white/[0.08]">
                <span className="text-[11px] font-mono text-gray-500">
                    {fileName || language}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 hover:text-[#06b6d4] transition-colors"
                    title="Copy code"
                >
                    <span className="material-symbols-outlined text-[12px]">
                        {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            {/* Code content */}
            <div className="p-3 overflow-x-auto">
                <pre className="font-mono text-[13px] leading-6">
                    <code
                        className={`language-${language}`}
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                </pre>
            </div>
        </div>
    );
}
