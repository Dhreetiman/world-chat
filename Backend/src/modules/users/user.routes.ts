import { Router } from 'express';
import * as userController from './user.controller';
import { apiLimiter } from '../../middlewares/rateLimit';

const router = Router();

// POST /api/users/register - Register or get guest user
router.post('/register', apiLimiter, userController.registerGuest);

// GET /api/users/me - Get current user
router.get('/me', userController.getUser);

// PATCH /api/users/username - Update username
router.patch('/username', apiLimiter, userController.updateUsername);

// GET /api/users/avatars - Get available avatars
router.get('/avatars', userController.getAvatars);

export default router;
