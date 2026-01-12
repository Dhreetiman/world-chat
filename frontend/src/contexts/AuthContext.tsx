'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, email?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const isAuthenticated = !!user && !!accessToken;

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include',
                headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                // Try to refresh token
                await refreshToken();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            setUser(data.user);
            setAccessToken(data.accessToken);

            // Save access token to localStorage as backup
            localStorage.setItem('accessToken', data.accessToken);

            router.push('/');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (username: string, password: string, email?: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password, email }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Registration failed');
            }

            const data = await response.json();
            setUser(data.user);
            setAccessToken(data.accessToken);

            // Save access token to localStorage as backup
            localStorage.setItem('accessToken', data.accessToken);

            router.push('/');
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('accessToken');
            router.push('/login');
        }
    };

    const refreshToken = async () => {
        try {
            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setAccessToken(data.accessToken);
                localStorage.setItem('accessToken', data.accessToken);
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            setUser(null);
            setAccessToken(null);
            localStorage.removeItem('accessToken');
        }
    };

    // Auto-refresh token before it expires (every 10 minutes)
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            refreshToken();
        }, 10 * 60 * 1000); // 10 minutes

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
        accessToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
