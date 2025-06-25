import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CartItem, AddToCartDto } from '../models/cart.model';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly CART_KEY = 'shopie_cart';
  private cartItems: CartItem[] = [];
  cartCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  private loadCart() {
    const data = localStorage.getItem(this.CART_KEY);
    this.cartItems = data ? JSON.parse(data) : [];
    this.updateCartCount();
  }

  private saveCart() {
    localStorage.setItem(this.CART_KEY, JSON.stringify(this.cartItems));
    this.updateCartCount();
  }

  private updateCartCount() {
    this.cartCount$.next(
      this.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    );
  }

  getItems(): CartItem[] {
    return [...this.cartItems];
  }

  getCartItems(): CartItem[] {
    return this.getItems();
  }

  addItem(item: CartItem) {
    const existing = this.cartItems.find(
      (i) => i.product.id === item.product.id
    );
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.cartItems.push(item);
    }
    this.saveCart();
  }

  addToCart(product: CartItem['product'], quantity: number = 1) {
    const existing = this.cartItems.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cartItems.push({
        id: Math.random().toString(36).substring(2),
        product,
        quantity,
      });
    }
    this.saveCart();
  }

  updateItem(productId: string, quantity: number) {
    const item = this.cartItems.find((i) => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  removeItem(productId: string) {
    this.cartItems = this.cartItems.filter((i) => i.product.id !== productId);
    this.saveCart();
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  mergeGuestCart(guestItems: CartItem[]): void {
    guestItems.forEach((guestItem) => {
      const existing = this.cartItems.find(
        (i) => i.product.id === guestItem.product.id
      );
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        this.cartItems.push({ ...guestItem });
      }
    });
    this.saveCart();
  }

  syncLocalCartToBackend(): Observable<any> {
    const localCart = this.getCartItems();
    if (!localCart.length) return of([]);

    return this.getBackendCart().pipe(
      switchMap((backendCart) => {
        const backendProductIds = (backendCart || []).map(
          (item) => item.product.id
        );
        const itemsToSync = localCart.filter(
          (item) => !backendProductIds.includes(item.product.id)
        );

        if (!itemsToSync.length) {
          return of([]);
        }

        const requests = itemsToSync.map((item) =>
          this.http
            .post('http://localhost:3000/cart', {
              productId: item.product.id,
              quantity: item.quantity,
            })
            .pipe(
              catchError((err) => {
                if (err.status === 409) {
                  return of(null);
                }
                throw err;
              })
            )
        );
        return forkJoin(requests);
      })
    );
  }

  getBackendCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>('http://localhost:3000/cart');
  }
}
