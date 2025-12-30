import Redis from 'ioredis';

// Redis client - optional, only initialize if REDIS_URL is provided
let redisClient: Redis | null = null;

if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
    });

    redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
    });
} else {
    console.log('ℹ️  Redis not configured, using in-memory tracking for online users');
}

export const isRedisConfigured = (): boolean => {
    return redisClient !== null;
};

export default redisClient;
