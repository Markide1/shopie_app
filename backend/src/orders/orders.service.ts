import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../shared/services/email.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma } from '@prisma/client';
import { Role } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  private readonly productInclude = {
    product: {
      select: {
        name: true,
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
  };

  // Create a new order
  async create(userId: string, dto: CreateOrderDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check if user is admin
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (user.role === Role.ADMIN) {
          throw new ForbiddenException('Admin users cannot create orders');
        }

        // Get cart items
        const cartItems = await tx.cartItem.findMany({
          where: {
            userId,
            id: { in: dto.cartIds },
          },
          include: {
            product: true,
          },
        });

        if (cartItems.length === 0) {
          throw new BadRequestException('No valid cart items found');
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce(
          (sum, item) => sum + item.product.price.toNumber() * item.quantity,
          0,
        );

        if (totalAmount <= 0) {
          throw new BadRequestException(
            'Total amount must be greater than zero',
          );
        }
        const order = await tx.order.create({
          data: {
            userId,
            totalAmount: new Prisma.Decimal(totalAmount),
            address: dto.address,
            city: dto.city,
            postalCode: dto.postalCode,
            country: dto.country,
            orderItems: {
              create: cartItems.map((item) => ({
                quantity: item.quantity,
                price: item.product.price,
                productId: item.productId,
              })),
            },
          },
          include: {
            user: true,
            orderItems: {
              include: this.productInclude,
            },
          },
        });

        // Remove items from cart
        await tx.cartItem.deleteMany({
          where: {
            id: { in: dto.cartIds },
          },
        });

        return order;
      });
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to create order');
    }
  }

  // Confirm payment for an order
  async confirmPayment(orderId: string, userId: string) {
    try {
      const order = await this.prisma.order.findFirst({
        where: { id: orderId, userId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.isPaid) {
        throw new BadRequestException('Order is already paid');
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          status: OrderStatus.CONFIRMED,
        },
        include: {
          user: true,
          orderItems: {
            include: this.productInclude,
          },
        },
      });

      if (updatedOrder.user) {
        await this.emailService.sendOrderConfirmationEmail({
          order: updatedOrder,
          user: updatedOrder.user,
        });
        await this.emailService.sendOrderReceivedAdminEmail(updatedOrder);
      }

      return updatedOrder;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to confirm payment');
    }
  }

  // Update shipping status of an order
  async updateShippingStatus(orderId: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          orderItems: {
            include: this.productInclude,
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (!order.isPaid) {
        throw new BadRequestException('Cannot ship unpaid order');
      }

      if (order.status !== OrderStatus.CONFIRMED) {
        throw new BadRequestException(
          'Order must be confirmed before shipping',
        );
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.SHIPPED },
        include: {
          user: true,
          orderItems: {
            include: this.productInclude,
          },
        },
      });

      if (updatedOrder.user) {
        await this.emailService.sendOrderShippedEmail(updatedOrder);
      }

      return updatedOrder;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update shipping status');
    }
  }

  // Get all orders
  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: this.productInclude,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get a specific order
  async findOne(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        orderItems: {
          include: this.productInclude,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // Update the status of an order
  async updateStatus(orderId: string, status: OrderStatus) {
    try {
      return await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          orderItems: {
            include: this.productInclude,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException('Order not found');
      }
      throw new BadRequestException('Failed to update order status');
    }
  }

  // Get all orders for admin
  async findAllAdmin() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItems: {
          include: this.productInclude,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Cancel an order
  async cancelOrder(orderId: string, userId: string) {
    try {
      const order = await this.prisma.order.findFirst({
        where: { id: orderId, userId },
        include: {
          user: true,
          orderItems: {
            include: this.productInclude,
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.SHIPPED) {
        throw new BadRequestException('Cannot cancel shipped order');
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Order is already cancelled');
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          isPaid: order.isPaid ? true : false,
        },
        include: {
          user: true,
          orderItems: {
            include: this.productInclude,
          },
        },
      });

      // Restore product stock
      for (const item of order.orderItems) {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Send cancellation emails
      if (updatedOrder.user) {
        // Send email to customer
        await this.emailService.sendOrderCancelledEmail(updatedOrder);

        // Send email to admin
        await this.emailService.sendOrderCancelledAdminEmail(updatedOrder);
      }

      return updatedOrder;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to cancel order');
    }
  }

  // Confirm delivery of an order
  async confirmDelivery(orderId: string, userId: string) {
    try {
      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
          status: OrderStatus.SHIPPED,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          orderItems: {
            include: this.productInclude,
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found or not shipped');
      }

      if (order.user.role !== Role.CUSTOMER) {
        throw new ForbiddenException('Only customers can confirm delivery');
      }

      if (order.status === OrderStatus.DELIVERED) {
        throw new BadRequestException('Order is already marked as delivered');
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.DELIVERED,
        },
        include: {
          user: true,
          orderItems: {
            include: this.productInclude,
          },
        },
      });

      // Send delivery confirmation email to admin
      if (updatedOrder.user) {
        await this.emailService.sendOrderDeliveredAdminEmail(updatedOrder);
      }

      return updatedOrder;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to confirm delivery');
    }
  }
}
