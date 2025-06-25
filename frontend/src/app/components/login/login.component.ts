import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private cartService: CartService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password)
        .pipe(
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: (response) => {
            // Merge guest cart with user cart
            const guestCart = JSON.parse(localStorage.getItem('shopie_cart') || '[]');
            this.cartService.mergeGuestCart(guestCart);
            this.notificationService.show('Login successful', 'success');
            
            // Get return URL from route parameters or default to '/'
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || 
              (response.user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard');
            
            this.router.navigate([returnUrl]);
          },
          error: (error) => {
            console.error('Login error:', error);
            this.errorMessage = error.error?.message || 'Login failed. Please try again.';
            this.notificationService.show(this.errorMessage, 'error');
            this.loginForm.get('password')?.reset();
          }
        });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      this.notificationService.show(this.errorMessage, 'error');
    }
  }
}