import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { OrdersService } from '../../../services/orders.service';
import { Order, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-dashboard.component.html'
})
export class CustomerDashboardComponent implements OnInit, OnDestroy {
  cartCount = 0;
  orderCount = 0;
  pendingOrdersCount = 0;
  recentOrders: Order[] = [];
  private destroy$ = new Subject<void>();

  private readonly statusClasses: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'bg-yellow-500/10 text-yellow-500',
    [OrderStatus.CONFIRMED]: 'bg-blue-500/10 text-blue-500',
    [OrderStatus.SHIPPED]: 'bg-purple-500/10 text-purple-500',
    [OrderStatus.DELIVERED]: 'bg-green-500/10 text-green-500',
    [OrderStatus.CANCELLED]: 'bg-red-500/10 text-red-500'
  };

  constructor(
    private cartService: CartService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    // Get cart count
    this.cartService.cartCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count: number) => {
        this.cartCount = count;
      });

    // Get orders
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrders(): void {
    this.ordersService.getUserOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe(orders => {
        this.orderCount = orders.length;
        this.pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
        this.recentOrders = orders.slice(0, 5); 
      });
  }

  getStatusClass(status: OrderStatus): string {
    return this.statusClasses[status];
  }
}