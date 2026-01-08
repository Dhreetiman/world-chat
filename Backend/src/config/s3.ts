import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 Client only if AWS credentials are configured
const s3Client = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? new S3Client({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    })
    : null;

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'world-chat-prod';
const BUCKET_REGION = process.env.AWS_REGION || 'ap-south-1';

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
    video: 60 * 1024 * 1024, // 60 MB
    default: 20 * 1024 * 1024, // 20 MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

export const isS3Configured = (): boolean => {
    return s3Client !== null;
};

export const getS3BucketName = (): string => {
    return BUCKET_NAME;
};

/**
 * Get file category from MIME type
 */
export const getFileCategory = (mimeType: string): 'image' | 'video' | 'document' | 'unknown' => {
    if (ALLOWED_FILE_TYPES.image.includes(mimeType)) return 'image';
    if (ALLOWED_FILE_TYPES.video.includes(mimeType)) return 'video';
    if (ALLOWED_FILE_TYPES.document.includes(mimeType)) return 'document';
    return 'unknown';
};

/**
 * Validate file size based on type
 */
export const validateFileSize = (mimeType: string, size: number): boolean => {
    const category = getFileCategory(mimeType);
    const limit = category === 'video' ? FILE_SIZE_LIMITS.video : FILE_SIZE_LIMITS.default;
    return size <= limit;
};

/**
 * Generate a unique S3 key for file upload
 */
export const generateS3Key = (fileName: string, folder: string = 'chat-files'): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = fileName.split('.').pop() || '';
    return `${folder}/${timestamp}-${randomString}.${extension}`;
};

/**
 * Generate a pre-signed URL for direct upload to S3
 */
export const getPresignedUploadUrl = async (key: string, contentType: string): Promise<string | null> => {
    if (!s3Client) return null;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    // URL expires in 5 minutes
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    return url;
};

/**
 * Get the public URL for an uploaded file
 */
export const getPublicUrl = (key: string): string => {
    return `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${key}`;
};

/**
 * Delete a file from S3
 */
export const deleteFile = async (key: string): Promise<void> => {
    if (!s3Client) return;

    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    await s3Client.send(command);
};

/**
 * Delete multiple files from S3
 */
export const deleteFiles = async (keys: string[]): Promise<void> => {
    await Promise.all(keys.map(key => deleteFile(key)));
};

/**
 * Extract S3 key from file URL
 */
export const extractS3KeyFromUrl = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        // URL format: https://bucket.s3.region.amazonaws.com/key
        return urlObj.pathname.substring(1); // Remove leading slash
    } catch {
        return null;
    }
};

export { s3Client, BUCKET_NAME };
export default s3Client;
