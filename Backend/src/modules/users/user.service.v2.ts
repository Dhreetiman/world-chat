import prisma from '../../config/db';

/**
 * Search users by username
 */
export const searchUsers = async (query: string, limit = 10) => {
    if (!query || query.length < 1) {
        return [];
    }

    const users = await prisma.user.findMany({
        where: {
            username: {
                contains: query,
                mode: 'insensitive',
            },
        },
        select: {
            id: true,
            username: true,
            avatarUrl: true,
        },
        take: limit,
        orderBy: {
            username: 'asc',
        },
    });

    return users;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
        },
    });

    return user;
};

/**
 * Get current user (from JWT)
 */
export const getCurrentUser = async (userId: string) => {
    return getUserById(userId);
};
