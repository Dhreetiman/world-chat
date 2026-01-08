// Message types
export interface Message {
    id: string;
    content: string | null;
    imageUrl: string | null;
    fileUrl?: string;
    fileType?: string;
    fileName?: string;
    fileSize?: number;
    senderId: string;
    senderName: string;
    avatarId: number;
    customAvatarUrl?: string;
    userTitle?: string;
    replyToMessage?: {
        id: string;
        content: string | null;
        imageUrl: string | null;
        senderName: string;
        avatarId: number;
        customAvatarUrl?: string;
    } | null;
    reactions: Record<string, string[]>;
    isEdited?: boolean;
    isDeleted?: boolean;
    editedAt?: string;
    createdAt: string;
}

// User types
export interface User {
    guestId: string;
    username: string;
    avatarId: number;
    customAvatarUrl?: string;
    userTitle: string;
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
export interface JoinChatPayload {
    guestId: string;
}

export interface SetUsernamePayload {
    guestId: string;
    username: string;
    avatarId: number;
}

export interface SendMessagePayload {
    content?: string;
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

