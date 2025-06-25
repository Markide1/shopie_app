import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700">
      <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <a routerLink="/" class="text-white font-bold text-xl">Grand Customs</a>
            </div>
          </div>
          <!-- User Menu -->
          <div class="flex items-center">
            <button (click)="authService.logout()"
                    class="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="bg-gray-800 min-h-screen">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet>
      </div>
    </main>
  `
})
export class AuthLayoutComponent {
  constructor(public authService: AuthService) {}
}