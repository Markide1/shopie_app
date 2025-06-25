import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Create new product (Admin only)' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'number' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 4))
  async create(
    @Body() body: Record<string, any>,
    @UploadedFiles(
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
    images?: Express.Multer.File[],
  ) {
    console.log('Received images:', images?.length);

    const createProductDto: CreateProductDto = {
      name: typeof body.name === 'string' ? body.name : '',
      description: typeof body.description === 'string' ? body.description : '',
      price: Number(body.price),
      stock: Number(body.stock),
    };

    return this.productsService.create(createProductDto, images);
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'List of products' })
  @ApiResponse({ status: 404, description: 'Products not found' })
  @Get()
  findAll(@Query('search') search?: string) {
    return this.productsService.findAll(search);
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update product image, description, and name (Admin only)',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
    description: 'Update product image, description, and name',
  })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 5))
  async update(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @UploadedFiles(
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
    images?: Express.Multer.File[],
  ) {
    const updateProductDto: UpdateProductDto = {
      name: typeof body.name === 'string' ? body.name : undefined,
      description:
        typeof body.description === 'string' ? body.description : undefined,
      price: body.price ? Number(body.price) : undefined,
      stock: body.stock ? Number(body.stock) : undefined,
    };

    const imageIdsToRemove = body.removeImages
      ? Array.isArray(body.removeImages)
        ? body.removeImages
        : [body.removeImages]
      : undefined;

    return this.productsService.update(
      id,
      updateProductDto,
      images,
      imageIdsToRemove,
    );
  }

  @ApiOperation({ summary: 'Delete product by ID (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
