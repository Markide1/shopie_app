import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdersService, Order } from '../../../services/orders.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-orders.component.html'
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.getAdminOrders().subscribe({
      next: (orders) => this.orders = orders,
      error: (error) => console.error('Error loading orders:', error)
    });
  }

  updateStatus(orderId: string, status: string): void {
    this.ordersService.updateOrderStatus(orderId, status).subscribe({
      next: () => this.loadOrders(),
      error: (error) => console.error('Error updating order:', error)
    });
  }
}