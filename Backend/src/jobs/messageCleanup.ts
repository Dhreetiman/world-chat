import cron from 'node-cron';
import prisma from '../config/db';
import { deleteFile, extractS3KeyFromUrl } from '../config/s3';

/**
 * Message cleanup job
 * Runs every hour and deletes messages older than 24 hours
 * Also cleans up associated S3 files
 */
export const startMessageCleanupJob = () => {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🧹 Running message cleanup job...');

            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // First, find messages with files to delete from S3
            const messagesWithFiles = await prisma.message.findMany({
                where: {
                    createdAt: { lt: twentyFourHoursAgo },
                    fileUrl: { not: null },
                },
                select: {
                    id: true,
                    fileUrl: true,
                },
            });

            // Delete S3 files
            let s3DeletedCount = 0;
            for (const message of messagesWithFiles) {
                if (message.fileUrl) {
                    const key = extractS3KeyFromUrl(message.fileUrl);
                    if (key) {
                        try {
                            await deleteFile(key);
                            s3DeletedCount++;
                        } catch (error) {
                            console.error(`Failed to delete S3 file: ${key}`, error);
                        }
                    }
                }
            }

            // Now delete the messages from DB
            const result = await prisma.message.deleteMany({
                where: {
                    createdAt: { lt: twentyFourHoursAgo },
                },
            });

            console.log(`🧹 Cleanup complete: Deleted ${result.count} old messages and ${s3DeletedCount} S3 files`);
        } catch (error) {
            console.error('❌ Message cleanup job failed:', error);
        }
    });

    console.log('✅ Message cleanup job scheduled (runs every hour)');
};

/**
 * Clean up inactive users job
 * Runs daily and removes users inactive for 30+ days
 */
export const startUserCleanupJob = () => {
    // Run daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        try {
            console.log('🧹 Running user cleanup job...');

            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const result = await prisma.guestUser.deleteMany({
                where: {
                    lastActiveAt: { lt: thirtyDaysAgo },
                },
            });

            console.log(`🧹 User cleanup complete: Removed ${result.count} inactive users`);
        } catch (error) {
            console.error('❌ User cleanup job failed:', error);
        }
    });

    console.log('✅ User cleanup job scheduled (runs daily at 2 AM)');
};

/**
 * Start all cleanup jobs
 */
export const startAllJobs = () => {
    startMessageCleanupJob();
    startUserCleanupJob();
};

export default startAllJobs;
