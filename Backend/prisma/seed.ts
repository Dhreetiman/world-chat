import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Create global room
    const globalRoom = await prisma.room.upsert({
        where: { name: 'global' },
        update: {},
        create: {
            id: 'global',
            name: 'global',
            description: 'General discussion for all developers',
            isPublic: true,
        },
    });
    console.log(`Created room: ${globalRoom.name}`);

    // Create avatar presets
    const avatars = [
        { name: 'Avatar 1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDMap2CDWof8WvMU6n5ZB3tLY6KRkwEBMRCX3gLsLo5k3ckeMyqFEt1SDSOmWTqb7fUFA9KCrn-D9X4WtyO7eBkJY24ILe8DvU9T0LPwgti_6ntm6dE1PUSpaDUUsjQZ7hBUrzV_D_bMIpNcBY4gSZhx6TMDO1ARxRRlgn17VbCNPxtjshV-EjyyJDLkeG1KfTWsoVTi4XY-INutDifGo2m2P8evW8r-txbII-ae4H3qhepXkHUYOkeYYOiNZWPWU8j84f8lNvFXwi' },
        { name: 'Avatar 2', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAURjg0F3w7PQxCwYYqRt2rxyudJX6j3lPlWCYV9rb3ceMG1YTwjtIlsepmKTyo54M5ExJhG2MqTIstK1WL5TOs7numeVNRuPfv614EaY2ncOpjvLcif8VMFODfepbCX8XN6WROGGvmsRswmj9gmM8UO-VS3OuSU_woEfQweSWzLJmbKhFdktQ-oxyW6ThtfhT2RTzmT__RQQF52wKKyMQAukF4OKS99n-bYkfPnvwHD9Kw0B6fk9_cd1Mb-oZ8uxNck3XqA0eo_AiX' },
        { name: 'Avatar 3', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE2NMCFdXEzPu4y-Z_Ya4NXraRb0RRU_7v-xLyQWeh7J5i7XDdyazHCaW0K7gojbv0A3CZF82CgZs-QLGRSl5LjxEfIk5S8yr5W0_lMFASCAh2c1Toi7tbQkdIdq-svayHaDjNOmwU0uhku4WaNw-EyB0btXjMIW01Xzt5UEWaJ9ZytPIXxw4ivosEteZ0pqH31u7jhrRDBkvzhPIx_iNNZNQCPyoEGkUanHpGiJTkT4xJsj3WQsrzb2SW0mBM8TU1BcR9XBQUT22n' },
    ];

    for (const avatar of avatars) {
        await prisma.avatar.create({
            data: avatar,
        });
    }
    console.log(`Created ${avatars.length} avatars`);

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
