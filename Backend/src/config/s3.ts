import { S3Client } from '@aws-sdk/client-s3';

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

export const isS3Configured = (): boolean => {
    return s3Client !== null;
};

export const getS3BucketName = (): string => {
    return process.env.AWS_S3_BUCKET_NAME || '';
};

export default s3Client;
