import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-product-form.component.html',
   
})
export class AdminProductFormComponent {
  productForm: FormGroup;
  selectedFiles: File[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required]
    });
  }


  onFileSelect(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files) {
      this.selectedFiles = Array.from(element.files);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      
      const formData = new FormData();
      Object.keys(this.productForm.value).forEach(key => {
        formData.append(key, this.productForm.value[key]);
      });
      
      this.selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      try {
        await firstValueFrom(this.productService.createProduct(formData));
        this.notificationService.show('Product created successfully', 'success');
        this.router.navigate(['/admin/products']);
      } catch (error) {
        this.notificationService.show('Error creating product', 'error');
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }
}