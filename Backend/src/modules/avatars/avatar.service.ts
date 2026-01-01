import prisma from '../../config/db';

/**
 * Get all avatars from database
 */
export const getAllAvatars = async () => {
    return prisma.avatar.findMany({
        orderBy: { id: 'asc' },
    });
};

/**
 * Get avatar by ID
 */
export const getAvatarById = async (id: number) => {
    return prisma.avatar.findUnique({
        where: { id },
    });
};
