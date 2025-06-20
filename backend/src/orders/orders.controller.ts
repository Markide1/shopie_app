import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create new order (Customer only)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created' })
  @Post()
  async create(@GetUser('id') userId: string, @Body() dto: CreateOrderDto) {
    try {
      return await this.ordersService.create(userId, dto);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new ForbiddenException('Admin users cannot create orders');
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Get all orders for user' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Orders retrieved' })
  @ApiResponse({ status: 404, description: 'No orders found' })
  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.ordersService.findAll(userId);
  }

  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Orders retrieved' })
  @ApiResponse({ status: 404, description: 'No orders found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Get('admin')
  @Roles(Role.ADMIN)
  findAllAdmin() {
    return this.ordersService.findAllAdmin();
  }

  @ApiOperation({ summary: 'Get order by ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Order retrieved' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Get(':id')
  findOne(@GetUser('id') userId: string, @Param('id') orderId: string) {
    return this.ordersService.findOne(userId, orderId);
  }

  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiBearerAuth()
  @ApiBody({ type: String, description: 'New order status' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Put(':id/status')
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') orderId: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(orderId, status);
  }

  @ApiOperation({ summary: 'Confirm payment for order (Customer only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Payment confirmed' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Put(':id/confirm-payment')
  confirmPayment(@GetUser('id') userId: string, @Param('id') orderId: string) {
    return this.ordersService.confirmPayment(orderId, userId);
  }

  @ApiOperation({ summary: 'Update shipping status (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Shipping status updated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Put(':id/ship')
  @Roles(Role.ADMIN)
  updateShippingStatus(@Param('id') orderId: string) {
    return this.ordersService.updateShippingStatus(orderId);
  }

  @ApiOperation({ summary: 'Cancel order (Customer only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Put(':id/cancel')
  async cancelOrder(
    @GetUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.cancelOrder(orderId, userId);
  }

  @ApiOperation({ summary: 'Confirm order delivery (Customer only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Delivery confirmed' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @Put(':id/confirm-delivery')
  @Roles(Role.CUSTOMER)
  async confirmDelivery(
    @GetUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.confirmDelivery(orderId, userId);
  }
}
