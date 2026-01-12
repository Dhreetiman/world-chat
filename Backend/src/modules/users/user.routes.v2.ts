import { Router } from 'express';
import * as userController from './user.controller.v2';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users/search - Search users by username
router.get('/search', userController.searchUsers);

// GET /api/users/me - Get current user
router.get('/me', userController.getCurrentUser);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

export default router;
