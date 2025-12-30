import { Router } from 'express';
import * as settingsController from './settings.controller';
import { apiLimiter } from '../../middlewares/rateLimit';

const router = Router();

// GET /api/settings - Get user settings
router.get('/', settingsController.getSettings);

// PATCH /api/settings - Update user settings
router.patch('/', apiLimiter, settingsController.updateSettings);

export default router;
