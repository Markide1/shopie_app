import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get cart items (Customer only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Cart items retrieved' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  @Get()
  getCart(@GetUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @ApiOperation({ summary: 'Add item to cart (Customer only)' })
  @ApiBearerAuth()
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Post()
  addToCart(@GetUser('id') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(userId, dto);
  }

  @ApiOperation({ summary: 'Update item quantity in cart (Customer only)' })
  @ApiBearerAuth()
  @ApiBody({ type: Number, description: 'New quantity' })
  @ApiResponse({ status: 200, description: 'Item quantity updated' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  @Put(':productId')
  updateQuantity(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateQuantity(userId, productId, quantity);
  }

  @ApiOperation({ summary: 'Remove item from cart (Customer only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  @Delete(':productId')
  removeFromCart(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ): Promise<{ message: string }> {
    return this.cartService.removeFromCart(userId, productId);
  }
}
