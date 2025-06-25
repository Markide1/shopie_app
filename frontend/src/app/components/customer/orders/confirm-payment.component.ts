import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrdersService } from '../../../services/orders.service';
import { NotificationService } from '../../../services/notification.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-confirm-payment',
  templateUrl: './confirm-payment.component.html',
  standalone: true,
  imports: [NgIf, CommonModule],
})
export class ConfirmPaymentComponent {
  @Input() orderId!: string;
  @Input() order?: Order; 
  @Input() disabled = false;
  @Output() paymentConfirmed = new EventEmitter<Order>();
  loading = false;
  OrderStatus = OrderStatus; 

  constructor(
    private ordersService: OrdersService,
    private notificationService: NotificationService
  ) {}

  confirmPayment() {
    if (this.loading || this.disabled) return;
    this.loading = true;
    this.ordersService.confirmPayment(this.orderId).subscribe({
      next: (order) => {
        this.loading = false;
        this.notificationService.show('Payment confirmed!', 'success');
        this.paymentConfirmed.emit(order);
      },
      error: () => {
        this.loading = false;
        this.notificationService.show('Failed to confirm payment', 'error');
      }
    });
  }
}

