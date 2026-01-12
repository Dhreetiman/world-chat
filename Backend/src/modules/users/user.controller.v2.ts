import { Request, Response } from 'express';
import * as userService from './user.service.v2';

/**
 * GET /api/users/search?q=username
 */
export const searchUsers = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter q is required' });
        }

        const users = await userService.searchUsers(query);
        res.json(users);
    } catch (error: any) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Failed to search users' });
    }
};

/**
 * GET /api/users/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await userService.getCurrentUser(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
};

/**
 * GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
};
