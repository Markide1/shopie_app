import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { NotificationService } from '../../../services/notification.service';
import { Order, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-admin-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-order-details.component.html',
})
export class AdminOrderDetailsComponent implements OnInit {
  order?: Order;
  loading = true;
  error: string | null = null;
  OrderStatus = OrderStatus; 

  constructor(
    private ordersService: OrdersService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  private loadOrder(orderId: string): void {
    this.ordersService.getAdminOrders().subscribe({
      next: (orders) => {
        this.order = orders.find(o => o.id === orderId);
        this.loading = false;
        if (!this.order) {
          this.error = 'Order not found';
        }
      },
      error: () => {
        this.error = 'Failed to load order';
        this.loading = false;
        this.notificationService.show('Error loading order', 'error');
      },
    });
  }

  updateStatus(orderId: string): void {
    const newStatus =
      this.order?.status === OrderStatus.PENDING
        ? OrderStatus.CONFIRMED
        : OrderStatus.SHIPPED;

    this.ordersService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.notificationService.show('Order status updated', 'success');
      },
      error: () => {
        this.notificationService.show('Failed to update order', 'error');
      },
    });
  }

  confirmShipping(orderId: string): void {
    this.ordersService.shipOrder(orderId).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.notificationService.show('Order marked as shipped', 'success');
      },
      error: () => {
        this.notificationService.show('Failed to mark as shipped', 'error');
      },
    });
  }

  getStatusClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'bg-gray-400 text-yellow-800',
      [OrderStatus.CONFIRMED]: 'bg-gray-400 text-blue-800',
      [OrderStatus.SHIPPED]: 'bg-gray-400 text-purple-800',
      [OrderStatus.DELIVERED]: 'bg-gray-400 text-green-800',
      [OrderStatus.CANCELLED]: 'bg-gray-400 text-red-800',
    };
    return classes[status] || 'bg-gray-400 text-gray-400';
  }

  goBack(): void {
    this.router.navigate(['/admin/orders']);
  }
}
