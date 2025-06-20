import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartItem } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  // Adds a product to the Customer's cart
  async addToCart(userId: string, dto: AddToCartDto): Promise<CartItem> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: dto.productId, isActive: true },
        });

        if (!product) {
          throw new NotFoundException('Product not found');
        }

        if (product.stock < dto.quantity) {
          throw new BadRequestException('Insufficient stock');
        }

        const existingItem = await tx.cartItem.findUnique({
          where: {
            userId_productId: {
              userId,
              productId: dto.productId,
            },
          },
        });

        if (existingItem) {
          throw new ConflictException('Product already in cart');
        }

        // Update product stock
        await tx.product.update({
          where: { id: dto.productId },
          data: { stock: { decrement: dto.quantity } },
        });

        const cartItem = await tx.cartItem.create({
          data: {
            userId,
            productId: dto.productId,
            quantity: dto.quantity,
          },
        });

        // After updating stock, check levels
        const updatedProduct = await tx.product.findUnique({
          where: { id: dto.productId },
        });

        if (updatedProduct) {
          await this.productsService.checkAndNotifyLowStock(updatedProduct);
        }

        return cartItem;
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to add item to cart');
    }
  }

  // Get all items in the Customer's cart
  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            images: {
              select: {
                imageUrl: true,
              },
              where: {
                isMain: true,
              },
              take: 1,
            },
          },
        },
      },
    });
  }

  // Update the quantity of a product in the cart
  async updateQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItem> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const cartItem = await tx.cartItem.findUnique({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
        });

        if (!cartItem) {
          throw new NotFoundException('Cart item not found');
        }

        if (quantity <= 0) {
          throw new BadRequestException('Quantity must be greater than zero');
        }
        const quantityDiff = quantity - cartItem.quantity;

        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product || product.stock < quantityDiff) {
          throw new BadRequestException('Insufficient stock');
        }

        // Update product stock
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantityDiff } },
        });

        // Update cart item
        const updatedCartItem = await tx.cartItem.update({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
          data: { quantity },
        });

        // After updating stock, check levels
        const updatedProduct = await tx.product.findUnique({
          where: { id: productId },
        });

        if (updatedProduct) {
          await this.productsService.checkAndNotifyLowStock(updatedProduct);
        }

        return updatedCartItem;
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to update cart item');
    }
  }

  // Remove a product from the Customer's cart
  async removeFromCart(
    userId: string,
    productId: string,
  ): Promise<{ message: string }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const cartItem = await tx.cartItem.findUnique({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!cartItem) {
          throw new NotFoundException('Cart item not found');
        }

        // Restore product stock
        await tx.product.update({
          where: { id: productId },
          data: { stock: { increment: cartItem.quantity } },
        });

        // Remove cart item
        await tx.cartItem.delete({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
        });

        return {
          message: `Product ${cartItem.product.name} removed from cart successfully`,
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to remove item from cart');
    }
  }
}
