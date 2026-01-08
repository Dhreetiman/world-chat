'use client';

import { useState, useRef, useEffect } from 'react';
import ImageLightbox from '../modals/ImageLightbox';

interface FileMessageProps {
    fileUrl: string;
    fileType: string;
    fileName: string;
    fileSize: number;
    isDark: boolean;
    isOwn: boolean;
}

// Format file size for display
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Format time for display
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Get file category from MIME type
const getFileCategory = (mimeType: string): 'image' | 'video' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
};

// Get document icon based on file type
const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
        );
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    );
};

// Custom themed video player
function CustomVideoPlayer({ fileUrl, fileName, fileSize, isOwn, isDark }: { fileUrl: string; fileName: string; fileSize: number; isOwn: boolean; isDark: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            setProgress((video.currentTime / video.duration) * 100);
            setCurrentTime(video.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        if (!video) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newProgress = (clickX / rect.width) * 100;
        video.currentTime = (newProgress / 100) * video.duration;
        setProgress(newProgress);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const toggleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            video.requestFullscreen();
        }
    };

    return (
        <div
            className="rounded-lg overflow-hidden relative group"
            style={{ maxWidth: '280px' }}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => !isPlaying && setShowControls(true)}
        >
            {/* Video */}
            <video
                ref={videoRef}
                src={fileUrl}
                className="w-full rounded-lg cursor-pointer"
                style={{ maxHeight: '320px' }}
                preload="metadata"
                onClick={togglePlay}
            />

            {/* Play button overlay (when paused) */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-black/50 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white" className="ml-1">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    </div>
                </div>
            )}

            {/* Custom controls */}
            <div className={`absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                {/* Progress bar */}
                <div
                    className="h-1 bg-white/30 rounded-full mb-1.5 cursor-pointer"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-[#13a4ec] rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Controls row */}
                <div className="flex items-center gap-2 text-white">
                    {/* Play/Pause */}
                    <button onClick={togglePlay} className="hover:text-[#13a4ec] transition-colors">
                        {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        )}
                    </button>

                    {/* Time */}
                    <span className="text-[10px] text-white/80">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div className="flex-1" />

                    {/* Mute */}
                    <button onClick={toggleMute} className="hover:text-[#13a4ec] transition-colors">
                        {isMuted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <line x1="23" y1="9" x2="17" y2="15"></line>
                                <line x1="17" y1="9" x2="23" y2="15"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        )}
                    </button>

                    {/* Download */}
                    <a
                        href={fileUrl}
                        download={fileName}
                        className="hover:text-[#13a4ec] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </a>

                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} className="hover:text-[#13a4ec] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <polyline points="9 21 3 21 3 15"></polyline>
                            <line x1="21" y1="3" x2="14" y2="10"></line>
                            <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                    </button>
                </div>
            </div>

            {/* File info */}
            <div className={`text-[10px] mt-1 truncate ${isOwn ? 'text-white/70' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {fileName} · {formatFileSize(fileSize)}
            </div>
        </div>
    );
}

export default function FileMessage({ fileUrl, fileType, fileName, fileSize, isDark, isOwn }: FileMessageProps) {
    const [showLightbox, setShowLightbox] = useState(false);
    const category = getFileCategory(fileType);

    // Image display
    if (category === 'image') {
        return (
            <>
                <div
                    className="relative cursor-pointer rounded-lg overflow-hidden max-w-xs group"
                >
                    <img
                        src={fileUrl}
                        alt={fileName}
                        className="max-w-full max-h-64 object-cover rounded-lg hover:opacity-90 transition-opacity"
                        onClick={() => setShowLightbox(true)}
                    />
                    {/* Download button */}
                    <a
                        href={fileUrl}
                        download={fileName}
                        className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                        onClick={(e) => e.stopPropagation()}
                        title="Download"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </a>
                </div>
                {showLightbox && (
                    <ImageLightbox
                        src={fileUrl}
                        alt={fileName}
                        onClose={() => setShowLightbox(false)}
                    />
                )}
            </>
        );
    }

    // Video display - Custom player
    if (category === 'video') {
        return <CustomVideoPlayer fileUrl={fileUrl} fileName={fileName} fileSize={fileSize} isOwn={isOwn} isDark={isDark} />;
    }

    // Document display
    return (
        <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={fileName}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isOwn
                ? 'bg-white/10 hover:bg-white/20'
                : isDark
                    ? 'bg-[#1a2836] hover:bg-[#233c48]'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
        >
            {getDocumentIcon(fileType)}
            <div className="flex flex-col min-w-0">
                <span className={`text-sm font-medium truncate ${isOwn ? 'text-white' : isDark ? 'text-white' : 'text-slate-800'}`}>
                    {fileName}
                </span>
                <span className={`text-xs ${isOwn ? 'text-white/70' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatFileSize(fileSize)}
                </span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isOwn ? 'text-white/70' : isDark ? 'text-slate-500' : 'text-slate-400'}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        </a>
    );
}
