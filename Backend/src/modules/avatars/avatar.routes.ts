import { Router } from 'express';
import * as avatarController from './avatar.controller';

const router = Router();

// GET /api/avatars - Get all available avatars
router.get('/', avatarController.getAvatars);

export default router;
