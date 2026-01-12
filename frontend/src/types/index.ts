// Message types
export interface MessageReaction {
    emoji: string;
    count: number;
    users: { id: string; username: string }[];
    hasReacted?: boolean; // Did current user react with this emoji
}

export interface Message {
    id: string;
    content: string | null;
    codeSnippet?: string | null;
    codeLanguage?: string | null;
    codeFileName?: string | null;
    isFormatted?: boolean;
    imageUrl: string | null;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    fileSize?: number;
    senderId: string;
    sender: {
        id: string;
        username: string;
        avatarUrl: string | null;
    };
    replyToMessage?: {
        id: string;
        content: string | null;
        codeSnippet?: string | null;
        sender: {
            username: string;
        };
    } | null;
    mentions?: string[];
    reactions?: MessageReaction[];
    isEdited?: boolean;
    isDeleted?: boolean;
    editedAt?: string;
    createdAt: string;
}

// User types
export interface User {
    id: string;
    username: string;
    email?: string;
    avatarUrl?: string | null;
    createdAt: string;
}

export interface UserSettings {
    theme: 'dark' | 'light';
    notifications: boolean;
}

// Avatar types
export interface Avatar {
    id: number;
    name: string;
    url: string;
}

// Room types
export interface RoomInfo {
    id: string;
    name: string;
    description: string;
    onlineCount: number;
    serverStatus: string;
}

// Socket event payloads
export interface SendMessagePayload {
    content?: string;
    codeSnippet?: string;
    codeLanguage?: string;
    codeFileName?: string;
    isFormatted?: boolean;
    imageUrl?: string;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    fileSize?: number;
    replyToMessageId?: string;
}

export interface SendReactionPayload {
    messageId: string;
    emoji: string;
}

export interface EditMessagePayload {
    messageId: string;
    content: string;
}

export interface DeleteMessagePayload {
    messageId: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: {
        message: string;
    };
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

