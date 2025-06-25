import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';
import { User } from '../../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  submitting = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      password: [''],
    });
    // Optionally, load current user data here
    this.userService.getCurrentUser().subscribe((user: User) => {
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit() {
    this.submitting = true;
    const formData = new FormData();

    Object.entries(this.profileForm.value).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.userService.updateProfile(formData).subscribe({
      next: () => {
        this.notification.show('Profile updated!', 'success');
        this.submitting = false;
      },
      error: () => {
        this.notification.show('Failed to update profile', 'error');
        this.submitting = false;
      }
    });
  }

  deactivateAccount() {
    if (!confirm('Are you sure you want to deactivate your account?')) return;
    this.userService.deactivateAccount().subscribe({
      next: () => {
        this.notification.show('Account deactivated', 'success');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.notification.show('Failed to deactivate account', 'error');
      }
    });
  }
}