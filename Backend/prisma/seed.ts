import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Updated S3 avatar URLs from images.md
const avatars = [
    { name: 'Avatar 1', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-1.png' },
    { name: 'Avatar 2', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-2.png' },
    { name: 'Avatar 3', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-3.jpg' },
    { name: 'Avatar 4', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-4.jpg' },
    { name: 'Avatar 5', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-5.jpg' },
    { name: 'Avatar 6', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-6.jpg' },
    { name: 'Avatar 7', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-7.jpg' },
    { name: 'Avatar 8', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-8.jpg' },
    { name: 'Avatar 9', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-9.jpg' },
    { name: 'Avatar 10', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-10.jpg' },
    { name: 'Avatar 11', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-11.jpg' },
    { name: 'Avatar 12', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-12.jpg' },
    { name: 'Avatar 13', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-13.jpg' },
    { name: 'Avatar 14', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-14.jpg' },
    { name: 'Avatar 15', url: 'https://world-chat-prod.s3.ap-south-1.amazonaws.com/Avatars/avatar-15.jpg' },
];

async function main() {
    console.log('🌱 Starting avatar seed...');

    await prisma.avatar.deleteMany();
    console.log('✅ Cleared existing avatars');

    for (let i = 0; i < avatars.length; i++) {
        await prisma.avatar.create({
            data: {
                id: i + 1,
                name: avatars[i].name,
                url: avatars[i].url,
            },
        });
    }

    console.log(`✅ Inserted ${avatars.length} avatars`);
    console.log('🎉 Avatar seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
