import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../shared/services/cloudinary.service';
import { EmailService } from '../shared/services/email.service';
import { Product, Prisma } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  private readonly LOW_STOCK_THRESHOLD = 5;

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private emailService: EmailService,
  ) {}

  // Check stock levels and notify if low

  public async checkAndNotifyLowStock(product: Product): Promise<void> {
    if (product.stock < this.LOW_STOCK_THRESHOLD) {
      await this.emailService.sendLowStockAlert(product);
    }
  }

  // Create a new product
  async create(
    dto: CreateProductDto,
    images?: Express.Multer.File[],
  ): Promise<Product> {
    try {
      if (typeof dto.price !== 'string' && typeof dto.price !== 'number') {
        throw new BadRequestException('Invalid price value');
      }

      return await this.prisma.$transaction(async (tx) => {
        const existingProduct = await tx.product.findFirst({
          where: {
            OR: [{ name: dto.name }, { description: dto.description }],
            isActive: true,
          },
        });

        if (existingProduct) {
          throw new ConflictException(
            'Try unique details as these already exist',
          );
        }
        const product = await tx.product.create({
          data: {
            ...dto,
            price: new Prisma.Decimal(
              typeof dto.price === 'string' || typeof dto.price === 'number'
                ? dto.price
                : 0,
            ),
          },
        });

        if (images?.length) {
          const imageUrls = await Promise.all(
            images.map((image) =>
              this.cloudinary.uploadImage(image, 'shopie-products'),
            ),
          );

          await tx.productImage.createMany({
            data: imageUrls.map((url, index) => ({
              productId: product.id,
              imageUrl: url,
              isMain: index === 0,
            })),
          });
        }

        const createdProduct = await tx.product.findUnique({
          where: { id: product.id },
          include: {
            images: {
              orderBy: {
                isMain: 'desc',
              },
            },
          },
        });

        if (!createdProduct) {
          throw new NotFoundException('Product not found after creation');
        }

        await this.checkAndNotifyLowStock(createdProduct);

        return createdProduct;
      });
    } catch (error) {
      console.error('Error creating product:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create product');
    }
  }

  // Find all products with partial name
  async findAll(search?: string) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: {
            isMain: 'desc',
          },
        },
      },
    });
  }

  // Find a product by ID
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Update a product
  async update(
    id: string,
    dto: UpdateProductDto,
    newImages?: Express.Multer.File[],
    imageIdsToRemove?: string[],
  ): Promise<Product> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (dto.name || dto.description) {
          const existingProduct = await tx.product.findFirst({
            where: {
              OR: [
                dto.name ? { name: dto.name } : {},
                dto.description ? { description: dto.description } : {},
              ],
              NOT: { id },
              isActive: true,
            },
          });

          if (existingProduct) {
            throw new ConflictException(
              'Try unique details as these already exist',
            );
          }
        }

        const data: Prisma.ProductUpdateInput = { ...dto };
        if (dto.price !== undefined) {
          data.price = new Prisma.Decimal(dto.price);
        }

        if (imageIdsToRemove?.length) {
          await tx.productImage.deleteMany({
            where: {
              id: { in: imageIdsToRemove },
              productId: id,
            },
          });
        }

        if (newImages?.length) {
          const imageUrls = await Promise.all(
            newImages.map((image) => this.cloudinary.uploadImage(image)),
          );

          await tx.productImage.createMany({
            data: imageUrls.map((url) => ({
              productId: id,
              imageUrl: url,
            })),
          });
        }

        const updatedProduct = await tx.product.update({
          where: { id, isActive: true },
          data,
          include: {
            images: true,
          },
        });

        await this.checkAndNotifyLowStock(updatedProduct);

        return updatedProduct;
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException('Product not found');
      }
      throw new BadRequestException('Failed to update product');
    }
  }

  // Remove a product
  async remove(id: string): Promise<{ message: string }> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id },
          include: {
            cartItems: true,
            images: true,
            orderItems: {
              include: {
                order: true,
              },
            },
          },
        });

        if (!product) {
          throw new NotFoundException('Product not found');
        }

        if (product.cartItems.length > 0) {
          throw new BadRequestException(
            'Cannot delete product that is in cart',
          );
        }

        const hasActiveOrders = product.orderItems.some((item) =>
          ['PENDING', 'CONFIRMED', 'SHIPPED'].includes(item.order.status),
        );

        if (hasActiveOrders) {
          throw new BadRequestException(
            'Cannot delete product with active orders',
          );
        }

        // Delete associated images from cloudinary
        for (const image of product.images) {
          const publicId = image.imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await this.cloudinary.deleteImage(publicId);
          }
        }

        await tx.product.delete({
          where: { id },
        });

        return {
          message: `Product ${product.name} deleted successfully`,
        };
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete product');
    }
  }
}
