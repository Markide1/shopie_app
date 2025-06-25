import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

interface ForgotPasswordResponse {
  message: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const { email } = this.forgotPasswordForm.value;
      this.authService.forgotPassword(email).subscribe({
        next: (response: ForgotPasswordResponse) => {
          this.notificationService.show(
            'Password reset code has been sent to your email',
            'success'
          );
          // Store email for reset password page
          localStorage.setItem('resetEmail', email);
          // Navigate to reset password page
          this.router.navigate(['/reset-password']);
        },
        error: (error: any) => {
          this.notificationService.show(
            error.error.message || 'Failed to process request',
            'error'
          );
        }
      });
    }
  }
}
