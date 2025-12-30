import { Router } from 'express';
import * as uploadController from './upload.controller';
import { uploadLimiter } from '../../middlewares/rateLimit';

const router = Router();

// POST /api/upload/image - Upload image
router.post(
    '/image',
    uploadLimiter,
    uploadController.uploadMiddleware,
    uploadController.uploadImage
);

// GET /api/upload/status - Check if upload is configured
router.get('/status', uploadController.checkUploadStatus);

export default router;
