import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-auth-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-header.component.html'
})
export class AuthHeaderComponent {

  public logout(): void {
    this.authService.logout();
  }

  constructor(public authService: AuthService) {}
}