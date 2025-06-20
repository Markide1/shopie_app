import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password properly
  const hashedPassword = await bcrypt.hash('Admin_1234', 12);

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'markndwiga@gmail.com',
      password: hashedPassword,
      role: Role.ADMIN,
      firstName: 'Shop',
      lastName: 'Admin',
    },
  });

  console.log('Admin added successfully');
}

main()
  .catch((error) => {
    console.error('Error adding Admin:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((error) => {
      console.error('Error disconnecting from the database:', error);
    });
  });
