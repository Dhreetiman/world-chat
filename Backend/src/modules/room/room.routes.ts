import { Router } from 'express';
import * as roomController from './room.controller';

const router = Router();

// GET /api/room/metadata - Get room info with online count
router.get('/metadata', roomController.getRoomInfo);

// GET /api/room/online-count - Get only online users count
router.get('/online-count', roomController.getOnlineCount);

export default router;
