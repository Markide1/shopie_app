import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../models/cart.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-guest-cart',
  templateUrl: './guest-cart.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class GuestCartComponent implements OnInit {
  items: CartItem[] = [];

  constructor(private cartService: CartService) {}

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
    localStorage.setItem('cart', JSON.stringify(this.items));
    window.location.href = '/login';
  }
}