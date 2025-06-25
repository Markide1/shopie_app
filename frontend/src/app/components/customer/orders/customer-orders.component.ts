import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrdersService } from '../../../services/orders.service';
import { Order, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-orders.component.html',
})
export class CustomerOrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrders(): void {
    this.loading = true;
    this.ordersService.getUserOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load orders';
          this.loading = false;
        }
      });
  }

  getStatusClass(status: OrderStatus): string {
    const classes = {
      [OrderStatus.PENDING]: 'bg-gray-400/10 text-white',
      [OrderStatus.CONFIRMED]: 'bg-gray-500/10 text-gray-200',
      [OrderStatus.SHIPPED]: 'bg-gray-500/10 text-gray-300',
      [OrderStatus.DELIVERED]: 'bg-gray-500/10 text-green-500',
      [OrderStatus.CANCELLED]: 'bg-gray-500/10 text-red-500'
    };
    return classes[status] || 'bg-gray-500/10 text-white';
  }

  getOrderAddress(order: Order): string {
    return order.address || order.shippingAddress?.address || '';
  }

  getOrderCity(order: Order): string {
    return order.city || order.shippingAddress?.city || '';
  }

  getOrderPostalCode(order: Order): string {
    return order.postalCode || order.shippingAddress?.postalCode || '';
  }

  getOrderCountry(order: Order): string {
    return order.country || order.shippingAddress?.country || '';
  }
}