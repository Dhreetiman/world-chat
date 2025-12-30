/**
 * Pre-stored Avatar Configuration
 * Users can select from these avatars when setting their username
 */

export interface Avatar {
    id: number;
    name: string;
    url: string;
}

// Pre-stored avatars (these would be actual image URLs in production)
export const AVATARS: Avatar[] = [
    { id: 1, name: 'Sunset Gradient', url: '/avatars/avatar-1.png' },
    { id: 2, name: 'Ocean Blue', url: '/avatars/avatar-2.png' },
    { id: 3, name: 'Forest Green', url: '/avatars/avatar-3.png' },
    { id: 4, name: 'Neon Pink', url: '/avatars/avatar-4.png' },
    { id: 5, name: 'Golden Hour', url: '/avatars/avatar-5.png' },
    { id: 6, name: 'Purple Haze', url: '/avatars/avatar-6.png' },
    { id: 7, name: 'Fire Red', url: '/avatars/avatar-7.png' },
    { id: 8, name: 'Ice Blue', url: '/avatars/avatar-8.png' },
    { id: 9, name: 'Mint Fresh', url: '/avatars/avatar-9.png' },
    { id: 10, name: 'Cosmic Night', url: '/avatars/avatar-10.png' },
];

/**
 * Get avatar by ID
 * Returns first avatar if ID not found
 */
export const getAvatarById = (id: number): Avatar => {
    return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
};

/**
 * Get avatar URL by ID
 */
export const getAvatarUrl = (id: number): string => {
    return getAvatarById(id).url;
};

/**
 * Check if avatar ID is valid
 */
export const isValidAvatarId = (id: number): boolean => {
    return AVATARS.some((avatar) => avatar.id === id);
};

/**
 * Get all avatars
 */
export const getAllAvatars = (): Avatar[] => {
    return AVATARS;
};

/**
 * Get default avatar ID
 */
export const DEFAULT_AVATAR_ID = 1;
