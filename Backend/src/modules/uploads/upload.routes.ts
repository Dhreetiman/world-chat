import { Router } from 'express';
import * as uploadController from './upload.controller';
import { uploadLimiter } from '../../middlewares/rateLimit';

const router = Router();

// POST /api/upload/image - Upload image (legacy, via server)
router.post(
    '/image',
    uploadLimiter,
    uploadController.uploadMiddleware,
    uploadController.uploadImage
);

// POST /api/upload/presigned-url - Get pre-signed URL for direct S3 upload
router.post('/presigned-url', uploadLimiter, uploadController.getPresignedUrl);

// GET /api/upload/status - Check if upload is configured
router.get('/status', uploadController.checkUploadStatus);

export default router;
