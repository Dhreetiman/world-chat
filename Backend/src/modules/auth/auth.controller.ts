import { Request, Response } from 'express';
import { authService } from './auth.service';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authController = {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    async register(req: Request, res: Response) {
        try {
            const { username, password, email } = req.body;

            // Validation
            if (!username || username.length < 3) {
                return res.status(400).json({ error: 'Username must be at least 3 characters' });
            }

            if (!password || password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }

            const result = await authService.register(username, password, email);

            // Set refresh token in httpOnly cookie
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

            res.status(201).json({
                user: result.user,
                accessToken: result.accessToken,
            });
        } catch (error: any) {
            console.error('Register error:', error);
            res.status(400).json({ error: error.message || 'Registration failed' });
        }
    },

    /**
     * POST /api/auth/login
     * Login existing user
     */
    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password required' });
            }

            const result = await authService.login(username, password);

            // Set refresh token in httpOnly cookie
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

            res.json({
                user: result.user,
                accessToken: result.accessToken,
            });
        } catch (error: any) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message || 'Login failed' });
        }
    },

    /**
     * POST /api/auth/refresh
     * Refresh access token
     */
    async refresh(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({ error: 'Refresh token required' });
            }

            const result = await authService.refreshAccessToken(refreshToken);

            res.json({
                user: result.user,
                accessToken: result.accessToken,
            });
        } catch (error: any) {
            console.error('Refresh error:', error);
            res.status(401).json({ error: error.message || 'Token refresh failed' });
        }
    },

    /**
     * POST /api/auth/logout
     * Logout user
     */
    async logout(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                await authService.logout(refreshToken);
            }

            // Clear cookie
            res.clearCookie('refreshToken');

            res.json({ message: 'Logged out successfully' });
        } catch (error: any) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    },

    /**
     * GET /api/auth/me
     * Get current user
     */
    async getMe(req: Request, res: Response) {
        try {
            // userId is set by auth middleware
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            const user = await authService.getCurrentUser(userId);

            res.json({ user });
        } catch (error: any) {
            console.error('Get me error:', error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    },
};
