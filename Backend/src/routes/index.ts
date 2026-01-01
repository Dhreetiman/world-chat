import { Router } from 'express';
import userRoutes from '../modules/users/user.routes';
import messageRoutes from '../modules/messages/message.routes';
import settingsRoutes from '../modules/settings/settings.routes';
import roomRoutes from '../modules/room/room.routes';
import uploadRoutes from '../modules/uploads/upload.routes';
import avatarRoutes from '../modules/avatars/avatar.routes';

const router = Router();

// API Routes
router.use('/users', userRoutes);
router.use('/messages', messageRoutes);
router.use('/settings', settingsRoutes);
router.use('/room', roomRoutes);
router.use('/upload', uploadRoutes);
router.use('/avatars', avatarRoutes);

// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Open World Chat API is running',
        timestamp: new Date().toISOString(),
    });
});

export default router;
