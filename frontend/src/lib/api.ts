import { ApiResponse, Avatar, Message, PaginatedResponse, RoomInfo, User, UserSettings } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }

    return response.json();
}

// User API
export const userApi = {
    register: async (username?: string, avatarId?: number) => {
        return fetchApi<ApiResponse<User>>('/users/register', {
            method: 'POST',
            body: JSON.stringify({ username, avatarId }),
        });
    },

    getMe: async () => {
        return fetchApi<ApiResponse<User | null>>('/users/me');
    },

    updateUsername: async (username: string, avatarId?: number) => {
        return fetchApi<ApiResponse<User>>('/users/username', {
            method: 'PATCH',
            body: JSON.stringify({ username, avatarId }),
        });
    },

    getAvatars: async () => {
        return fetchApi<ApiResponse<Avatar[]>>('/users/avatars');
    },
};

// Messages API
export const messagesApi = {
    getMessages: async (page = 1, limit = 50) => {
        return fetchApi<PaginatedResponse<Message>>(`/messages?page=${page}&limit=${limit}`);
    },

    searchMessages: async (query: string, page = 1, limit = 20) => {
        return fetchApi<PaginatedResponse<Message>>(`/messages/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    },
};

// Room API
export const roomApi = {
    getMetadata: async () => {
        return fetchApi<ApiResponse<RoomInfo>>('/room/metadata');
    },

    getOnlineCount: async () => {
        return fetchApi<ApiResponse<{ count: number }>>('/room/online-count');
    },
};

// Settings API
export const settingsApi = {
    get: async () => {
        return fetchApi<ApiResponse<UserSettings>>('/settings');
    },

    update: async (settings: Partial<UserSettings>) => {
        return fetchApi<ApiResponse<UserSettings>>('/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    },
};
