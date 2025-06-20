import { User, Order, Product } from '@prisma/client';

export type OrderWithDetails = Order & {
  user: User;
  orderItems: {
    product: {
      name: string;
      images: {
        imageUrl: string;
      }[];
    };
  }[];
};

export type WelcomeEmailData = Pick<User, 'email' | 'firstName' | 'lastName'>;

export type OrderEmailData = {
  order: OrderWithDetails;
  user: User;
};

export type LowStockEmailData = Pick<Product, 'id' | 'name' | 'stock'>;
