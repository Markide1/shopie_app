import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize, switchMap } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { OrdersService } from '../../../services/orders.service';
import { NotificationService } from '../../../services/notification.service';
import { CartItem } from '../../../models/cart.model';
import { CreateOrderDto } from '../../../models/order.model';

@Component({
  selector: 'app-customer-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './customer-checkout.component.html'
})
export class CustomerCheckoutComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  loading = true;
  submitting = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private ordersService: OrdersService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.checkoutForm = this.fb.group({
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      paymentMethod: ['CARD', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCart(): void {
    const items: CartItem[] = this.cartService.getCartItems();
    if (items.length === 0) {
      this.router.navigate(['/customer/cart']);
      return;
    }
    this.cartItems = items;
    this.loading = false;
  }

  get totalAmount(): number {
    return this.cartItems.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid) {
      this.notificationService.show('Please fill in all required fields', 'error');
      return;
    }

    this.submitting = true;
    const formValue = this.checkoutForm.value;

    this.cartService.syncLocalCartToBackend()
      .pipe(
        switchMap(() => this.cartService.getBackendCart()),
        switchMap((backendCart) => {
          if (!backendCart.length) {
            throw new Error('No valid cart items found');
          }
          const orderData = {
            cartIds: backendCart.map(item => item.id),
            address: formValue.address,
            city: formValue.city,
            postalCode: formValue.postalCode,
            country: formValue.country,
            paymentMethod: formValue.paymentMethod
          };
          return this.ordersService.createOrder(orderData);
        }),
        takeUntil(this.destroy$),
        finalize(() => this.submitting = false)
      )
      .subscribe({
        next: (order) => {
          this.notificationService.show('Order placed successfully!', 'success');
          this.cartService.clearCart();
          this.router.navigate(['/customer/orders', order.id]);
        },
        error: (err) => {
          console.error('Order creation error:', err);
          this.error = err.error?.message || err.message || 'Failed to place order';
          this.notificationService.show(this.error ?? 'Failed to place order', 'error');
        }
      });
  }
}