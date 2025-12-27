
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@wathiqni.com' },
        update: {},
        create: {
            email: 'admin@wathiqni.com',
            passwordHash: password,
            fullName: 'Admin User',
        },
    });

    // Regular User
    const user = await prisma.user.upsert({
        where: { email: 'user@wathiqni.com' },
        update: {},
        create: {
            email: 'user@wathiqni.com',
            passwordHash: userPassword,
            fullName: 'Test User',
        },
    });

    console.log({ admin, user });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
