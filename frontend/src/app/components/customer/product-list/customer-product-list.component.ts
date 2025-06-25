import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Product, ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-customer-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-product-list.component.html',

})
export class CustomerProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  selectedProduct: Product | null = null;
  showModal = false;
  isLoading = false;
  error: string | null = null; 
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.isLoading = false;
        },
        error: () => {
          this.notificationService.show('Error loading products', 'error');
          this.isLoading = false;
        }
      });
  }

  openProductDetails(product: Product): void {
    this.selectedProduct = product;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    this.notificationService.show('Added to cart successfully', 'success');
  }

  onModalClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }
}
