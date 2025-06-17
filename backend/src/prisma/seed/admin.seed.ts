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

  // Create sample products
  await prisma.product.createMany({
    data: [
      {
        name: 'Dell x9 Laptop',
        description: 'High-performance laptop',
        price: 84999.99,
        stock: 10,
      },
      {
        name: 'Dell Wireless Mouse',
        description: 'Wireless mouse',
        price: 599.99,
        stock: 50,
      },
    ],
  });

  console.log('Data added successfully');
}

main()
  .catch((error) => {
    console.error('Error adding data:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((error) => {
      console.error('Error disconnecting from the database:', error);
    });
  });
