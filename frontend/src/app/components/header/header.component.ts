import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartCount: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cartService.cartCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count: number) => this.cartCount = count);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
