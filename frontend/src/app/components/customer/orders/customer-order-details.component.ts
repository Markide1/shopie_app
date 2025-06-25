import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrdersService } from '../../../services/orders.service';
import { NotificationService } from '../../../services/notification.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { ConfirmPaymentComponent } from "./confirm-payment.component";
import { ConfirmDeliveryComponent } from "./confirm-delivery.component";
import { CancelOrderComponent } from "./cancel-order.component";

@Component({
  selector: 'app-customer-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmPaymentComponent, ConfirmDeliveryComponent, CancelOrderComponent],
  templateUrl: './customer-order-details.component.html',
})
export class CustomerOrderDetailsComponent implements OnInit, OnDestroy {
  order?: Order;
  loading = true;
  error: string | null = null;
  OrderStatus = OrderStatus; 
  private destroy$ = new Subject<void>();

  constructor(
    private ordersService: OrdersService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOrder(orderId: string): void {
    this.ordersService.getOrderById(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load order';
          this.loading = false;
          this.notificationService.show('Error loading order', 'error');
        }
      });
  }

  confirmDelivery(orderId: string): void {
    this.ordersService.confirmDelivery(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          this.notificationService.show('Delivery confirmed successfully', 'success');
        },
        error: () => {
          this.notificationService.show('Failed to confirm delivery', 'error');
        }
      });
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