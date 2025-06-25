import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrdersService, DashboardStats, RecentOrder } from '../../../services/orders.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  stats: DashboardStats = {
    totalOrders: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  };
  recentOrders: RecentOrder[] = [];

  constructor(
    private ordersService: OrdersService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.ordersService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: DashboardStats) => this.stats = stats,
        error: () => this.notificationService.show('Error loading dashboard stats', 'error')
      });

    this.ordersService.getRecentOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders: RecentOrder[]) => this.recentOrders = orders,
        error: () => this.notificationService.show('Error loading recent orders', 'error')
      });
  }

  getStatusClass(status: string): string {
    const classes = {
      'PENDING': 'text-yellow-400',
      'CONFIRMED': 'text-blue-400',
      'SHIPPED': 'text-purple-400',
      'DELIVERED': 'text-green-400',
      'CANCELLED': 'text-red-400'
    };
    return classes[status as keyof typeof classes] || 'text-gray-400';
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/admin/orders', orderId]);
  }
}