import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { NotificationService } from '../../../services/notification.service';
import { Order, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-orders.component.html',
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(
    private ordersService: OrdersService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.getAdminOrders().subscribe({
      next: (orders) => (this.orders = orders),
      error: () => this.notificationService.show('Error loading orders', 'error'),
    });
  }

  getStatusClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
      [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/admin/orders', orderId]);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
