'use client';

interface FilePreviewProps {
    file: File;
    previewUrl: string | null;
    uploadProgress: number;
    isUploading: boolean;
    onCancel: () => void;
    isDark: boolean;
}

// Format file size for display
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Get file category from MIME type
const getFileCategory = (mimeType: string): 'image' | 'video' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
};

export default function FilePreview({ file, previewUrl, uploadProgress, isUploading, onCancel, isDark }: FilePreviewProps) {
    const category = getFileCategory(file.type);

    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${isDark ? 'bg-[#182830] border-[#233c48]' : 'bg-slate-50 border-slate-200'}`}>
            {/* Preview thumbnail */}
            <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-black/10">
                {category === 'image' && previewUrl && (
                    <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                )}
                {category === 'video' && previewUrl && (
                    <video src={previewUrl} className="w-full h-full object-cover" muted />
                )}
                {category === 'document' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                )}
            </div>

            {/* File info and progress */}
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {file.name}
                </div>
                <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatFileSize(file.size)}
                </div>

                {/* Progress bar */}
                {isUploading && (
                    <div className="mt-2">
                        <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-[#233c48]' : 'bg-slate-200'}`}>
                            <div
                                className="h-full bg-[#13a4ec] transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Processing...'}
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel button */}
            {!isUploading && (
                <button
                    onClick={onCancel}
                    className={`shrink-0 p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#233c48] text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                    title="Remove"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </div>
    );
}
