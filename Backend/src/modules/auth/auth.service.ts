import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../../config/db';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

interface TokenPayload {
    userId: string;
    username: string;
}

export const authService = {
    /**
     * Register a new user
     */
    async register(username: string, password: string, email?: string) {
        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            throw new Error('Username already taken');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                email,
            },
        });

        // Create default settings
        await prisma.userSettings.create({
            data: {
                userId: user.id,
                theme: 'dark',
                notifications: true,
            },
        });

        // Generate tokens
        const { accessToken, refreshToken } = this.generateTokens({
            userId: user.id,
            username: user.username,
        });

        // Store refresh token
        await this.createSession(user.id, refreshToken);

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        };
    },

    /**
     * Login existing user
     */
    async login(username: string, password: string) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Update last active
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
        });

        // Generate tokens
        const { accessToken, refreshToken } = this.generateTokens({
            userId: user.id,
            username: user.username,
        });

        // Store refresh token
        await this.createSession(user.id, refreshToken);

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        };
    },

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as TokenPayload;

            // Check if session exists
            const session = await prisma.session.findUnique({
                where: { refreshToken },
                include: { user: true },
            });

            if (!session || session.expiresAt < new Date()) {
                throw new Error('Invalid or expired refresh token');
            }

            // Generate new access token
            const { accessToken } = this.generateTokens({
                userId: decoded.userId,
                username: decoded.username,
            });

            return {
                accessToken,
                user: {
                    id: session.user.id,
                    username: session.user.username,
                    email: session.user.email,
                    avatarUrl: session.user.avatarUrl,
                },
            };
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    },

    /**
     * Logout user (invalidate refresh token)
     */
    async logout(refreshToken: string) {
        await prisma.session.deleteMany({
            where: { refreshToken },
        });
    },

    /**
     * Logout all sessions for a user
     */
    async logoutAll(userId: string) {
        await prisma.session.deleteMany({
            where: { userId },
        });
    },

    /**
     * Verify access token
     */
    verifyAccessToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    },

    /**
     * Generate access and refresh tokens
     */
    generateTokens(payload: TokenPayload) {
        const accessToken = jwt.sign(
            payload,
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY } as any
        );

        const refreshToken = jwt.sign(
            payload,
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY } as any
        );

        return { accessToken, refreshToken };
    },

    /**
     * Create session (store refresh token)
     */
    async createSession(userId: string, refreshToken: string) {
        // Calculate expiry (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Delete old sessions for this user (keep only latest)
        await prisma.session.deleteMany({
            where: { userId },
        });

        // Create new session
        await prisma.session.create({
            data: {
                userId,
                refreshToken,
                expiresAt,
            },
        });
    },

    /**
     * Get current user by ID
     */
    async getCurrentUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
                lastActiveAt: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    },
};
