import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  email: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.resetPasswordForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.email = localStorage.getItem('resetEmail');
    if (!this.email) {
      this.notificationService.show('Please request a password reset first', 'error');
      this.router.navigate(['/forgot-password']);
    }
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.email) {
      const { token, newPassword } = this.resetPasswordForm.value;
      this.authService.resetPassword(token, newPassword).subscribe({
        next: () => {
          this.notificationService.show('Password reset successful', 'success');
          localStorage.removeItem('resetEmail');
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          this.notificationService.show(
            error.error.message || 'Password reset failed',
            'error'
          );
        }
      });
    }
  }
}
