import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUser();
  }

  private loadUser(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.userSubject.next(response.user);
        })
      );
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue();
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  updateProfile(data: UpdateProfileDto): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/profile`, data)
      .pipe(
        tap(user => this.userSubject.next(user)),
        catchError(error => {
          console.error('Error updating profile:', error);
          return throwError(() => error);
        })
      );
  }

  updatePassword(data: UpdatePasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, data)
      .pipe(
        catchError(error => {
          console.error('Error updating password:', error);
          return throwError(() => error);
        })
      );
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }
}