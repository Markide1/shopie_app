import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  goBack(): void {
  this.router.navigate(['/admin/dashboard']);
}

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: () => this.notificationService.show('Error loading users', 'error')
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          this.notificationService.show('User deleted successfully', 'success');
        },
        error: () => this.notificationService.show('Error deleting user', 'error')
      });
    }
  }
}