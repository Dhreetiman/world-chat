import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.routes.v2';  // ✅ V2 User routes
import messageRoutes from '../modules/messages/message.routes';  // ✅ Re-enabled for V2
// TEMPORARILY DISABLED - Need schema updates for V2
// import settingsRoutes from '../modules/settings/settings.routes';
// import roomRoutes from '../modules/room/room.routes';
// import uploadRoutes from '../modules/uploads/upload.routes';
// import avatarRoutes from '../modules/avatars/avatar.routes';

const router = Router();

// API Routes - V2
router.use('/auth', authRoutes);
router.use('/users', userRoutes);  // ✅ V2 routes (search, me, :id)
router.use('/messages', messageRoutes);  // ✅ Re-enabled

// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'World Chat V2 API - Full Stack Ready',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
    });
});

export default router;
