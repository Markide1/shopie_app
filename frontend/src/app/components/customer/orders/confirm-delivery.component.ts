import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrdersService } from '../../../services/orders.service';
import { NotificationService } from '../../../services/notification.service';
import { Order } from '../../../models/order.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delivery',
  templateUrl: './confirm-delivery.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class ConfirmDeliveryComponent {
  @Input() orderId!: string;
  @Input() disabled = false;
  @Output() deliveryConfirmed = new EventEmitter<Order>();
  loading = false;

  constructor(
    private ordersService: OrdersService,
    private notificationService: NotificationService
  ) {}

  confirmDelivery() {
    if (this.loading || this.disabled) return;
    this.loading = true;
    this.ordersService.confirmDelivery(this.orderId).subscribe({
      next: (order) => {
        this.loading = false;
        this.notificationService.show('Delivery confirmed!', 'success');
        this.deliveryConfirmed.emit(order);
      },
      error: () => {
        this.loading = false;
        this.notificationService.show('Failed to confirm delivery', 'error');
      }
    });
  }
}