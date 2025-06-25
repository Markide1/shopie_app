import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: Array<{ imageUrl: string }>;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  productForm: FormGroup;
  selectedFiles: File[] = [];
  isEditing = false;
  editingId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    const formData = new FormData();
    Object.keys(this.productForm.value).forEach(key => {
      formData.append(key, this.productForm.get(key)?.value);
    });

    this.selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    if (this.isEditing && this.editingId) {
      this.updateProduct(this.editingId, formData);
    } else {
      this.createProduct(formData);
    }
  }

  private createProduct(formData: FormData): void {
    this.productService.createProduct(formData).subscribe({
      next: () => {
        this.notificationService.show('Product created successfully', 'success');
        this.resetForm();
        this.loadProducts();
      },
      error: (error) => {
        this.notificationService.show(error.message || 'Error creating product', 'error');
      }
    });
  }

  private updateProduct(id: string, formData: FormData): void {
    this.productService.updateProduct(id, formData).subscribe({
      next: () => {
        this.notificationService.show('Product updated successfully', 'success');
        this.resetForm();
        this.loadProducts();
      },
      error: (error) => {
        this.notificationService.show(error.message || 'Error updating product', 'error');
      }
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.notificationService.show('Product deleted successfully', 'success');
          this.loadProducts();
        },
        error: (error) => {
          this.notificationService.show(error.message || 'Error deleting product', 'error');
        }
      });
    }
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => this.products = products,
      error: () => this.notificationService.show('Error loading products', 'error')
    });
  }

  private resetForm(): void {
    this.productForm.reset({
      price: 0,
      stock: 0
    });
    this.selectedFiles = [];
    this.isEditing = false;
    this.editingId = null;
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.editingId = product.id;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock
    });
  }
  goBack(): void {
  this.router.navigate(['/admin/dashboard']);
}
}