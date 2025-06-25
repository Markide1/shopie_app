import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrdersService } from '../../../services/orders.service';
import { NotificationService } from '../../../services/notification.service';
import { Order } from '../../../models/order.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cancel-order',
  templateUrl: './cancel-order.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class CancelOrderComponent {
  @Input() orderId!: string;
  @Input() disabled = false;
  loading = false;
  @Output() orderCancelled = new EventEmitter<Order>();

  constructor(
    private ordersService: OrdersService,
    private notificationService: NotificationService
  ) {}

  cancelOrder() {
    if (this.loading || this.disabled) return;
    this.loading = true;
    this.ordersService.cancelOrder(this.orderId).subscribe({
      next: (order) => {
        this.loading = false;
        this.notificationService.show('Order cancelled!', 'success');
        this.orderCancelled.emit(order);
      },
      error: () => {
        this.loading = false;
        this.notificationService.show('Failed to cancel order', 'error');
      }
    });
  }
}