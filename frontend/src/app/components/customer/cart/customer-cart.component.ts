import { NotificationService } from './../../../services/notification.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../models/cart.model';
import { Router, RouterModule } from '@angular/router';



@Component({
  selector: 'app-customer-cart',
  templateUrl: './customer-cart.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class CustomerCartComponent implements OnInit {
  items: CartItem[] = [];

  constructor(private cartService: CartService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.items = this.cartService.getItems();
  }

  remove(productId: string) {
    this.cartService.removeItem(productId);
    this.items = this.cartService.getItems();
  }

  updateQuantity(productId: string, quantity: number) {
    this.cartService.updateItem(productId, quantity);
    this.items = this.cartService.getItems();
  }

  checkout() {
    // Implement checkout by getting items from localstorage and proceeding to checkout (/customer/checkout)
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartItems.length > 0) {
      // Proceed to checkout
      window.location.href = '/customer/checkout';
    } else {
      this.notificationService.show('Your cart is empty', 'error');
    }
  }
}