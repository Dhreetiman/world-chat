'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { userApi, settingsApi } from '@/lib/api';
import { User, UserSettings } from '@/types';

interface UserContextType {
    user: User | null;
    settings: UserSettings;
    isLoading: boolean;
    isUsernameSet: boolean;
    setUser: (user: User | null) => void;
    updateUsername: (username: string, avatarId?: number) => Promise<void>;
    updateTheme: (theme: 'dark' | 'light') => Promise<void>;
    registerUser: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const defaultSettings: UserSettings = {
    theme: 'dark',
    notifications: true,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    // Check if username is custom (not default Guest_XXXX pattern)
    const isUsernameSet = user ? !user.username.match(/^Guest_[A-Z0-9]{4}$/) : false;

    // Apply theme to document
    useEffect(() => {
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.theme]);

    // Load user on mount
    const refreshUser = useCallback(async () => {
        try {
            const response = await userApi.getMe();
            if (response.data) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Failed to get user:', error);
        }
    }, []);

    // Load settings on mount
    const loadSettings = useCallback(async () => {
        try {
            const response = await settingsApi.get();
            if (response.data) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }, []);

    // Initialize
    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await Promise.all([refreshUser(), loadSettings()]);
            setIsLoading(false);
        };
        init();
    }, [refreshUser, loadSettings]);

    // Register new user
    const registerUser = useCallback(async () => {
        try {
            const response = await userApi.register();
            if (response.data) {
                setUser(response.data);
                // Store guestId as fallback
                localStorage.setItem('guestId', response.data.guestId);
            }
        } catch (error) {
            console.error('Failed to register user:', error);
            throw error;
        }
    }, []);

    // Update username
    const updateUsername = useCallback(async (username: string, avatarId?: number) => {
        try {
            const response = await userApi.updateUsername(username, avatarId);
            if (response.data) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Failed to update username:', error);
            throw error;
        }
    }, []);

    // Update theme
    const updateTheme = useCallback(async (theme: 'dark' | 'light') => {
        try {
            const response = await settingsApi.update({ theme });
            if (response.data) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Failed to update theme:', error);
            // Still apply locally
            setSettings(prev => ({ ...prev, theme }));
        }
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                settings,
                isLoading,
                isUsernameSet,
                setUser,
                updateUsername,
                updateTheme,
                registerUser,
                refreshUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
