import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import s3Client, { isS3Configured, getS3BucketName } from '../../config/s3';
import { BadRequestError } from '../../middlewares/errorHandler';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadImageInput {
    file: Express.Multer.File;
    guestId: string;
}

/**
 * Validate uploaded file
 */
export const validateFile = (file: Express.Multer.File) => {
    if (!file) {
        throw new BadRequestError('No file provided');
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new BadRequestError('Invalid file type. Allowed types: jpg, png, webp');
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestError('File size exceeds 5MB limit');
    }
};

/**
 * Upload image to S3
 */
export const uploadImage = async (input: UploadImageInput): Promise<string> => {
    const { file, guestId } = input;

    // Validate file
    validateFile(file);

    // Check if S3 is configured
    if (!isS3Configured() || !s3Client) {
        throw new BadRequestError('Image upload not configured');
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const filename = `chat-images/${guestId}/${uuidv4()}.${fileExtension}`;

    // Upload to S3
    const command = new PutObjectCommand({
        Bucket: getS3BucketName(),
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
    });

    await s3Client.send(command);

    // Return public URL
    const imageUrl = `https://${getS3BucketName()}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

    return imageUrl;
};

/**
 * Delete image from S3
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!isS3Configured() || !s3Client) {
        return;
    }

    // Extract key from URL
    const urlParts = imageUrl.split('.amazonaws.com/');
    if (urlParts.length !== 2) {
        return;
    }

    const key = urlParts[1];

    const command = new DeleteObjectCommand({
        Bucket: getS3BucketName(),
        Key: key,
    });

    try {
        await s3Client.send(command);
    } catch (error) {
        console.error('Failed to delete image:', error);
    }
};

/**
 * Check if S3 is configured and ready
 */
export const isUploadReady = (): boolean => {
    return isS3Configured() && !!getS3BucketName();
};
