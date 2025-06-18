import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../shared/services/cloudinary.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

type UserResponse = Pick<
  User,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'profileImage'
  | 'role'
  | 'createdAt'
>;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll(role?: Role): Promise<UserResponse[]> {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profileImage: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    id: string,
    dto: UpdateUserDto,
    profileImage?: Express.Multer.File,
  ): Promise<UserResponse> {
    try {
      const updateData: Prisma.UserUpdateInput = {};

      if (dto.firstName !== undefined) {
        updateData.firstName = dto.firstName;
      }

      if (dto.lastName !== undefined) {
        updateData.lastName = dto.lastName;
      }

      if (dto.password) {
        updateData.password = await bcrypt.hash(dto.password, 12);
      }

      if (profileImage) {
        try {
          updateData.profileImage =
            await this.cloudinary.uploadImage(profileImage);
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            throw new BadRequestException('Invalid image format or size');
          }
          throw new BadRequestException('Failed to upload profile image');
        }
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException('Failed to update profile');
    }
  }

  async deactivateAccount(userId: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role === Role.ADMIN) {
        throw new ForbiddenException('Admin accounts cannot be deactivated');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.cartItem.deleteMany({
          where: { userId },
        });

        await tx.user.update({
          where: { id: userId },
          data: { isActive: false },
        });
      });

      return { message: 'Account deactivated successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException('Failed to deactivate account');
    }
  }

  async remove(id: string, adminId: string): Promise<{ message: string }> {
    try {
      const targetUser = await this.prisma.user.findUnique({
        where: { id },
        select: { isActive: true, role: true },
      });

      if (!targetUser) {
        throw new NotFoundException('User not found');
      }

      if (targetUser.isActive) {
        throw new ForbiddenException('Cannot delete active accounts');
      }
      if (id === adminId) {
        throw new ForbiddenException('Cannot delete admin account');
      }

      await this.prisma.user.delete({
        where: { id },
      });

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException('Failed to delete user');
    }
  }
}
