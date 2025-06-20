import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('profile')
  getProfile(@GetUser('id') userId: string) {
    return this.usersService.findOne(userId);
  }

  @ApiOperation({ summary: 'Find user by email' })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('by-email')
  async findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Put('profile')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateProfile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(image\/jpeg|image\/png|image\/jpg)/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser('id') userId: string,
  ) {
    return this.usersService.updateProfile(userId, updateUserDto, file);
  }

  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No users found' })
  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('role') role?: Role) {
    return this.usersService.findAll(role);
  }

  @ApiOperation({ summary: 'Deactivate  user account (Customer only)' })
  @ApiResponse({
    status: 200,
    description: 'User account deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete('deactivate')
  async deactivateAccount(@GetUser('id') userId: string) {
    return this.usersService.deactivateAccount(userId);
  }

  @ApiOperation({ summary: 'Remove inactive user account (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User account removed successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @GetUser('id') adminId: string) {
    return this.usersService.remove(id, adminId);
  }
}
